# 🌐 Netbird & Networking Fundamentals — A Complete Practical Guide

> **Goal:** Understand Netbird, networking concepts, and how to build VPN mesh networks with confidence.

---

## 📚 TABLE OF CONTENTS

1. [Networking Foundations (The "Why")](#phase-1-networking-foundations)
2. [Traditional VPN vs. Netbird (The "What")](#phase-2-traditional-vpn-vs-netbird)
3. [How Netbird Works (The "How")](#phase-3-how-netbird-works--deep-dive-with-dry-run)
4. [Hands-On: Installing & Using Netbird](#phase-4-hands-on-commands)
5. [Connecting to Your Project](#phase-5-connecting-to-your-project)
6. [Quick Reference Cheat Sheet](#cheat-sheet)

---

## PHASE 1: Networking Foundations

Before Netbird makes sense, you need to understand the building blocks. This guide uses **real-world analogies** and **dry-run examples** you can actually try.

---

### 🔹 1.1 IP Address — "Who Are You?"

**Analogy:** Your home address. Without it, mail can't reach you.

**Dry Run:**
```bash
# Check YOUR IP address
ip addr show
# or
ifconfig
# or — just the IPs, no noise
hostname -I

# Example output:
# eth0: inet 192.168.1.50/24
```

**What this means:**

- `192.168.1.50` = Your device's unique address on the local network
- `/24` = Subnet mask (explained next)

**Types of IPs:**

| Type | Example | Purpose |
|------|---------|---------|
| Private IP | `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x` | Internal network only (RFC 1918) |
| Public IP | `203.0.113.45` | Visible on the internet |
| Loopback | `127.0.0.1` | Talk to yourself (localhost) |
| CGNAT range | `100.64.0.0/10` | Carrier-grade NAT — **this is what Netbird borrows for its mesh IPs!** |

**More practical examples you can run right now:**

```bash
# 1. Talk to yourself — works even with no network cable
ping -c 2 127.0.0.1

# 2. Find which IP a domain resolves to
dig +short google.com
# 142.250.80.46

# 3. Find YOUR public IP (what the world sees)
curl ifconfig.me

# 4. See which interface would be used to reach a destination
ip route get 8.8.8.8
# 8.8.8.8 via 192.168.1.1 dev eth0 src 192.168.1.50
#                                  ^^^^^^^^^^^^^^^^
#                                  "I will leave from this IP"
```

**Practical exercise — count your devices:**

```bash
# Scan your LAN to see every device with an IP (requires nmap)
sudo nmap -sn 192.168.1.0/24

# Example output:
# Nmap scan report for 192.168.1.1   (router)
# Nmap scan report for 192.168.1.10  (printer)
# Nmap scan report for 192.168.1.50  (your laptop)
# Nmap scan report for 192.168.1.51  (your phone)
```

---

### 🔹 1.2 Subnet — "Your Neighborhood"

**Analogy:** Your apartment building. Everyone in the building can knock on each other's door without going outside.

**Dry Run:**

```bash
# See your subnet
ip route show

# Example output:
# 192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50
```

**Breaking down `192.168.1.0/24`:**

```text
IP:     192.168.1.0
Mask:   /24 = 255.255.255.0

Binary breakdown:
192.168.1. = Network portion (fixed, first 24 bits)
.0-.255    = Host portion (available for devices)

Available IPs: 192.168.1.1 to 192.168.1.254
(.0 = network address, .255 = broadcast — both reserved)
```

**CIDR sizes you'll actually encounter:**

| CIDR | Subnet Mask | Usable Hosts | Typical Use |
|------|-------------|--------------|-------------|
| `/32` | 255.255.255.255 | 1 | A single host (firewall rules, routes) |
| `/30` | 255.255.255.252 | 2 | Point-to-point links between routers |
| `/24` | 255.255.255.0 | 254 | Home / small office LAN |
| `/16` | 255.255.0.0 | 65,534 | Large org network, **Netbird mesh (100.64.0.0/16)** |
| `/8` | 255.0.0.0 | ~16.7M | Entire `10.0.0.0/8` private space |

**Practical exercise — do the subnet math:**

```bash
# Install ipcalc and let it do the math for you
sudo apt install ipcalc
ipcalc 192.168.1.50/24

# Output:
# Network:   192.168.1.0/24
# HostMin:   192.168.1.1
# HostMax:   192.168.1.254
# Broadcast: 192.168.1.255
# Hosts/Net: 254

# Try a trickier one — is 10.0.32.100 in the same subnet as 10.0.33.5?
ipcalc 10.0.32.100/24      # Network: 10.0.32.0/24 → NO, .33.x is outside
ipcalc 10.0.32.100/16      # Network: 10.0.0.0/16  → YES, both inside
```

> ⚠️ **Common real-world bug:** two machines have IPs `10.0.32.100/24` and `10.0.33.5/24` and "can't ping each other" even though they're plugged into the same switch. They're in *different* /24 subnets — either fix the mask to `/16` or add a router between them. This exact class of bug is why static-route scripts (like the BX50 validation scripts) are fragile.

**Practical Example:**

```text
Your Laptop:     192.168.1.50
Your Phone:      192.168.1.51
Your Printer:    192.168.1.10
Your Router:     192.168.1.1

All in the SAME subnet → can talk directly (via ARP + the switch)
```

**What if they're in DIFFERENT subnets?**

```text
Your Laptop:     192.168.1.50
Office Server:   10.0.0.25

Different subnets → NEED a router/gateway to talk
```

```bash
# Prove it: watch ARP for same-subnet, and the gateway for cross-subnet
ip neigh show
# 192.168.1.1  dev eth0 lladdr aa:bb:cc:dd:ee:ff REACHABLE   ← gateway MAC
# 192.168.1.10 dev eth0 lladdr 11:22:33:44:55:66 REACHABLE   ← printer, direct

# Same subnet → kernel ARPs for the device itself
# Different subnet → kernel sends the frame to the GATEWAY's MAC instead
```

---

### 🔹 1.3 Gateway — "The Doorman"

**Analogy:** The doorman at your apartment building. If you want to visit someone in another building, the doorman directs you.

**Dry Run:**

```bash
# See your default gateway
ip route | grep default

# Example output:
# default via 192.168.1.1 dev eth0
```

**What happens when you ping a different subnet:**

```text
You (192.168.1.50) want to reach Server (10.0.0.25)

1. You check: Is 10.0.0.25 in my subnet (192.168.1.0/24)? NO
2. You send the packet to your Gateway (192.168.1.1)
3. Gateway forwards it toward the destination
4. Response comes back the same way
```

**Practical exercise — watch every hop with traceroute:**

```bash
traceroute 8.8.8.8
# 1  192.168.1.1      1.2 ms   ← your gateway (first hop, always)
# 2  100.72.16.1      8.4 ms   ← your ISP (note: CGNAT range!)
# 3  72.14.204.99    15.1 ms   ← ISP backbone
# ...
# 9  8.8.8.8         22.7 ms   ← Google DNS

# Each line = one router your packet passed through.
# Later, traceroute to a Netbird peer shows ONE hop — the tunnel hides the path:
# traceroute 100.64.0.4
# 1  100.64.0.4  35 ms        ← looks directly connected!
```

**Practical exercise — break and fix your routing (in a VM!):**

```bash
# Delete the default route — internet dies instantly
sudo ip route del default

ping -c1 8.8.8.8
# connect: Network is unreachable   ← no doorman, no way out

# Add it back
sudo ip route add default via 192.168.1.1 dev eth0
ping -c1 8.8.8.8   # works again
```

> This is exactly what the BX50 `disable_networking()` function does with
> `route del default gw 10.0.32.1 wlan0` — it fires the doorman so the kiosk
> can't reach anything outside its own subnet.

---

### 🔹 1.4 WAN (Wide Area Network) — "The Highway"

**Analogy:** The highway system connecting cities. Your local roads (LAN) connect to highways (WAN) via on-ramps (routers/gateways).

```text
┌─────────────────┐         ┌─────────────────┐
│   YOUR HOME     │         │   OFFICE        │
│                 │         │                 │
│  Laptop .50     │         │  Server .25     │
│  Phone  .51     │         │  Printer .30    │
│       │         │         │       │         │
│   ┌───┴───┐     │         │   ┌───┴───┐     │
│   │Router │─────┼─WAN─────┼───│Router │     │
│   │.1     │     │         │   │.1     │     │
│   └───┬───┘     │         │   └───┬───┘     │
│  192.168.1.0/24 │         │  10.0.0.0/24    │
└─────────────────┘         └─────────────────┘
```

**Without a VPN:** These two networks can't talk directly. They're on different highways with no connecting road.

**Prove it to yourself:**

```bash
# From home, try to ping the office server's PRIVATE IP
ping -c 2 10.0.0.25
# Destination Host Unreachable (or 100% packet loss)
#
# Why? Private IPs are NOT routable on the internet.
# Your ISP's routers literally drop packets destined for 10.x/192.168.x.
```

---

### 🔹 1.5 Firewall — "The Security Guard"

**Analogy:** A security guard with a checklist. Every packet (visitor) gets checked against rules.

**Dry Run:**

```bash
# See firewall rules (iptables)
sudo iptables -L -v -n

# See firewall rules (ufw - simpler)
sudo ufw status verbose

# Example output:
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere      # SSH
# 80/tcp                     ALLOW       Anywhere      # HTTP
# 443/tcp                    ALLOW       Anywhere      # HTTPS
```

**How a firewall thinks:**

```text
Packet arrives: "Hi, I'm from 203.0.113.45, going to port 22"

Firewall checks rules:
  Rule 1: ALLOW port 22 from ANYWHERE? → YES → LET IT PASS

Packet arrives: "Hi, I'm from 203.0.113.45, going to port 3306 (MySQL)"

Firewall checks rules:
  Rule 1: ALLOW port 3306? → NO
  Rule 2: DENY all others? → YES → DROP PACKET
```

**Default policies matter:**

- `ACCEPT` everything except what's blocked = Permissive
- `DROP` everything except what's allowed = Secure (recommended)

**Practical exercise — write real rules:**

```bash
# Allow SSH only from your office subnet, nothing else
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 10.0.32.0/24 to any port 22 proto tcp
sudo ufw enable

# Allow your AAS API port only over the Netbird interface
sudo ufw allow in on wt0 to any port 8080 proto tcp
# → API is reachable from mesh peers, INVISIBLE from the public internet
```

**Practical exercise — experience a firewall block from both sides:**

```bash
# Terminal 1 (server): start a listener on port 9000
python3 -m http.server 9000

# Terminal 2 (another machine): it works
curl http://192.168.1.50:9000     # → directory listing

# Terminal 1: now block it
sudo ufw deny 9000/tcp

# Terminal 2: try again
curl http://192.168.1.50:9000
# curl: (28) Connection timed out      ← DROP: silently eaten (guard says nothing)
# vs.
# curl: (7) Connection refused         ← REJECT or nothing listening (guard says "no")
```

> 💡 **Debugging gold:** `timeout` usually means a firewall is DROPping you;
> `connection refused` means you reached the host but nothing is listening
> (or the firewall REJECTed). Knowing the difference cuts debugging time in half.

**Check what's actually listening before blaming the firewall:**

```bash
ss -tulpn
# Netid State  Local Address:Port  Process
# tcp   LISTEN 0.0.0.0:22          sshd        ← listening on ALL interfaces
# tcp   LISTEN 127.0.0.1:3306      mysqld      ← localhost ONLY — unreachable
#                                                 remotely no matter what the
#                                                 firewall says!
```

---

### 🔹 1.6 NAT (Network Address Translation) — "The Mail Forwarding Service"

**Analogy:** You live in an apartment building with one main address. The mailroom forwards mail to individual apartments.

**Why NAT exists:**

- IPv4 has ~4.3 billion addresses — not enough for every device
- Your ISP gives you ONE public IP
- Your router uses NAT to let 50 devices share that one IP

**Dry Run — See NAT in action:**

```bash
# See your public IP (what the internet sees)
curl ifconfig.me
# Returns: 203.0.113.45 (your router's public IP)

# See your private IP (what your network sees)
ip addr show eth0
# Returns: 192.168.1.50

# They're DIFFERENT → you are behind NAT. (If they match, you have a
# public IP directly — common on cloud VMs.)
```

**How NAT works:**

```text
Your Laptop (192.168.1.50) wants to visit google.com

1. Laptop sends packet: "From 192.168.1.50:54321 → To 142.250.80.46:443"
2. Router sees: "This is a private IP, I need to translate it"
3. Router rewrites: "From 203.0.113.45:54321 → To 142.250.80.46:443"
4. Google responds to 203.0.113.45:54321
5. Router remembers: "Port 54321 belongs to 192.168.1.50"
6. Router forwards response to your laptop
```

**Watch the translation table live (on a Linux router):**

```bash
sudo conntrack -L | head -5
# tcp 6 431999 ESTABLISHED
#   src=192.168.1.50 dst=142.250.80.46 sport=54321 dport=443      ← inside view
#   src=142.250.80.46 dst=203.0.113.45 sport=443 dport=54321      ← outside view
#
# One line per connection — this IS the NAT table.
```

**The PROBLEM with NAT for VPNs:**

```text
You want to SSH into your home laptop from a coffee shop.

Coffee Shop → Internet → Your Router (203.0.113.45) → ???

Your router gets the packet but:
- "Which device inside should get this?"
- NAT table only tracks OUTGOING connections
- INCOMING connections get dropped (security feature!)

SOLUTION: Port forwarding OR VPN
```

**Practical comparison — port forwarding vs. mesh VPN:**

```text
PORT FORWARDING (the old fix):
  Router config: "external port 2222 → 192.168.1.50:22"
  ssh -p 2222 you@203.0.113.45

  Downsides:
  - One rule per service per device (gets messy fast)
  - Your SSH is now exposed to the ENTIRE internet (bots scan port 2222 too)
  - Breaks when your ISP changes your public IP
  - Impossible if your ISP uses CGNAT (you don't control the outer NAT!)

NETBIRD (the modern fix):
  ssh you@100.64.0.2

  - Zero router config
  - Nothing exposed publicly
  - Survives IP changes and works behind CGNAT
```

**NAT strictness levels (this decides P2P success):**

| NAT Type | Behavior | P2P Hole Punching |
|----------|----------|-------------------|
| Full Cone | Same external port for everyone, accepts from anyone | ✅ Easy |
| Restricted Cone | Same port, but only accepts from IPs you contacted | ✅ Works |
| Port Restricted | Same port, only from exact IP:port you contacted | ✅ Usually works |
| Symmetric | **Different external port per destination** | ❌ Fails → TURN relay |

```bash
# Discover your NAT type
sudo apt install stun-client
stun stun.l.google.com
# "Independent Mapping, Independent Filter"  → cone NAT, P2P will work
# "Dependent Mapping"                        → symmetric NAT, expect Relayed
```

---

### 🔹 1.7 Peer-to-Peer (P2P) — "Calling Your Friend Directly"

**Analogy:** Calling your friend on the phone. You talk directly — no operator in the middle.

**vs. Client-Server:**

```text
CLIENT-SERVER (like visiting a website):
  You → Internet → Google Server → Internet → You

PEER-TO-PEER (like a phone call):
  You ←────────────────────────────→ Your Friend
       Direct connection, no middleman
```

**Feel the difference yourself (two machines on one LAN):**

```bash
# Machine A (192.168.1.50): become a "server" for 60 seconds
python3 -m http.server 8000

# Machine B: connect as a "client"
curl http://192.168.1.50:8000        # works — A chose to listen, B chose to call

# Now reverse it WITHOUT touching machine A:
# Machine B: python3 -m http.server 8000
# Machine A: curl http://192.168.1.51:8000   # also works
#
# On a LAN, every device can be both client AND server.
# P2P VPNs like Netbird recreate this freedom across the internet.
```

**Why P2P is hard on the internet:**

```text
Your Laptop (Home)                    Your Friend's Laptop (Office)
192.168.1.50                          10.0.0.25
    │                                      │
    ▼                                      ▼
Router (NAT)                        Router (NAT)
203.0.113.45                        198.51.100.20

Problem: Both are behind NAT! They can't reach each other directly.
They only know their PRIVATE IPs, not how to reach each other through
the public internet.
```

**This is the EXACT problem Netbird solves.**

---

## PHASE 2: Traditional VPN vs. Netbird

---

### 🔹 2.1 Traditional VPN (Hub-and-Spoke)

**Analogy:** Everyone drives to a central post office to exchange mail.

```text
                    ┌─────────────┐
                    │   VPN       │
                    │  SERVER     │
                    │  (Hub)      │
                    │ 10.8.0.1    │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │ Laptop  │    │  Phone  │    │  Server │
      │10.8.0.2 │    │10.8.0.3 │    │10.8.0.4 │
      └─────────┘    └─────────┘    └─────────┘

Traffic flow: Laptop → VPN Server → Server
              (Even if Laptop and Server are in the same city!)
```

**Problems:**

1. **Slow:** All traffic goes through the central server
2. **Bottleneck:** Server gets overwhelmed
3. **Single point of failure:** Server dies = no VPN
4. **Complex setup:** Certificates, configs, key management

**Real numbers — why the hub hurts:**

```text
Scenario: Laptop in Mumbai, Server in Mumbai, VPN hub in Frankfurt.

Direct path:        Mumbai → Mumbai            ~2 ms
Hub-and-spoke path: Mumbai → Frankfurt → Mumbai ~250 ms  (125x slower!)

And bandwidth: a 100 Mbps hub serving 50 devices = ~2 Mbps each
under load. With mesh P2P, each pair gets their full link speed.
```

---

### 🔹 2.2 Netbird (Mesh Network)

**Analogy:** A group chat where everyone can DM each other directly.

```text
         ┌──────────┐
         │  Laptop  │◄───────────────────┐
         │100.64.0.2│                     │
         └────┬─────┘                     │
              │                           │
              │    Direct P2P             │
              │    when possible          │
              │                           │
    ┌─────────┼─────────┐                 │
    │         │         │                 │
    ▼         ▼         ▼                 │
┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  Phone   │◄┤  Relay   ├►│  Server  │    │
│100.64.0.3│ │(fallback)│ │100.64.0.4│    │
└──────────┘ └──────────┘ └────┬─────┘    │
                               │          │
                               └──────────┘
                               (Direct P2P)
```

**Netbird's Magic:**

1. **Direct P2P when possible** — fast, no bottleneck
2. **Automatic relay fallback** — works even behind strict firewalls
3. **Zero config** — install, login, done
4. **WireGuard encryption** — modern, fast, secure

> 💡 **Important distinction:** Netbird's Management Server only handles
> *coordination* (who's in the network, keys, ACLs). Your actual **data never
> touches it**. Even if the management server goes down, established P2P
> tunnels keep working — only new peers can't join until it's back.

---

### 🔹 2.3 The Technologies Behind Netbird

| Technology | What It Does | Analogy |
|------------|--------------|---------|
| **WireGuard** | Encrypts traffic between peers | Sealed envelope |
| **STUN** | Discovers your public IP/port | "What's my address?" |
| **ICE** | Tries multiple connection methods | Trying front door, back door, window |
| **TURN** | Relays traffic when P2P fails | Using a messenger when you can't meet |
| **NAT Traversal** | Punches holes through routers | Negotiating with doormen |

**Same stack, familiar faces:** this is the *exact* technology combo behind
WhatsApp/Zoom calls (ICE/STUN/TURN for connecting two phones behind NAT) and
Tailscale (WireGuard mesh). Netbird is the open-source, self-hostable take.

---

## PHASE 3: How Netbird Works — Deep Dive with Dry Run

---

### 🎯 Scenario: Connect 3 Devices

```text
┌─────────────────────────────────────────────────────────────┐
│  DEVICE A: Your Laptop (Home)                               │
│  Private IP: 192.168.1.50                                   │
│  Public IP: 203.0.113.45 (behind home router)               │
│                                                             │
│  DEVICE B: AWS Server (Cloud)                               │
│  Public IP: 54.123.45.67 (directly on internet)             │
│                                                             │
│  DEVICE C: Raspberry Pi (Factory - like your BX50)          │
│  Private IP: 10.0.32.100                                    │
│  Public IP: 198.51.100.20 (behind factory firewall)         │
└─────────────────────────────────────────────────────────────┘
```

**Goal:** All 3 devices should talk to each other as if on the same LAN.

---

### Step 1: Install Netbird on All Devices

**Device A (Your Laptop):**

```bash
# Linux
curl -fsSL https://pkgs.netbird.io/install.sh | sh

# macOS
brew install netbirdio/tap/netbird

# Windows
# Download from https://netbird.io/
```

**Device B (AWS Server):**

```bash
curl -fsSL https://pkgs.netbird.io/install.sh | sh
```

**Device C (Raspberry Pi):**

```bash
curl -fsSL https://pkgs.netbird.io/install.sh | sh
```

---

### Step 2: Login & Join the Network

**On each device:**

```bash
sudo netbird up
```

**What happens behind the scenes:**

```text
1. Netbird client starts
2. Generates a WireGuard key pair (public + private)
3. Opens browser for OAuth login (or uses setup key)
4. Registers with Netbird Management Server:

   "Hi, I'm Device A!
    My public WireGuard key: abc123...
    My public IP (from STUN): 203.0.113.45:51234
    My OS: Linux
    Please add me to network 'my-network'"

5. Management Server responds:

   "Welcome! Your Netbird IP is: 100.64.0.2
    Here are the other peers in your network:
    - Device B: 100.64.0.3, public key: xyz789...
    - Device C: 100.64.0.4, public key: def456..."
```

**Verify what just happened on your machine:**

```bash
# A new network interface appeared
ip addr show wt0
# wt0: inet 100.64.0.2/16

# The WireGuard config Netbird built for you (keys, peers, endpoints)
sudo wg show
# interface: wt0
#   public key: abc123...
#   listening port: 51820
# peer: xyz789...                       ← Device B
#   endpoint: 54.123.45.67:51820
#   allowed ips: 100.64.0.3/32
#   latest handshake: 12 seconds ago    ← tunnel is ALIVE
#   transfer: 1.2 MiB received, 800 KiB sent

# Routes Netbird added automatically
ip route show | grep wt0
# 100.64.0.0/16 dev wt0
```

---

### Step 3: Peer Discovery & NAT Traversal (The Magic)

**Device A wants to talk to Device C (Raspberry Pi behind factory firewall):**

```text
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: STUN - "What's my public address?"                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Device A ──► STUN Server (stun.netbird.io)                  │
│  "What's my public IP and port?"                             │
│                                                              │
│  STUN Server responds:                                       │
│  "Your public address is 203.0.113.45:51234"                 │
│                                                              │
│  Device A tells Management Server:                           │
│  "My public endpoint is 203.0.113.45:51234"                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  PHASE 2: ICE - "Let's try to connect directly"              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Device A knows:                                             │
│  - Device C's public key: def456...                          │
│  - Device C's public endpoint: 198.51.100.20:62345           │
│  - Device C's Netbird IP: 100.64.0.4                         │
│                                                              │
│  Device A sends UDP packet to 198.51.100.20:62345            │
│  "Hi Device C, this is Device A, let's establish WireGuard"  │
│                                                              │
│  Device C's firewall: "Hmm, this is unsolicited..."          │
│  Device C ALSO sends UDP packet to 203.0.113.45:51234        │
│  "Hi Device A, this is Device C, let's establish WireGuard"  │
│                                                              │
│  Device A's firewall: "Hmm, this is unsolicited..."          │
│                                                              │
│  BUT! Both firewalls see OUTGOING UDP to those addresses!    │
│  When the response comes back, firewall allows it!           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  THIS IS NAT HOLE PUNCHING!                          │    │
│  │  Both sides send packets OUT, creating a "hole"      │    │
│  │  in their firewalls for return traffic.              │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Result: Direct P2P connection established! 🎉               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**See ICE candidates in real Netbird output:**

```bash
sudo netbird status -d
# peer: raspberry-pi.netbird.cloud
#   ICE candidate (Local): srflx        ← "server reflexive" = my STUN-discovered
#   ICE candidate (Remote): srflx          public address was used

# Candidate types decoded:
#   host  = my actual local IP worked (same LAN, or public IP)  — best
#   srflx = STUN-discovered address worked (hole punch)          — great
#   relay = TURN relay needed                                    — fallback
```

---

### Step 4: When P2P Fails — Relay (TURN)

**Scenario: Factory has a STRICT firewall (symmetric NAT)**

```text
┌──────────────────────────────────────────────────────────────┐
│  STRICT FIREWALL SCENARIO                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Device C's factory firewall is "symmetric NAT":             │
│  - Different public port for EVERY destination               │
│  - Only allows responses from the EXACT destination          │
│                                                              │
│  Device C → STUN Server: uses port 62345                     │
│  Device C → Device A: would need port 62346 (different!)     │
│                                                              │
│  Device A sends to 198.51.100.20:62345                       │
│  But Device C's firewall expects traffic on 62346!           │
│  → P2P FAILS ❌                                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  FALLBACK: TURN Relay Server                         │    │
│  │                                                      │    │
│  │  Device A ──► TURN Relay ◄─── Device C               │    │
│  │                                                      │    │
│  │  Both connect OUT to the relay (firewall allows)     │    │
│  │  Relay forwards traffic between them                 │    │
│  │  Slower, but it WORKS! ✅                            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Measure the difference yourself:**

```bash
# Latency to a P2P peer vs a Relayed peer
ping -c 5 100.64.0.3    # P2P peer:     avg ~15 ms
ping -c 5 100.64.0.4    # Relayed peer: avg ~80 ms (round-trips via relay)

# Throughput test (install iperf3 on both peers)
# On peer:    iperf3 -s
# On laptop:  iperf3 -c 100.64.0.3
# P2P:     ~300-900 Mbps (limited by your actual link)
# Relayed: often 10-50 Mbps (limited by relay capacity)
#
# Rule of thumb: Relayed is fine for SSH/API calls,
# painful for file sync/video.
```

---

### Step 5: WireGuard Encryption

**Once connected (P2P or Relay), all traffic is encrypted:**

```text
┌──────────────────────────────────────────────────────────────┐
│  WIREGUARD ENCRYPTION                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Before WireGuard (plain text):                              │
│  ┌─────────────────────────────────────┐                     │
│  │  SSH packet:                        │                     │
│  │  From: 192.168.1.50                 │                     │
│  │  To: 10.0.32.100                    │                     │
│  │  Data: "ssh user@server"            │                     │
│  └─────────────────────────────────────┘                     │
│                                                              │
│  After WireGuard (encrypted):                                │
│  ┌─────────────────────────────────────┐                     │
│  │  UDP packet:                        │                     │
│  │  From: 203.0.113.45:51234           │                     │
│  │  To: 198.51.100.20:62345            │                     │
│  │  Data: "🔒[encrypted gibberish]"    │                     │
│  └─────────────────────────────────────┘                     │
│                                                              │
│  Even if someone intercepts the packet:                      │
│  - They see UDP traffic between two IPs                      │
│  - They CANNOT see:                                          │
│    * That it's SSH                                           │
│    * The actual content                                      │
│    * The original source/destination IPs                     │
│                                                              │
│  WireGuard uses:                                             │
│  - Curve25519 for key exchange                               │
│  - ChaCha20 for encryption                                   │
│  - Poly1305 for authentication                               │
│  (Same crypto as TLS 1.3, but simpler & faster)              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Prove the encryption with tcpdump:**

```bash
# Terminal 1: watch the PHYSICAL interface (what the internet sees)
sudo tcpdump -i eth0 -X udp port 51820 | head -20
# ...payload is pure binary noise — no readable content, ever.

# Terminal 2: watch the TUNNEL interface (inside the envelope)
sudo tcpdump -i wt0 -A | head -20
# ...here you CAN see plaintext (e.g., HTTP headers to a peer) —
# because wt0 shows traffic AFTER decryption, on your own machine only.

# Generate some traffic to observe:
curl http://100.64.0.3:8080/api/status
```

---

### Step 6: The Result — All Devices on One Virtual Network

```text
┌──────────────────────────────────────────────────────────────┐
│  FINAL NETWORK TOPOLOGY                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Netbird Virtual Network: 100.64.0.0/16                     │
│                                                              │
│   ┌─────────────┐         ┌─────────────┐                    │
│   │  Device A   │◄───────►│  Device B   │                    │
│   │  100.64.0.2 │  P2P    │  100.64.0.3 │                    │
│   │  (Laptop)   │         │  (AWS)      │                    │
│   └──────┬──────┘         └─────────────┘                    │
│          │                                                   │
│          │ P2P or Relay                                      │
│          ▼                                                   │
│   ┌─────────────┐                                            │
│   │  Device C   │                                            │
│   │  100.64.0.4 │                                            │
│   │  (Raspberry)│                                            │
│   └─────────────┘                                            │
│                                                              │
│   From Device A, you can now:                                │
│   $ ssh user@100.64.0.4    ← SSH to Raspberry Pi             │
│   $ curl http://100.64.0.3  ← HTTP to AWS server             │
│   $ ping 100.64.0.3         ← Ping test                      │
│                                                              │
│   All traffic is encrypted and routed automatically!         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Real workflows this unlocks immediately:**

```bash
# 1. Browse a remote dashboard as if it were local
firefox http://100.64.0.3:3000          # Grafana on the AWS box

# 2. rsync files to the factory Pi — no SFTP server exposure needed
rsync -avz ./firmware/ user@100.64.0.4:/opt/firmware/

# 3. Connect to a remote database WITHOUT exposing port 5432 publicly
psql -h 100.64.0.3 -U aas_user aas_db

# 4. VS Code Remote-SSH to any peer
code --remote ssh-remote+user@100.64.0.4 /home/user/project

# 5. Use MagicDNS-style names instead of IPs
ssh user@raspberry-pi.netbird.cloud
```

---

## PHASE 4: Hands-On Commands

---

### 🔹 4.1 Installation

```bash
# One-liner install (Linux)
curl -fsSL https://pkgs.netbird.io/install.sh | sh

# Start the service
sudo netbird service install
sudo netbird service start

# Connect to Netbird Cloud (managed)
sudo netbird up
# → Opens browser for login

# Or use a setup key (for headless servers)
sudo netbird up --setup-key <YOUR-SETUP-KEY>

# Useful flags for fleet devices (like BX50 kiosks):
sudo netbird up --setup-key <KEY> \
  --hostname bx50-factory-07 \          # readable name in the dashboard
  --allow-server-ssh=false              # don't enable Netbird's SSH server
```

**About setup keys (critical for automation):**

```text
Created in the Netbird dashboard → Setup Keys. Two flavors:

  One-off:    valid for ONE device, then dead. Good for manual installs.
  Reusable:   enroll many devices (set usage limit + expiry).
              Perfect for ansible-provisioned fleets.

Pro tips:
  - Attach an auto-group to the key (e.g. "bx50-devices") so every
    kiosk lands in the right ACL group automatically.
  - Mark fleet keys as "ephemeral peer = off" so devices persist
    across reboots.
```

---

### 🔹 4.2 Checking Status

```bash
# See your Netbird status
sudo netbird status

# Example output:
# Daemon version: 0.27.0
# CLI version: 0.27.0
# Management: Connected to api.netbird.io:443
# Signal: Connected to signal.netbird.io:443
# Relays: 2/2 Available
# Nameservers: 0/0 Available
# FQDN: laptop.netbird.cloud
# Netbird IP: 100.64.0.2/16
# Interface type: Kernel
# Quantum resistance: false
# Routes: -
# Peers count: 2/2 Connected
#
#  Peer connection details:
#  peer: aws-server.netbird.cloud
#    Netbird IP: 100.64.0.3
#    Public key: abc123...
#    Status: Connected
#    Conn type: P2P          ← Direct connection! Fast!
#    Direct: true
#    ICE candidate (Local): host
#    ICE candidate (Remote): srflx
#
#  peer: raspberry-pi.netbird.cloud
#    Netbird IP: 100.64.0.4
#    Public key: def456...
#    Status: Connected
#    Conn type: Relayed      ← Through relay, but works!
#    Direct: false
#    Relay server: relay.netbird.io:443
```

**Key things to notice:**

- `Conn type: P2P` = Direct connection, fastest
- `Conn type: Relayed` = Through TURN relay, slower but reliable
- `ICE candidate` = Shows how the connection was established

```bash
# Machine-readable status — perfect for monitoring scripts
sudo netbird status --json | jq '.peers.details[] | {fqdn, status, connType: .connectionType}'

# Example monitoring one-liner: alert if any peer is disconnected
sudo netbird status --json | jq -e '[.peers.details[].status] | all(. == "Connected")' \
  || echo "ALERT: a peer is down!"
```

---

### 🔹 4.3 Testing Connectivity

```bash
# From your laptop, ping the Raspberry Pi
ping 100.64.0.4

# SSH into the AWS server
ssh user@100.64.0.3

# Check which route Netbird uses
ip route get 100.64.0.4
# Should show: dev wt0 (the WireGuard interface)

# See the WireGuard interface
ip addr show wt0
# wt0 = WireGuard TUN interface created by Netbird

# Check the WireGuard handshake directly — the ultimate truth
sudo wg show wt0 latest-handshakes
# def456...  1718185000
# Handshake within last ~2 minutes = tunnel healthy.
# Very old / zero = tunnel dead even if status says "Connected".

# Layer-by-layer test when something "doesn't work":
ping 100.64.0.4                      # 1. Can I reach the peer at all? (L3)
nc -zv 100.64.0.4 8080               # 2. Is the PORT open? (L4)
curl -v http://100.64.0.4:8080/      # 3. Does the SERVICE respond? (L7)
# Failure at step 1 = Netbird/network issue.
# Failure at step 2 = peer's firewall or service not listening.
# Failure at step 3 = the app itself.
```

---

### 🔹 4.4 Debugging Connection Issues

```bash
# Detailed status with debug info
sudo netbird status -d

# View logs
sudo journalctl -u netbird -f

# Check if STUN is working
nc -u stun.l.google.com 19302
# (Should get a response with your public IP)

# Test UDP connectivity
nc -u -v 100.64.0.4 12345

# Force disconnect and reconnect
sudo netbird down
sudo netbird up

# See routing table
ip route show table all | grep wt0
```

**Real troubleshooting scenarios:**

```text
SYMPTOM: "Peers count: 2/2 Connected" but ping fails
  → Check ACL policies in the dashboard — connected ≠ allowed.
    Default policy allows all; custom policies may block ICMP.

SYMPTOM: Everything Relayed, never P2P
  → Both peers behind symmetric NAT (corporate/4G). Try:
    sudo netbird status -d | grep "ICE candidate"
    If both show "relay", check whether UDP outbound is blocked:
    nc -u -v stun.netbird.io 3478

SYMPTOM: SSH works but large file transfers stall
  → Classic MTU problem. WireGuard adds ~60 bytes of overhead.
    Test:  ping -M do -s 1372 100.64.0.4    # 1372 + 28 = 1400
    Fix:   sudo ip link set wt0 mtu 1280    # conservative value

SYMPTOM: netbird up hangs on login (headless device)
  → No browser available. Use a setup key instead:
    sudo netbird up --setup-key <KEY>

SYMPTOM: peer unreachable after laptop sleep/resume
  → Tunnel state went stale. Quick fix:
    sudo netbird down && sudo netbird up
```

---

### 🔹 4.5 Beyond Basics: Subnet Routes, ACLs & Exit Nodes

These three features turn Netbird from "VPN between my devices" into real
infrastructure:

**a) Subnet routing — reach devices that DON'T run Netbird:**

```text
Factory LAN: 10.0.32.0/24
  - BX50 kiosk    10.0.32.100   (runs Netbird ✅)
  - PLC           10.0.32.50    (can't install anything ❌)
  - IP camera     10.0.32.60    (can't install anything ❌)

Solution: make the kiosk a ROUTING PEER for 10.0.32.0/24.

Dashboard → Networks → Add route:
  Network: 10.0.32.0/24, Routing peer: bx50-factory-07

On the kiosk, enable forwarding:
  sudo sysctl -w net.ipv4.ip_forward=1

Now FROM YOUR LAPTOP (anywhere in the world):
  ping 10.0.32.50            # reaches the PLC, via the kiosk!
  vlc rtsp://10.0.32.60/cam  # view the factory camera
```

**b) Access control policies — not everyone should see everything:**

```text
Groups (assigned via setup keys or manually):
  "admins"        → your laptop
  "bx50-devices"  → all factory kiosks
  "servers"       → AAS API + DB servers

Policies:
  admins        → bx50-devices : ALL ports        (full debug access)
  bx50-devices  → servers      : TCP 8080, 443    (API calls only)
  bx50-devices  → bx50-devices : DENY             (kiosks can't see each other!)

This means a compromised kiosk CANNOT reach other kiosks or
SSH into your servers — only the API port it needs.
```

**c) Exit node — route ALL internet traffic via a peer:**

```bash
# Make the AWS server an exit node (dashboard → enable exit node)
# Then on your laptop in a sketchy airport WiFi:
netbird up --exit-node aws-server
curl ifconfig.me     # → 54.123.45.67 (the AWS IP, not the airport's)
# Works like a classic "full tunnel" VPN when you need one.
```

---

### 🔹 4.6 Self-Hosting Netbird (Advanced)

If you don't want to use Netbird's cloud service:

```bash
# Clone the self-hosted repo
git clone https://github.com/netbirdio/netbird.git
cd netbird/infrastructure_files

# Configure
export NETBIRD_DOMAIN="vpn.yourcompany.com"
export NETBIRD_LETSENCRYPT_EMAIL="admin@yourcompany.com"

# Deploy with Docker Compose
./getting-started.sh

# This sets up:
# - Management Server (coordinates peers)
# - Signal Server (helps with P2P negotiation)
# - STUN/TURN Server (for NAT traversal)
# - Dashboard (web UI for managing peers)
# - IDP (Identity Provider for authentication)

# Point clients at YOUR server instead of Netbird Cloud:
sudo netbird up --management-url https://vpn.yourcompany.com:443 \
                --setup-key <KEY>
```

**Self-hosting requirements checklist:**

```text
□ A VM with a PUBLIC IP (the one machine that must NOT be behind NAT)
□ DNS A record: vpn.yourcompany.com → that IP
□ Open ports: 443/tcp (mgmt+signal+dashboard), 3478/udp (STUN),
              49152-65535/udp (TURN relay range)
□ ~2 GB RAM is plenty for hundreds of peers (coordination is cheap —
  remember, peer data traffic doesn't flow through it unless relayed)
```

---

## PHASE 5: Connecting to Your Project

---

### 🔹 5.1 Your Current Setup (from ansible analysis)

From your `aas-ansible` roles:

```bash
# In cloudLinkValidation.sh.j2 and obtValidation.sh.j2:

enable_networking() {
    # Replace resolv.conf
    # Add static routes for required subnets
}

disable_networking() {
    route del default gw 10.0.32.1 wlan0
}

# VPN toggle:
vpn_output=$(sudo -u scuser -i bash -x -c "${QC_RUNNER} -v \"enable\"" 2>&1)
```

**What this does currently:**

1. Enables/disables network connectivity on BX50 devices
2. Manages static routes to specific subnets
3. Toggles VPN via a custom `QC_RUNNER` script

---

### 🔹 5.2 How Netbird Could Enhance Your Setup

```text
CURRENT APPROACH (Traditional VPN):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  BX50 Device (Factory)          AAS API Server (Cloud)      │
│  10.0.32.100                    54.123.45.67                │
│       │                               │                     │
│       │    VPN Tunnel                 │                     │
│       │    (QC_RUNNER managed)        │                     │
│       │                               │                     │
│       └──────────► VPN Server ◄───────┘                     │
│                    (Central hub)                            │
│                                                             │
│  Problems:                                                  │
│  - All traffic through VPN server                           │
│  - Manual route management                                  │
│  - Single point of failure                                  │
│  - Complex QC_RUNNER scripts                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

WITH NETBIRD (Mesh):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  BX50 Device (Factory)          AAS API Server (Cloud)      │
│  Netbird IP: 100.64.0.10        Netbird IP: 100.64.0.20     │
│       │◄──────────────────────────────►│                    │
│       │         Direct P2P             │                    │
│       │         (auto-established)     │                    │
│       │                                │                    │
│       │◄──────────► UI Server          │                    │
│       │         (another peer)         │                    │
│       │                                │                    │
│                                                             │
│  Benefits:                                                  │
│  - Direct connections between peers                         │
│  - No central VPN server bottleneck                         │
│  - Automatic route management                               │
│  - Self-healing (reconnects automatically)                  │
│  - Simple: install netbird, done                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.3 Practical Migration Example

**Current ansible task (simplified):**

```yaml
# Current: Managing VPN manually
- name: Enable VPN
  shell: |
    /opt/qc_runner -v "enable"
    ip route add 10.0.0.0/8 via 10.0.32.1
    ip route add 172.16.0.0/12 via 10.0.32.1
```

**With Netbird (simplified):**

```yaml
# New: Netbird handles everything
- name: Install Netbird
  shell: |
    curl -fsSL https://pkgs.netbird.io/install.sh | sh
  args:
    creates: /usr/bin/netbird          # idempotent — skip if installed

- name: Start Netbird with setup key
  shell: |
    netbird up --setup-key "{{ netbird_setup_key }}" \
               --hostname "bx50-{{ inventory_hostname }}"
  become: true

# That's it! Netbird auto-discovers peers and routes
# No manual route management needed
```

**The "enable/disable networking" workflow, reimagined:**

```bash
# QC validation scripts could replace route surgery with:
netbird up      # device joins mesh → cloud link validation can run
netbird down    # device leaves mesh → isolated again
# One command each way, no resolv.conf swapping, no route bookkeeping,
# and `netbird status --json` gives the QC script a clean pass/fail signal:
netbird status --json | jq -e '.management.connected' && echo "CLOUD LINK OK"
```

**Accessing your API from BX50:**

```bash
# Before (traditional VPN):
curl http://10.0.0.25:8080/api/status
# (Had to know internal IP, manage routes)

# After (Netbird):
curl http://aas-api.netbird.cloud:8080/api/status
# OR using Netbird IP:
curl http://100.64.0.20:8080/api/status
# (Netbird handles DNS and routing automatically)
```

**Bonus: fleet operations that become trivial:**

```bash
# SSH into ANY factory kiosk from your desk — no jump hosts:
ssh scuser@bx50-factory-07.netbird.cloud

# Push a config to every kiosk via ansible OVER the mesh
# (inventory just lists netbird FQDNs — works regardless of which
#  factory/NAT each device sits behind):
ansible -i 'bx50-factory-07.netbird.cloud,bx50-factory-08.netbird.cloud,' \
        all -m copy -a "src=app.conf dest=/opt/aas/app.conf"

# Tail provisioning logs from a kiosk live, during a support call:
ssh scuser@bx50-factory-07.netbird.cloud 'tail -f /var/log/aas/provision.log'

# Scrape kiosk metrics into Prometheus — every peer is a stable target:
#   - targets: ['100.64.0.10:9100', '100.64.0.11:9100']
```

---

## CHEAT SHEET

---

### Quick Commands

```bash
# Install
curl -fsSL https://pkgs.netbird.io/install.sh | sh

# Connect / disconnect
sudo netbird up
sudo netbird up --setup-key <KEY>      # headless / fleet devices
sudo netbird down

# Status
sudo netbird status
sudo netbird status -d                 # detailed (ICE candidates etc.)
sudo netbird status --json | jq        # for scripts/monitoring

# Service management
sudo netbird service start
sudo netbird service stop
sudo netbird service restart

# Logs
sudo journalctl -u netbird -f

# See peers
sudo netbird status | grep -A 10 "Peer connection"

# Tunnel internals
sudo wg show                           # handshakes, transfer counters
ip addr show wt0                       # the mesh interface
ip route get <netbird-ip>              # confirm traffic uses wt0

# Test connectivity (layer by layer)
ping <netbird-ip>                      # L3 reachability
nc -zv <netbird-ip> <port>             # L4 port open?
curl -v http://<netbird-ip>:<port>/    # L7 service responding?
```

### Diagnostic Decoder Ring

| You see... | It means... | Do this |
|------------|-------------|---------|
| `Conn type: P2P` | Direct tunnel — best case | Nothing 🎉 |
| `Conn type: Relayed` | Symmetric NAT somewhere | Check UDP outbound, accept relay, or fix NAT |
| `curl: Connection timed out` | Firewall DROPping | Check ufw/iptables/ACL policies |
| `curl: Connection refused` | Reached host, no listener | Check the service + `ss -tulpn` |
| `wg show` handshake very old | Tunnel silently dead | `netbird down && netbird up` |
| ping OK, big transfers stall | MTU too large | `ip link set wt0 mtu 1280` |
| Connected peers, ping blocked | Netbird ACL policy | Review dashboard policies |

### Key Concepts Quick Reference

| Term | One-Liner | Netbird Context |
|------|-----------|-----------------|
| **IP** | Device's address | Netbird assigns `100.64.x.x` |
| **Subnet** | Group of IPs | `100.64.0.0/16` is your mesh |
| **Gateway** | Traffic director | Netbird manages this automatically |
| **WAN** | The internet | Netbird rides on top of WAN |
| **Firewall** | Traffic filter | Netbird uses UDP hole punching |
| **NAT** | IP sharing | Netbird's STUN discovers public IPs |
| **P2P** | Direct connection | Netbird prefers this for speed |
| **VPN** | Virtual private network | Netbird is a mesh VPN |
| **WireGuard** | Encryption protocol | Netbird uses this under the hood |
| **STUN** | "What's my IP?" | Netbird uses this for NAT discovery |
| **TURN** | Traffic relay | Netbird fallback when P2P fails |
| **ICE** | Connection negotiator | Tries host → srflx → relay candidates |
| **Setup key** | Pre-auth token | Headless/fleet enrollment (ansible!) |
| **Routing peer** | LAN gateway into mesh | Reach PLCs/cameras that can't run Netbird |
| **Exit node** | Full-tunnel gateway | Route all internet traffic via a peer |

---

## 🧠 REMEMBER THIS

> **Netbird = WireGuard (encryption) + ICE/STUN/TURN (NAT traversal) + Management Server (coordination)**

The result: **Install on any device, anywhere in the world, and they can talk securely as if on the same LAN.**

No port forwarding. No static routes. No central server bottleneck. It just works.

And the management server only *coordinates* — your data flows peer-to-peer,
so even a management outage doesn't break established tunnels.

---

*Generated for understanding Netbird and networking fundamentals with practical examples.*
