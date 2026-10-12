/* =====================================================================
   Netbird Academy — Level & Game Content
   Source material: aas-docs/netbird-networking-fundamentals.md
   ===================================================================== */

const RANKS = [
  { xp: 0,    name: 'Packet Newbie',    icon: '🐣' },
  { xp: 150,  name: 'Subnet Scout',     icon: '🔍' },
  { xp: 300,  name: 'Route Ranger',     icon: '🧭' },
  { xp: 450,  name: 'Firewall Warden',  icon: '🛡️' },
  { xp: 600,  name: 'NAT Wrangler',     icon: '🔀' },
  { xp: 750,  name: 'Tunnel Digger',    icon: '⛏️' },
  { xp: 900,  name: 'P2P Pathfinder',   icon: '🛰️' },
  { xp: 1050, name: 'Mesh Master',      icon: '🕸️' },
  { xp: 1400, name: 'Netbird Legend',   icon: '👑' },
  { xp: 1850, name: 'BX50 Whisperer',   icon: '🏭' },
  { xp: 2300, name: 'AAS Field Engineer', icon: '🛰️' },
];

const LEVELS = [

  /* ================= LEVEL 1 ================= */
  {
    id: 'ip',
    icon: '🏠',
    title: 'Who Are You? — IP Addresses',
    badge: 'IP Identifier',
    lesson: [
      `<h3>🏠 An IP address is your home address</h3>
       <p>Without it, mail (packets) can't reach you. Every device on a network
       has one, and <b>which range</b> an IP falls in tells you a lot:</p>
       <table>
         <tr><th>Type</th><th>Range</th><th>Purpose</th></tr>
         <tr><td>Private</td><td><code>192.168.x.x</code> · <code>10.x.x.x</code> · <code>172.16–31.x.x</code></td><td>Internal networks only (RFC 1918)</td></tr>
         <tr><td>Public</td><td>everything routable, e.g. <code>203.0.113.45</code></td><td>Visible on the internet</td></tr>
         <tr><td>Loopback</td><td><code>127.0.0.1</code></td><td>Talk to yourself (localhost)</td></tr>
         <tr><td>CGNAT</td><td><code>100.64.0.0/10</code></td><td>Carrier-grade NAT — <b>Netbird borrows this range for its mesh IPs!</b></td></tr>
       </table>`,
      `<h3>🔧 Commands to remember</h3>
       <pre>ip addr show        # my local IP(s)
curl ifconfig.me    # my PUBLIC IP (what the world sees)
ping 127.0.0.1      # talk to yourself — works with no network
ip route get 8.8.8.8  # "which IP will I leave from?"</pre>
       <p>⚠️ Watch out for the classic trap: <code>172.32.x.x</code> looks private
       but isn't — the private block stops at <code>172.31.255.255</code>.</p>`,
    ],
    stages: [
      {
        type: 'bins',
        title: 'IP Sorter',
        instructions: 'Drag each IP address into the correct bin (or tap an IP, then tap a bin).',
        bins: [
          { id: 'private',  label: '🏢 Private (RFC 1918)' },
          { id: 'public',   label: '🌍 Public' },
          { id: 'loopback', label: '🪞 Loopback' },
          { id: 'cgnat',    label: '🕸️ CGNAT / Netbird mesh' },
        ],
        items: [
          { text: '192.168.1.50',  bin: 'private',  explain: '192.168.0.0/16 is private — the classic home LAN range.' },
          { text: '10.0.32.100',   bin: 'private',  explain: '10.0.0.0/8 is private — your factory BX50 kiosks live here.' },
          { text: '172.16.5.9',    bin: 'private',  explain: '172.16.0.0 – 172.31.255.255 is the third private block.' },
          { text: '172.32.1.1',    bin: 'public',   explain: 'Gotcha! The private block ends at 172.31.x.x — 172.32 is PUBLIC.' },
          { text: '8.8.8.8',       bin: 'public',   explain: 'Google DNS — a public, internet-routable IP.' },
          { text: '203.0.113.45',  bin: 'public',   explain: 'A public IP — what your router shows to the world.' },
          { text: '127.0.0.1',     bin: 'loopback', explain: 'localhost — packets never leave your machine.' },
          { text: '100.64.0.2',    bin: 'cgnat',    explain: '100.64.0.0/10 is the CGNAT range — Netbird assigns mesh IPs from here.' },
          { text: '100.99.1.7',    bin: 'cgnat',    explain: 'Still inside 100.64.0.0/10 (100.64.0.0 – 100.127.255.255).' },
        ],
      },
      {
        type: 'quiz',
        title: 'IP Quick-fire',
        questions: [
          {
            q: 'Which command shows the public IP the rest of the internet sees for you?',
            choices: ['curl ifconfig.me', 'ip addr show', 'ping 127.0.0.1', 'hostname -I'],
            answer: 0,
            explain: '`ip addr` / `hostname -I` show your LOCAL IPs. Only asking an outside service (ifconfig.me) reveals the public IP after NAT.',
          },
          {
            q: 'Netbird gives every peer an IP like 100.64.0.2. Why that range?',
            choices: [
              'It borrows the CGNAT range 100.64.0.0/10, which never collides with home/office LANs',
              'It is a special range reserved for VPNs by the IETF',
              'Those are public IPs Netbird rents from ISPs',
              'It is randomly generated per install',
            ],
            answer: 0,
            explain: 'CGNAT space (100.64.0.0/10) is never used on normal LANs, so mesh IPs won\'t conflict with 192.168.x.x or 10.x.x.x networks.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Three Quick Checks',
        instructions: 'Drag the right token into each blank to complete these everyday diagnostic commands.',
        template: '# 1. Talk to yourself (works with no network)\nping {0}\n\n# 2. What the whole internet sees as your IP\ncurl {1}\n\n# 3. Which source IP will I use to reach Google?\nip route get {2}',
        blanks: [
          { answer: '127.0.0.1', explain: 'Loopback — the packet never leaves your machine.' },
          { answer: 'ifconfig.me', explain: 'Asks an outside service to echo back your post-NAT public IP.' },
          { answer: '8.8.8.8', explain: 'The kernel reveals which interface and source IP it would use to reach this destination.' },
        ],
        tokens: ['127.0.0.1', 'ifconfig.me', '8.8.8.8', '192.168.1.1', 'localhost', '255.255.255.0'],
      },
      {
        type: 'match',
        bonus: true,
        title: 'Good to Know — Command Toolbox',
        instructions: 'Bonus round! Match each command to what it tells you.',
        pairs: [
          { left: 'dig +short google.com', right: 'Resolve a domain name to its IP', explain: 'DNS lookup without the noise — a great first move when "the internet is down".' },
          { left: 'ip route get 8.8.8.8', right: '"Which interface and source IP will I leave from?"', explain: 'The kernel reveals its routing decision — gold on machines with eth0, wlan0 AND wt0.' },
          { left: 'sudo nmap -sn 192.168.1.0/24', right: 'Discover every device on your LAN', explain: 'A ping scan: router, printer, phone, laptop — count your neighbors.' },
          { left: 'ping -c 2 127.0.0.1', right: 'Test your own network stack — works with no cable', explain: 'Loopback never leaves the machine. If THIS fails, the problem is local.' },
          { left: 'hostname -I', right: 'Just my local IP(s), nothing else', explain: 'The minimal answer to "what\'s my IP here?" — compare with `curl ifconfig.me` to spot NAT.' },
        ],
      },
    ],
  },

  /* ================= LEVEL 2 ================= */
  {
    id: 'subnet',
    icon: '🏘️',
    title: 'Your Neighborhood — Subnets & CIDR',
    badge: 'Subnet Surveyor',
    lesson: [
      `<h3>🏘️ A subnet is your apartment building</h3>
       <p>Everyone inside can knock on each other's door directly. To visit
       another building you need the doorman (gateway).</p>
       <pre>192.168.1.0<b>/24</b>
└─ first 24 bits fixed = network  → 192.168.1.*
└─ last 8 bits free   = hosts    → .1 to .254
   (.0 = network address, .255 = broadcast — reserved)</pre>`,
      `<h3>📏 CIDR sizes you'll actually meet</h3>
       <table>
         <tr><th>CIDR</th><th>Usable hosts</th><th>Typical use</th></tr>
         <tr><td><code>/32</code></td><td>1</td><td>A single host (firewall rules, routes)</td></tr>
         <tr><td><code>/24</code></td><td>254</td><td>Home / small office LAN</td></tr>
         <tr><td><code>/16</code></td><td>65,534</td><td><b>Netbird mesh (100.64.0.0/16)</b></td></tr>
         <tr><td><code>/8</code></td><td>~16.7M</td><td>All of 10.0.0.0/8</td></tr>
       </table>
       <p>⚠️ <b>Real-world bug:</b> <code>10.0.32.100/24</code> and <code>10.0.33.5/24</code>
       on the same switch <i>can't ping each other</i> — different /24 subnets.
       Fix the mask to /16 or add a router.</p>`,
    ],
    stages: [
      {
        type: 'bins',
        title: 'Same Building?',
        instructions: 'Your kiosk is <b>10.0.32.100/24</b>. Sort each IP: can it talk to the kiosk directly (same subnet) or does it need a router?',
        bins: [
          { id: 'same', label: '✅ Same subnet (direct talk)' },
          { id: 'diff', label: '🚧 Different subnet (needs router)' },
        ],
        items: [
          { text: '10.0.32.1',      bin: 'same', explain: '10.0.32.x with /24 → same network 10.0.32.0/24. (This is the gateway itself!)' },
          { text: '10.0.32.254',    bin: 'same', explain: 'Last usable host of 10.0.32.0/24 — same building.' },
          { text: '10.0.32.50',     bin: 'same', explain: '10.0.32.x → same /24 subnet, direct ARP + switch.' },
          { text: '10.0.33.5',      bin: 'diff', explain: 'The 3rd octet differs → 10.0.33.0/24 is a DIFFERENT /24. The classic "same switch, can\'t ping" bug.' },
          { text: '10.1.32.100',    bin: 'diff', explain: '10.1.x.x is outside 10.0.32.0/24 — needs routing.' },
          { text: '192.168.32.100', bin: 'diff', explain: 'Completely different private range — definitely needs a router.' },
        ],
      },
      {
        type: 'quiz',
        title: 'CIDR Math',
        questions: [
          {
            q: 'How many usable host IPs are in a /24 subnet?',
            choices: ['254', '256', '255', '65,534'],
            answer: 0,
            explain: '256 total minus .0 (network) and .255 (broadcast) = 254 usable.',
          },
          {
            q: 'What is the network address of 10.0.32.100/16?',
            choices: ['10.0.0.0', '10.0.32.0', '10.0.32.100', '10.0.255.0'],
            answer: 0,
            explain: '/16 fixes only the first two octets → network is 10.0.0.0/16. That\'s why /16 makes 10.0.32.x and 10.0.33.x neighbors.',
          },
          {
            q: 'Two machines, 10.0.32.100/24 and 10.0.33.5/24, are on the same switch but can\'t ping each other. Why?',
            choices: [
              'They are in different /24 subnets — fix the mask to /16 or add a router',
              'The switch is broken',
              'ICMP is always blocked between private IPs',
              'They need public IPs to communicate',
            ],
            answer: 0,
            explain: 'Each machine thinks the other is outside its network and tries to use a gateway. Same cable ≠ same subnet!',
          },
          {
            q: 'In a firewall rule, what does a /32 suffix mean?',
            choices: [
              'Exactly one host',
              'The whole internet',
              '32 hosts',
              'A subnet of 32 networks',
            ],
            answer: 0,
            explain: '/32 = all 32 bits fixed = a single IP. Netbird uses this in WireGuard "allowed ips: 100.64.0.3/32".',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Subnet the Kiosk',
        instructions: 'The BX50 kiosk is 10.0.32.100/24. Drag the correct value into each subnet fact.',
        template: 'IP / mask:         10.0.32.100/24\n\nNetwork address:   {0}\nFirst usable host: {1}\nBroadcast:         {2}\nUsable hosts:      {3}',
        blanks: [
          { answer: '10.0.32.0', explain: '/24 fixes the first three octets → network is 10.0.32.0.' },
          { answer: '10.0.32.1', explain: 'First usable host (often the gateway itself).' },
          { answer: '10.0.32.255', explain: 'Broadcast address — reserved, not assignable to a device.' },
          { answer: '254', explain: '256 total − network − broadcast = 254 usable hosts.' },
        ],
        tokens: ['10.0.32.0', '10.0.32.1', '10.0.32.255', '254', '10.0.32.100', '256', '10.0.33.0'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — Subnet Secrets',
        questions: [
          {
            q: 'What is the broadcast address of 192.168.1.0/24?',
            choices: ['192.168.1.255', '192.168.1.0', '192.168.1.1', '192.168.255.255'],
            answer: 0,
            explain: '.0 = network address, .255 = broadcast — both reserved, which is why a /24 has 254 (not 256) usable hosts.',
          },
          {
            q: 'Which tool does all the subnet math for you?',
            choices: ['ipcalc', 'iptables', 'ifconfig', 'ipset'],
            answer: 0,
            explain: '`ipcalc 192.168.1.50/24` prints Network, HostMin, HostMax, Broadcast and host count — no binary in your head needed.',
          },
          {
            q: 'What is a /30 subnet (2 usable hosts) typically used for?',
            choices: [
              'Point-to-point links between two routers',
              'Home WiFi networks',
              'Loopback addresses',
              'DNS servers',
            ],
            answer: 0,
            explain: 'Exactly two devices need to talk — one IP each. No reason to waste a bigger block.',
          },
          {
            q: 'Netbird\'s mesh is 100.64.0.0/16. How many peers could it address?',
            choices: ['65,534', '254', '~16.7 million', '1,024'],
            answer: 0,
            explain: 'A /16 leaves 16 host bits → 65,536 − 2 reserved = 65,534. Plenty of kiosks.',
          },
        ],
      },
    ],
  },

  /* ================= LEVEL 3 ================= */
  {
    id: 'gateway',
    icon: '🚪',
    title: 'The Doorman — Gateways & Routing',
    badge: 'Route Ranger',
    lesson: [
      `<h3>🚪 The gateway is your building's doorman</h3>
       <p>Want to visit someone in another building? The doorman directs you.
       Want to reach another subnet? Your packet goes to the gateway.</p>
       <pre>ip route | grep default
# default via 192.168.1.1 dev eth0   ← the doorman</pre>
       <p>Delete the default route and the internet dies instantly —
       this is literally what the BX50 <code>disable_networking()</code> does with
       <code>route del default gw 10.0.32.1 wlan0</code>: it fires the doorman.</p>`,
      `<h3>👣 Watch every hop</h3>
       <pre>traceroute 8.8.8.8
# 1  192.168.1.1    ← your gateway (ALWAYS hop 1)
# 2  100.72.16.1    ← your ISP (CGNAT range!)
# ...
# 9  8.8.8.8        ← destination

traceroute 100.64.0.4   # a Netbird peer
# 1  100.64.0.4     ← ONE hop — the tunnel hides the path!</pre>`,
    ],
    stages: [
      {
        type: 'order',
        title: 'Route the Packet',
        instructions: 'Your laptop (192.168.1.50/24) pings the office server (10.0.0.25). Build the journey — pick what happens <b>next</b> at each step.',
        steps: [
          { text: 'Laptop checks: is 10.0.0.25 inside my subnet 192.168.1.0/24? → NO', explain: 'Every packet starts with this subnet membership test.' },
          { text: 'Laptop looks up its default route → "via 192.168.1.1"', explain: 'Different subnet means: ask the doorman.' },
          { text: 'Laptop ARPs for the GATEWAY\'s MAC and hands it the frame', explain: 'Cross-subnet traffic is framed to the gateway\'s MAC, not the destination\'s.' },
          { text: 'Routers forward the packet hop by hop toward 10.0.0.0/24', explain: 'Each router repeats the same routing decision — that\'s what traceroute shows.' },
          { text: 'Server replies, and the response retraces the path back', explain: 'Routing works both ways — the reply needs a valid route home too.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Doorman Drills',
        questions: [
          {
            q: 'You run `sudo ip route del default` and then `ping 8.8.8.8`. What happens?',
            choices: [
              '"Network is unreachable" — no doorman, no way out',
              'Ping works but slower',
              'Only DNS breaks',
              'The gateway auto-recreates itself',
            ],
            answer: 0,
            explain: 'No default route = the kernel has no idea where to send non-local packets. Local subnet still works though!',
          },
          {
            q: 'What is ALWAYS the first hop in a traceroute from your laptop?',
            choices: ['Your default gateway', 'Your ISP', 'A DNS server', 'The destination'],
            answer: 0,
            explain: 'Hop 1 is your own gateway — if even that fails, the problem is local.',
          },
          {
            q: 'traceroute to a Netbird peer (100.64.0.4) shows just ONE hop. Why?',
            choices: [
              'The WireGuard tunnel hides the real path — the peer looks directly connected',
              'The peer is on your LAN',
              'Traceroute is broken over VPNs',
              'Netbird blocks ICMP',
            ],
            answer: 0,
            explain: 'Inside the tunnel, the peer is one virtual hop away — the encrypted path underneath may be 15 real hops.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Restore the Default Route',
        instructions: 'A kiosk lost its doorman and the internet is dead. Rebuild and verify the default route over WiFi.',
        template: '# Re-add the default route (the doorman):\nroute add default gw {0} {1}\n\n# Confirm it is back:\nip route | grep {2}',
        blanks: [
          { answer: '10.0.32.1', explain: 'The gateway IP — where non-local packets get sent.' },
          { answer: 'wlan0', explain: 'The WiFi interface the route is attached to.' },
          { answer: 'default', explain: 'Filter the routing table for the default route line.' },
        ],
        tokens: ['10.0.32.1', 'wlan0', 'default', 'eth0', '192.168.1.1', 'gateway'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — Under the Hood',
        questions: [
          {
            q: 'What does `ip neigh show` display?',
            choices: [
              'The ARP table — which MAC address belongs to which IP',
              'Your neighboring WiFi networks',
              'The routing table',
              'Open ports on nearby hosts',
            ],
            answer: 0,
            explain: 'Same-subnet traffic ARPs for the device itself; cross-subnet traffic shows the GATEWAY\'s MAC instead.',
          },
          {
            q: 'For cross-subnet traffic, the Ethernet frame is addressed to whose MAC?',
            choices: [
              'The gateway\'s MAC — not the final destination\'s',
              'The destination server\'s MAC',
              'The broadcast MAC ff:ff:ff:ff:ff:ff',
              'No MAC is used across subnets',
            ],
            answer: 0,
            explain: 'IPs name the destination; MACs name the next hop. The doorman carries it from there.',
          },
          {
            q: 'Hop 2 of your traceroute shows 100.72.16.1. What does that reveal?',
            choices: [
              'Your ISP uses CGNAT (100.64.0.0/10) — you share a public IP with other customers',
              'You are being routed through Netbird',
              'Your router is misconfigured',
              'You have a public IP',
            ],
            answer: 0,
            explain: 'Same range Netbird borrows! CGNAT at the ISP also means port forwarding at home won\'t work — a mesh VPN will.',
          },
          {
            q: 'After `route del default` (like BX50\'s disable_networking), what STILL works?',
            choices: [
              'Talking to your own subnet — the local LAN link stays alive',
              'Nothing at all',
              'Only DNS',
              'Only HTTPS',
            ],
            answer: 0,
            explain: 'Deleting the default route fires the doorman, but neighbors in the building still answer. That\'s how the kiosk stays isolated yet locally reachable.',
          },
        ],
      },
    ],
  },

  /* ================= LEVEL 4 ================= */
  {
    id: 'firewall',
    icon: '🛡️',
    title: 'The Security Guard — Firewalls',
    badge: 'Firewall Warden',
    lesson: [
      `<h3>🛡️ A firewall is a guard with a checklist</h3>
       <p>Every packet (visitor) gets checked against rules, top to bottom.
       The <b>default policy</b> matters most:</p>
       <ul>
         <li><code>ACCEPT</code> everything except what's blocked = permissive 😬</li>
         <li><code>DROP</code> everything except what's allowed = secure ✅</li>
       </ul>
       <pre>sudo ufw default deny incoming
sudo ufw allow from 10.0.32.0/24 to any port 22 proto tcp
sudo ufw allow in on wt0 to any port 8080 proto tcp
# → API reachable from Netbird mesh peers,
#   INVISIBLE from the public internet</pre>`,
      `<h3>💡 Debugging gold</h3>
       <table>
         <tr><th>Symptom</th><th>Meaning</th></tr>
         <tr><td><code>Connection timed out</code></td><td>Firewall is <b>DROP</b>ping you (guard says nothing)</td></tr>
         <tr><td><code>Connection refused</code></td><td>You reached the host but nothing is listening (or REJECT)</td></tr>
       </table>
       <pre>ss -tulpn
# tcp LISTEN 0.0.0.0:22     sshd    ← all interfaces
# tcp LISTEN 127.0.0.1:3306 mysqld  ← localhost ONLY —
#   unreachable remotely no matter what the firewall says!</pre>`,
    ],
    stages: [
      {
        type: 'quiz',
        title: 'Firewall Guard — You Decide',
        questions: [
          {
            context: 'YOUR RULES (default: DENY incoming)\n1. ALLOW tcp/22  from 10.0.32.0/24\n2. ALLOW tcp/8080 in on wt0 (Netbird interface)',
            q: '📦 Packet: from 10.0.32.7 → tcp/22 (SSH) via eth0',
            choices: ['✅ ALLOW', '❌ DROP'],
            answer: 0,
            explain: 'Rule 1 matches: SSH from the office subnet 10.0.32.0/24 is allowed.',
          },
          {
            context: 'YOUR RULES (default: DENY incoming)\n1. ALLOW tcp/22  from 10.0.32.0/24\n2. ALLOW tcp/8080 in on wt0 (Netbird interface)',
            q: '📦 Packet: from 203.0.113.45 (internet) → tcp/22 (SSH)',
            choices: ['❌ DROP', '✅ ALLOW'],
            answer: 0,
            explain: 'Rule 1 only allows SSH from 10.0.32.0/24. Internet bots scanning port 22 hit the default DENY.',
          },
          {
            context: 'YOUR RULES (default: DENY incoming)\n1. ALLOW tcp/22  from 10.0.32.0/24\n2. ALLOW tcp/8080 in on wt0 (Netbird interface)',
            q: '📦 Packet: from mesh peer 100.64.0.3 → tcp/8080 via wt0',
            choices: ['✅ ALLOW', '❌ DROP'],
            answer: 0,
            explain: 'Rule 2 matches: port 8080 is open on the Netbird interface — mesh peers can reach the API.',
          },
          {
            context: 'YOUR RULES (default: DENY incoming)\n1. ALLOW tcp/22  from 10.0.32.0/24\n2. ALLOW tcp/8080 in on wt0 (Netbird interface)',
            q: '📦 Packet: from 198.51.100.9 (internet) → tcp/8080 via eth0',
            choices: ['❌ DROP', '✅ ALLOW'],
            answer: 0,
            explain: 'Port 8080 is only allowed ON wt0. Via eth0 it hits default DENY — the API is invisible to the public internet.',
          },
          {
            context: 'YOUR RULES (default: DENY incoming)\n1. ALLOW tcp/22  from 10.0.32.0/24\n2. ALLOW tcp/8080 in on wt0 (Netbird interface)',
            q: '📦 Packet: from mesh peer 100.64.0.3 → tcp/3306 (MySQL) via wt0',
            choices: ['❌ DROP', '✅ ALLOW'],
            answer: 0,
            explain: 'No rule allows 3306 anywhere — even trusted mesh peers hit the default DENY. Least privilege!',
          },
        ],
      },
      {
        type: 'quiz',
        title: 'Guard Wisdom',
        questions: [
          {
            q: '`curl` returns "Connection timed out". Most likely cause?',
            choices: [
              'A firewall is silently DROPping your packets',
              'Nothing is listening on that port',
              'DNS is broken',
              'The server is overloaded',
            ],
            answer: 0,
            explain: 'Timeout = packets eaten silently = DROP. "Connection refused" would mean you reached the host.',
          },
          {
            q: 'The firewall allows port 3306, but remote clients still can\'t connect to MySQL. `ss -tulpn` shows `127.0.0.1:3306`. Why?',
            choices: [
              'MySQL is bound to localhost only — unreachable remotely regardless of firewall',
              'The firewall rule is wrong',
              'MySQL needs UDP too',
              'Port 3306 is reserved',
            ],
            answer: 0,
            explain: 'Binding beats firewall: a service listening on 127.0.0.1 never sees remote packets at all. Check `ss -tulpn` BEFORE blaming the firewall.',
          },
          {
            q: 'Which default policy combo is the secure recommendation?',
            choices: [
              'Deny incoming, allow outgoing',
              'Allow incoming, deny outgoing',
              'Allow everything, block known-bad IPs',
              'Deny everything including outgoing',
            ],
            answer: 0,
            explain: 'Drop everything inbound except what you explicitly allow; let your own machine talk out.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Expose the API to the Mesh Only',
        instructions: 'Default policy is deny-incoming. Build the rule that makes the AAS API reachable from Netbird peers but invisible to the public internet.',
        template: 'ufw default deny incoming\nufw allow in on {0} to any port {1} proto {2}',
        blanks: [
          { answer: 'wt0', explain: 'The Netbird/WireGuard interface — scoping the rule here hides the port from eth0 and the internet.' },
          { answer: '8080', explain: 'The AAS API port.' },
          { answer: 'tcp', explain: 'HTTP APIs ride on TCP.' },
        ],
        tokens: ['wt0', '8080', 'tcp', 'eth0', '22', 'udp', '443'],
      },
      {
        type: 'match',
        bonus: true,
        title: 'Good to Know — Guard Vocabulary',
        instructions: 'Bonus round! Match each firewall concept to its effect.',
        pairs: [
          { left: 'DROP', right: 'Silently eat the packet — caller sees a timeout', explain: 'The guard says nothing. Attackers can\'t even tell the host exists.' },
          { left: 'REJECT', right: 'Actively refuse — caller sees "connection refused"', explain: 'The guard says "no". Faster feedback for legit users, more info for attackers.' },
          { left: 'ss -tulpn', right: 'Show what is actually LISTENING, and on which address', explain: 'Always check this BEFORE blaming the firewall — 127.0.0.1 bindings fool everyone.' },
          { left: 'ufw default deny incoming', right: 'Secure baseline: block everything not explicitly allowed', explain: 'Default-deny means a forgotten service is invisible instead of exposed.' },
          { left: 'ufw allow in on wt0 to any port 8080', right: 'Service reachable from mesh peers only — invisible to the internet', explain: 'Interface-scoped rules + Netbird = private APIs with zero public footprint.' },
        ],
      },
    ],
  },

  /* ================= LEVEL 5 ================= */
  {
    id: 'nat',
    icon: '📮',
    title: 'The Mail Forwarder — NAT',
    badge: 'NAT Wrangler',
    lesson: [
      `<h3>📮 NAT is your building's mailroom</h3>
       <p>One public address (your router), many apartments (devices).
       The mailroom rewrites addresses and remembers who sent what:</p>
       <pre>INSIDE:  192.168.1.50:54321 → 142.250.80.46:443
OUTSIDE: 203.0.113.45:54321 → 142.250.80.46:443
         └─ router remembers: port 54321 = laptop</pre>
       <p><b>The catch:</b> NAT only tracks OUTGOING connections.
       Unsolicited incoming packets get dropped — that's why you can't
       SSH home from a coffee shop without port forwarding... or a mesh VPN.</p>`,
      `<h3>🚦 NAT strictness decides P2P success</h3>
       <table>
         <tr><th>NAT type</th><th>Hole punching</th></tr>
         <tr><td>Full cone</td><td>✅ Easy</td></tr>
         <tr><td>Restricted cone</td><td>✅ Works</td></tr>
         <tr><td>Port restricted</td><td>✅ Usually works</td></tr>
         <tr><td><b>Symmetric</b> (different port per destination)</td><td>❌ Fails → TURN relay</td></tr>
       </table>`,
    ],
    stages: [
      {
        type: 'order',
        title: 'Follow the Translation',
        instructions: 'Your laptop (192.168.1.50) opens google.com through the router (public IP 203.0.113.45). Order the NAT flow.',
        steps: [
          { text: 'Laptop sends: From 192.168.1.50:54321 → To 142.250.80.46:443', explain: 'The packet starts with the PRIVATE source address.' },
          { text: 'Router rewrites the source: From 203.0.113.45:54321', explain: 'Translation! Private IP is swapped for the router\'s public IP.' },
          { text: 'Router records in its table: "port 54321 belongs to 192.168.1.50"', explain: 'This conntrack entry IS the NAT table (see it with `sudo conntrack -L`).' },
          { text: 'Google replies to 203.0.113.45:54321', explain: 'Google only ever saw the public IP — it has no idea your laptop exists.' },
          { text: 'Router looks up port 54321 and forwards the reply to the laptop', explain: 'Without that table entry, the reply would be dropped — which is exactly what happens to unsolicited traffic.' },
        ],
      },
      {
        type: 'match',
        title: 'NAT Type → P2P Fate',
        instructions: 'Match each NAT type to what happens when Netbird tries to hole-punch through it.',
        pairs: [
          { left: 'Full cone',        right: '✅ P2P easy — same external port for everyone, accepts from anyone', explain: 'The friendliest NAT — anyone can reply through the mapping.' },
          { left: 'Restricted cone',  right: '✅ P2P works — only accepts from IPs you already contacted', explain: 'Both peers send first, so both NATs see "expected" traffic.' },
          { left: 'Port restricted',  right: '✅ Usually works — needs the exact IP:port you contacted', explain: 'Stricter, but simultaneous outbound packets still punch through.' },
          { left: 'Symmetric',        right: '❌ Fails → TURN relay — different external port per destination', explain: 'The STUN-discovered port is useless for other destinations. Expect "Conn type: Relayed".' },
        ],
      },
      {
        type: 'quiz',
        title: 'Mailroom Mastery',
        questions: [
          {
            q: 'From a coffee shop you try to SSH directly to your home laptop\'s router IP. It fails. Why?',
            choices: [
              'NAT only tracks outgoing connections — your router has no table entry saying who should get this incoming SSH',
              'Coffee shop WiFi blocks SSH',
              'Your laptop is in a different subnet',
              'SSH only works over VPNs',
            ],
            answer: 0,
            explain: 'Incoming unsolicited connections are dropped by design. Fixes: port forwarding (exposes you to the whole internet) or a mesh VPN (exposes nothing).',
          },
          {
            q: '`curl ifconfig.me` says 203.0.113.45 but `ip addr` says 192.168.1.50. What does this tell you?',
            choices: [
              'You are behind NAT',
              'Your DNS is misconfigured',
              'You have two network cards',
              'You are on a VPN',
            ],
            answer: 0,
            explain: 'Different inside vs outside view = NAT in between. If they matched, you\'d have a public IP directly (common on cloud VMs).',
          },
          {
            q: 'Why is port forwarding worse than a mesh VPN for reaching your home SSH?',
            choices: [
              'It exposes the port to the ENTIRE internet, breaks when your public IP changes, and is impossible behind CGNAT',
              'It is slower than a VPN',
              'It requires IPv6',
              'It only works for HTTP',
            ],
            answer: 0,
            explain: 'Bots scan forwarded ports too, ISPs rotate IPs, and with CGNAT you don\'t even control the outer NAT. `ssh you@100.64.0.2` sidesteps all of it.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Fill the Translation Table',
        instructions: 'Your laptop browses Google through the home router. Complete the NAT translation.',
        template: 'INSIDE the LAN:\n  src 192.168.1.50:54321  dst 142.250.80.46:443\n\nAfter NAT, on the INTERNET:\n  src {0}:54321  dst 142.250.80.46:443\n\nThe router maps public port 54321 back to {1}',
        blanks: [
          { answer: '203.0.113.45', explain: 'The router rewrites the private source to its single public IP.' },
          { answer: '192.168.1.50', explain: 'The conntrack entry remembers which private host owns that port.' },
        ],
        tokens: ['203.0.113.45', '192.168.1.50', '142.250.80.46', '10.0.0.1', '54321'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — Inside the Mailroom',
        questions: [
          {
            q: 'What does `sudo conntrack -L` show on a Linux router?',
            choices: [
              'The live NAT table — one line per connection, inside view + outside view',
              'All firewall rules',
              'DNS cache entries',
              'Connected WiFi clients',
            ],
            answer: 0,
            explain: 'src=192.168.1.50… on one side, src=142.250.80.46 dst=203.0.113.45… on the other — the translation, live.',
          },
          {
            q: 'Why does NAT exist at all?',
            choices: [
              'IPv4 has only ~4.3 billion addresses — your ISP gives you ONE public IP for 50 devices',
              'It encrypts your traffic',
              'It speeds up connections',
              'It is required by WiFi standards',
            ],
            answer: 0,
            explain: 'NAT is an address-scarcity workaround that accidentally became a firewall. IPv6 makes it unnecessary — someday.',
          },
          {
            q: 'Your ISP puts you behind CGNAT. What\'s the consequence for hosting anything at home?',
            choices: [
              'Port forwarding becomes impossible — you don\'t control the outer NAT (a mesh VPN still works!)',
              'Nothing changes',
              'You get faster speeds',
              'Only HTTPS hosting is affected',
            ],
            answer: 0,
            explain: 'There\'s a second NAT at the ISP that you can\'t configure. Netbird hole-punches or relays right through it.',
          },
          {
            q: '`stun stun.l.google.com` answers "Independent Mapping, Independent Filter". Translation?',
            choices: [
              'Cone NAT — P2P hole punching will work',
              'Symmetric NAT — expect relayed connections',
              'No NAT at all',
              'STUN is blocked',
            ],
            answer: 0,
            explain: '"Independent" = same external port for every destination = punchable. "Dependent Mapping" would mean symmetric → TURN relay.',
          },
        ],
      },
    ],
  },

  /* ================= LEVEL 6 ================= */
  {
    id: 'p2p',
    icon: '🥊',
    title: 'Hole Punch Hero — P2P & NAT Traversal',
    badge: 'Hole Puncher',
    lesson: [
      `<h3>🥊 The problem Netbird solves</h3>
       <pre>Your Laptop (Home)           Friend's Pi (Factory)
192.168.1.50                 10.0.32.100
     │                            │
Router/NAT                   Router/NAT
203.0.113.45                 198.51.100.20

Both behind NAT → neither can receive an
unsolicited connection. Stalemate!</pre>
       <p>The trick: <b>both sides send packets OUT at the same time</b>.
       Each NAT sees outgoing traffic and opens a "hole" for replies —
       and the other side's packet IS that reply. 🕳️🥊</p>`,
      `<h3>🤝 The supporting cast</h3>
       <table>
         <tr><th>Tech</th><th>Job</th></tr>
         <tr><td><b>STUN</b></td><td>"What's my public IP:port?" (discovery)</td></tr>
         <tr><td><b>ICE</b></td><td>Tries every connection method: host → srflx → relay</td></tr>
         <tr><td><b>TURN</b></td><td>Relay fallback when punching fails (symmetric NAT)</td></tr>
       </table>
       <pre>sudo netbird status -d
#  ICE candidate (Local): srflx   ← hole punch via STUN address
#  host  = direct LAN/public IP   (best)
#  srflx = STUN-discovered        (great)
#  relay = TURN relay             (fallback)</pre>
       <p>Same stack as WhatsApp/Zoom calls and Tailscale!</p>`,
    ],
    stages: [
      {
        type: 'order',
        title: 'Punch the Hole',
        instructions: 'Device A (home) wants a direct WireGuard tunnel to Device C (factory, behind NAT). Order the NAT traversal dance.',
        steps: [
          { text: 'A asks the STUN server: "what\'s my public IP:port?" → 203.0.113.45:51234', explain: 'STUN = a mirror that shows you your post-NAT address.' },
          { text: 'A and C both report their public endpoints to the Management Server', explain: 'The coordinator shares endpoints + WireGuard public keys between peers. Your data never flows through it.' },
          { text: 'ICE exchanges candidate addresses (host, srflx, relay) between A and C', explain: 'ICE = try the front door, the back door, then the window.' },
          { text: 'A and C SIMULTANEOUSLY fire outbound UDP at each other\'s public endpoint', explain: 'This is the punch — both packets go OUT at the same time.' },
          { text: 'Each NAT now has an outbound hole — the other side\'s packets are let in as "replies"', explain: 'The firewalls were never bypassed — they were convinced this traffic was expected.' },
          { text: 'WireGuard handshake completes → encrypted P2P tunnel established 🎉', explain: '`netbird status` now shows "Conn type: P2P, Direct: true".' },
        ],
      },
      {
        type: 'quiz',
        title: 'Traversal Trivia',
        questions: [
          {
            q: '`netbird status -d` shows "ICE candidate: srflx". What does that mean?',
            choices: [
              'The STUN-discovered public address worked — a successful hole punch',
              'The connection is relayed through TURN',
              'The peers are on the same LAN',
              'The tunnel is down',
            ],
            answer: 0,
            explain: 'srflx = "server reflexive" = the address STUN reflected back at you. host would mean same-LAN/public, relay means TURN fallback.',
          },
          {
            q: 'Both peers show "Conn type: Relayed" and ICE candidate "relay". Most likely cause?',
            choices: [
              'At least one side is behind symmetric NAT (or outbound UDP is blocked)',
              'WireGuard is misconfigured',
              'The management server is down',
              'MTU is too large',
            ],
            answer: 0,
            explain: 'Symmetric NAT uses a different external port per destination, so the STUN-discovered port is useless. Test with `nc -u -v stun.netbird.io 3478`.',
          },
          {
            q: 'A Relayed connection is acceptable for which workload?',
            choices: [
              'SSH sessions and API calls',
              'Large file sync',
              'Video streaming',
              '4K camera feeds',
            ],
            answer: 0,
            explain: 'Relay ≈ 10–50 Mbps and extra latency: fine for SSH/API, painful for bulk transfer (P2P gets your full link speed).',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Read the Hole-Punch Result',
        instructions: 'After a successful NAT traversal, complete the netbird status output.',
        template: 'sudo netbird status -d\n\n  peer: raspberry-pi.netbird.cloud\n  Conn type: {0}\n  Direct: true\n  ICE candidate (Local): {1}',
        blanks: [
          { answer: 'P2P', explain: 'Direct peer-to-peer — the fastest case.' },
          { answer: 'srflx', explain: 'Server-reflexive: the STUN-discovered address worked = a successful punch.' },
        ],
        tokens: ['P2P', 'srflx', 'Relayed', 'relay', 'host', 'TURN'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — P2P Street Smarts',
        questions: [
          {
            q: 'A relayed peer pings ~80 ms while a P2P peer pings ~15 ms. Where does the extra time go?',
            choices: [
              'Every packet round-trips through the TURN relay server',
              'Encryption overhead',
              'DNS lookups',
              'The peer is slower hardware',
            ],
            answer: 0,
            explain: 'Your packets take a detour via the relay both ways. Measure it yourself: `ping -c 5` against each peer.',
          },
          {
            q: 'Which tool measures actual throughput between two mesh peers?',
            choices: [
              'iperf3 — run `iperf3 -s` on one peer, `iperf3 -c ⟨peer-ip⟩` on the other',
              'ping with large packets',
              'traceroute',
              'netstat',
            ],
            answer: 0,
            explain: 'P2P typically hits your real link speed (300–900 Mbps); relayed often 10–50 Mbps. Numbers beat guessing.',
          },
          {
            q: 'Which famous apps use the SAME ICE/STUN/TURN stack as Netbird?',
            choices: [
              'WhatsApp and Zoom calls — connecting two phones behind NAT',
              'Netflix streaming',
              'Google Search',
              'Email (SMTP)',
            ],
            answer: 0,
            explain: 'Every video call is a NAT traversal story. Tailscale is the same WireGuard-mesh idea too — Netbird is the open-source, self-hostable take.',
          },
          {
            q: 'Why must BOTH peers fire UDP packets simultaneously during the punch?',
            choices: [
              'Each NAT only lets in "replies" to traffic it saw leave — both holes must exist before packets can cross',
              'It doubles the bandwidth',
              'One packet alone is too small',
              'WireGuard requires two handshakes',
            ],
            answer: 0,
            explain: 'A one-sided attempt looks unsolicited to the other NAT and gets dropped. Simultaneity IS the trick.',
          },
        ],
      },
    ],
  },

  /* ================= LEVEL 7 ================= */
  {
    id: 'mesh',
    icon: '🕸️',
    title: 'Mesh vs Hub — VPNs & WireGuard',
    badge: 'Tunnel Engineer',
    lesson: [
      `<h3>🏤 Hub-and-spoke vs 💬 group chat</h3>
       <p><b>Traditional VPN:</b> everyone drives to one central post office.
       Slow, a bottleneck, and a single point of failure.</p>
       <pre>Mumbai laptop → Frankfurt hub → Mumbai server  ≈ 250 ms
Mumbai laptop → Mumbai server (direct P2P)     ≈   2 ms  (125× faster!)</pre>
       <p><b>Netbird mesh:</b> every peer can DM every other peer directly,
       with automatic relay fallback. Formula to remember:</p>
       <p style="text-align:center"><b>Netbird = WireGuard (encryption) + ICE/STUN/TURN (NAT traversal) + Management Server (coordination)</b></p>`,
      `<h3>🔒 WireGuard in one breath</h3>
       <p>Everything between peers rides inside encrypted UDP. An eavesdropper sees
       binary noise between two IPs — not that it's SSH, not the content, not the
       inner addresses. Crypto: <b>Curve25519</b> (key exchange) + <b>ChaCha20</b>
       (encryption) + <b>Poly1305</b> (authentication).</p>
       <pre>sudo tcpdump -i eth0 -X udp port 51820  # internet view: 🔒 gibberish
sudo tcpdump -i wt0 -A                  # inside the tunnel: plaintext
sudo wg show   # handshakes &amp; transfer counters = tunnel truth</pre>
       <p>💡 The Management Server only <i>coordinates</i> (peers, keys, ACLs).
       If it goes down, established tunnels keep working — only new peers can't join.</p>`,
    ],
    stages: [
      {
        type: 'match',
        title: 'Meet the Cast',
        instructions: 'Match each technology to its job in the Netbird stack.',
        pairs: [
          { left: 'WireGuard',         right: '✉️ Sealed envelope — encrypts traffic between peers', explain: 'Curve25519 + ChaCha20 + Poly1305 — same crypto family as TLS 1.3, but simpler.' },
          { left: 'STUN',              right: '🪞 "What\'s my public address?"', explain: 'A mirror outside your NAT.' },
          { left: 'ICE',               right: '🚪 Tries front door, back door, then window', explain: 'Negotiates candidates: host → srflx → relay.' },
          { left: 'TURN',              right: '📨 A messenger relays when you can\'t meet directly', explain: 'Fallback for symmetric NAT — slower but always works.' },
          { left: 'Management Server', right: '📋 Coordinates peers, keys & ACLs — your data never touches it', explain: 'Coordination only. Outage ≠ tunnel death; established P2P keeps flowing.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Mesh Mindset',
        questions: [
          {
            q: 'Netbird\'s Management Server goes down for an hour. What breaks?',
            choices: [
              'Only new peers can\'t join — established P2P tunnels keep working',
              'All VPN traffic stops immediately',
              'All peers lose their 100.64.x.x IPs',
              'WireGuard keys expire',
            ],
            answer: 0,
            explain: 'The management plane only coordinates. Data flows peer-to-peer, so an outage doesn\'t cut existing tunnels.',
          },
          {
            q: 'Laptop and server are both in Mumbai; the VPN hub is in Frankfurt. With hub-and-spoke, latency is ~250ms. With Netbird mesh?',
            choices: [
              '~2 ms — traffic goes directly between the Mumbai machines',
              'Still ~250 ms — VPNs always add latency',
              '~125 ms — half the hub path',
              '0 ms — mesh removes the network entirely',
            ],
            answer: 0,
            explain: 'P2P means the packets never leave Mumbai. The hub detour was 125× slower.',
          },
          {
            q: 'You tcpdump the PHYSICAL interface (eth0) while curling a Netbird peer. What do you see?',
            choices: [
              'Encrypted UDP gibberish between two public IPs — no readable content',
              'Your HTTP request in plaintext',
              'Nothing at all',
              'Only DNS queries',
            ],
            answer: 0,
            explain: 'WireGuard wraps everything. Plaintext is only visible on wt0 — your own machine\'s view AFTER decryption.',
          },
          {
            q: 'Which crypto trio does WireGuard use?',
            choices: [
              'Curve25519 + ChaCha20 + Poly1305',
              'RSA + AES + MD5',
              'DH + 3DES + SHA1',
              'Kyber + AES-GCM + HMAC',
            ],
            answer: 0,
            explain: 'Key exchange + encryption + authentication. Modern, fast, and small enough to audit.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Complete the WireGuard Peer',
        instructions: 'Fill in the wg show peer block for a healthy tunnel.',
        template: 'sudo wg show wt0\n\npeer: xyz789...\n  endpoint: 54.123.45.67:51820\n  allowed ips: {0}/{1}\n  latest handshake: {2} ago',
        blanks: [
          { answer: '100.64.0.3', explain: 'The peer mesh IP, from the 100.64.0.0/16 range.' },
          { answer: '32', explain: '/32 = exactly one host; WireGuard uses it as both routing entry and source filter.' },
          { answer: '12 seconds', explain: 'A fresh handshake (< ~2 min old) means the tunnel is alive.' },
        ],
        tokens: ['100.64.0.3', '32', '12 seconds', '16', '4 hours', '100.64.0.0'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — Tunnel Tricks',
        questions: [
          {
            q: 'What does Netbird\'s "exit node" feature do?',
            choices: [
              'Routes ALL your internet traffic via a chosen peer — `curl ifconfig.me` shows the exit node\'s IP',
              'Disconnects a peer from the mesh',
              'Creates a backup relay',
              'Exports your WireGuard keys',
            ],
            answer: 0,
            explain: 'Classic full-tunnel mode on demand: `netbird up --exit-node aws-server` on sketchy airport WiFi, and you browse as the AWS box.',
          },
          {
            q: '`sudo wg show` reports "latest handshake: 12 seconds ago". Meaning?',
            choices: [
              'The tunnel is alive and healthy',
              'The tunnel is about to expire',
              'A peer just joined the network',
              'Someone is attacking the tunnel',
            ],
            answer: 0,
            explain: 'WireGuard re-handshakes roughly every 2 minutes under traffic. Fresh handshake = working tunnel — the ultimate truth, whatever any status screen says.',
          },
          {
            q: 'A 100 Mbps hub VPN serves 50 busy devices. Roughly what does each get — and with mesh?',
            choices: [
              '~2 Mbps each through the hub; with mesh P2P each PAIR gets full link speed',
              '100 Mbps each in both cases',
              '50 Mbps each through the hub',
              'Mesh is always slower than a hub',
            ],
            answer: 0,
            explain: 'The hub\'s bandwidth divides across everyone. Mesh traffic never converges on one box — that\'s the whole point.',
          },
          {
            q: 'In `wg show`, a peer has "allowed ips: 100.64.0.3/32". What does that mean?',
            choices: [
              'Only that single mesh IP is routed to / accepted from this peer',
              'The peer can use 32 different IPs',
              'The peer is rate-limited',
              'The peer is an exit node',
            ],
            answer: 0,
            explain: 'Remember /32 = exactly one host. WireGuard uses allowed-ips as both routing table AND source filter — a built-in spoofing guard.',
          },
        ],
      },
    ],
  },

  /* ================= LEVEL 8 ================= */
  {
    id: 'policy',
    icon: '📜',
    title: 'Policy Architect — Groups & ACLs',
    badge: 'Policy Architect',
    lesson: [
      `<h3>📜 Not everyone should see everything</h3>
       <p>Netbird groups peers (via setup keys or manually) and policies control
       who reaches whom — like cloud Security Groups, but for your mesh:</p>
       <pre>GROUPS
  admins        → your laptop
  bx50-devices  → all factory kiosks
  servers       → AAS API + DB servers

POLICIES
  admins        → bx50-devices : ALL ports     (full debug access)
  bx50-devices  → servers      : TCP 8080, 443 (API calls only)
  bx50-devices  → bx50-devices : DENY          (kiosks can't see each other!)</pre>
       <p>A compromised kiosk can't reach other kiosks or SSH into servers —
       only the API port it needs. That's <b>least privilege</b> + no lateral movement.</p>`,
      `<h3>🔑 Setup keys = fleet enrollment</h3>
       <pre>sudo netbird up --setup-key &lt;KEY&gt; \\
  --hostname bx50-factory-07</pre>
       <ul>
         <li><b>One-off key:</b> valid for ONE device — manual installs</li>
         <li><b>Reusable key:</b> enroll many devices (limit + expiry) — ansible fleets</li>
         <li><b>Auto-group on the key</b> (e.g. "bx50-devices") → every kiosk lands in the right ACL group automatically</li>
       </ul>
       <p>⚠️ Remember: peers can show "Connected" while a policy still blocks
       their traffic — <b>connected ≠ allowed</b>.</p>`,
    ],
    stages: [
      {
        type: 'quiz',
        title: 'You Are the ACL',
        questions: [
          {
            context: 'POLICIES\nadmins       → bx50-devices : ALL ports\nbx50-devices → servers      : TCP 8080, 443\nbx50-devices → bx50-devices : DENY\n(no other policies exist)',
            q: '🔌 Admin laptop → SSH (tcp/22) → kiosk bx50-factory-07',
            choices: ['✅ ALLOW', '❌ DENY'],
            answer: 0,
            explain: 'admins → bx50-devices covers ALL ports — full debug access for you.',
          },
          {
            context: 'POLICIES\nadmins       → bx50-devices : ALL ports\nbx50-devices → servers      : TCP 8080, 443\nbx50-devices → bx50-devices : DENY\n(no other policies exist)',
            q: '🔌 Kiosk bx50-factory-07 → API call (tcp/8080) → AAS server',
            choices: ['✅ ALLOW', '❌ DENY'],
            answer: 0,
            explain: 'bx50-devices → servers explicitly allows 8080 — exactly what a kiosk needs.',
          },
          {
            context: 'POLICIES\nadmins       → bx50-devices : ALL ports\nbx50-devices → servers      : TCP 8080, 443\nbx50-devices → bx50-devices : DENY\n(no other policies exist)',
            q: '🔌 Kiosk bx50-factory-07 → SSH (tcp/22) → AAS server',
            choices: ['❌ DENY', '✅ ALLOW'],
            answer: 0,
            explain: 'Kiosks may only use TCP 8080/443 toward servers. A hacked kiosk cannot SSH into your infrastructure.',
          },
          {
            context: 'POLICIES\nadmins       → bx50-devices : ALL ports\nbx50-devices → servers      : TCP 8080, 443\nbx50-devices → bx50-devices : DENY\n(no other policies exist)',
            q: '🔌 Kiosk bx50-factory-07 → ping → kiosk bx50-factory-08',
            choices: ['❌ DENY', '✅ ALLOW'],
            answer: 0,
            explain: 'Kiosk-to-kiosk is explicitly DENIED — no lateral movement if one is compromised.',
          },
          {
            context: 'POLICIES\nadmins       → bx50-devices : ALL ports\nbx50-devices → servers      : TCP 8080, 443\nbx50-devices → bx50-devices : DENY\n(no other policies exist)',
            q: '🔌 Compromised kiosk → SSH (tcp/22) → admin laptop',
            choices: ['❌ DENY', '✅ ALLOW'],
            answer: 0,
            explain: 'Policies are directional! admins→bx50 exists, but no bx50→admins policy does. Attack path closed.',
          },
        ],
      },
      {
        type: 'quiz',
        title: 'Fleet Thinking',
        questions: [
          {
            q: 'You\'re enrolling 50 kiosks with ansible. Which setup-key strategy is right?',
            choices: [
              'One reusable key with usage limit + expiry, with auto-group "bx50-devices" attached',
              'One one-off key shared by all 50 kiosks',
              '50 manual browser logins',
              'No key — just install Netbird',
            ],
            answer: 0,
            explain: 'Reusable key = fleet enrollment; the auto-group drops every kiosk into the right ACL group with zero clicks.',
          },
          {
            q: '`netbird status` shows "Peers count: 2/2 Connected" but ping to a peer fails. First thing to check?',
            choices: [
              'ACL policies in the dashboard — connected ≠ allowed',
              'Reinstall Netbird',
              'The peer\'s DNS settings',
              'Your /etc/hosts file',
            ],
            answer: 0,
            explain: 'The control plane says the tunnel exists; a policy may still block ICMP/your port. Classic gotcha.',
          },
          {
            q: 'Why deny kiosk↔kiosk traffic when they\'re all "your" devices?',
            choices: [
              'Limit lateral movement — one compromised kiosk can\'t attack the rest of the fleet',
              'It saves bandwidth',
              'Kiosks can\'t handle P2P',
              'Netbird requires it',
            ],
            answer: 0,
            explain: 'Zero-trust thinking: give each device only the paths it needs (kiosk→API), nothing more.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Build the Kiosk ACL',
        instructions: 'Write the two policies that let kiosks reach only the API, and stop kiosks seeing each other.',
        template: '# Kiosks may only hit the API on the servers:\nPolicy:  {0}  ->  {1}  :  TCP {2}\n\n# Kiosks must NOT reach other kiosks:\nPolicy:  bx50-devices  ->  bx50-devices  :  {3}',
        blanks: [
          { answer: 'bx50-devices', explain: 'The source group: all factory kiosks.' },
          { answer: 'servers', explain: 'The destination group: AAS API + DB servers.' },
          { answer: '8080', explain: 'Only the API port — least privilege.' },
          { answer: 'DENY', explain: 'No lateral movement: a compromised kiosk cannot reach its neighbours.' },
        ],
        tokens: ['bx50-devices', 'servers', '8080', 'DENY', 'admins', 'ALL', '22', 'ALLOW'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — Beyond Basics',
        questions: [
          {
            q: 'A factory PLC and an IP camera can\'t run Netbird. How do you reach them from your laptop anywhere in the world?',
            choices: [
              'Make the kiosk a ROUTING PEER for 10.0.32.0/24 (plus ip_forward=1 on the kiosk)',
              'Install Netbird on the PLC anyway',
              'Port-forward the factory router',
              'It\'s impossible',
            ],
            answer: 0,
            explain: 'Dashboard → Networks → add route 10.0.32.0/24 via the kiosk. Then `ping 10.0.32.50` reaches the PLC and `vlc rtsp://10.0.32.60/cam` shows the camera — through the mesh.',
          },
          {
            q: 'When self-hosting Netbird, what must be true of exactly ONE machine?',
            choices: [
              'It needs a public IP, not behind NAT — it hosts management/signal/STUN/TURN',
              'It must run Windows',
              'It needs at least 64 GB RAM',
              'It must be in the same country as all peers',
            ],
            answer: 0,
            explain: 'Someone has to be reachable by everyone. ~2 GB RAM serves hundreds of peers, because data flows P2P — the server only coordinates (and relays as fallback).',
          },
          {
            q: 'On a fleet setup key, what does "ephemeral peer = OFF" give you?',
            choices: [
              'Devices persist in the dashboard across reboots',
              'Peers are deleted after each session',
              'The key never expires',
              'Peers skip authentication',
            ],
            answer: 0,
            explain: 'Ephemeral peers vanish when they disconnect — fine for CI runners, wrong for kiosks that reboot nightly.',
          },
          {
            q: '`ssh scuser@bx50-factory-07.netbird.cloud` works from anywhere, no jump host. Why?',
            choices: [
              'Netbird DNS gives every peer a stable name that resolves to its mesh IP, regardless of which NAT it sits behind',
              'The kiosk has a public IP',
              'SSH bypasses NAT natively',
              'The factory firewall forwards port 22',
            ],
            answer: 0,
            explain: 'Stable names + mesh IPs = your ansible inventory can list FQDNs and ignore physical network topology entirely.',
          },
        ],
      },
    ],
  },

  /* ================= LEVEL 9 ================= */
  {
    id: 'boss',
    icon: '🐉',
    title: 'BOSS LEVEL — The Troubleshooter',
    badge: 'Mesh Master',
    lesson: [
      `<h3>🐉 Final challenge: on-call at 3 AM</h3>
       <p>The factory mesh is misbehaving. Use everything you've learned.
       Your weapons, layer by layer:</p>
       <pre>ping &lt;ip&gt;                  # L3 — can I reach the peer at all?
nc -zv &lt;ip&gt; &lt;port&gt;         # L4 — is the PORT open?
curl -v http://&lt;ip&gt;:&lt;port&gt; # L7 — does the SERVICE respond?
sudo wg show               # tunnel truth: handshakes &amp; transfer
sudo netbird status -d     # ICE candidates, relay vs P2P</pre>
       <p>Diagnose each incident. Get them right and claim the
       <b>Mesh Master</b> crown. 👑</p>`,
    ],
    stages: [
      {
        type: 'quiz',
        title: 'Incident Queue',
        questions: [
          {
            context: 'INCIDENT #1\n$ curl http://100.64.0.4:8080/api/status\ncurl: (28) Connection timed out',
            q: 'Diagnosis?',
            choices: [
              'Something is DROPping packets — check ufw/iptables and Netbird ACL policies',
              'The API crashed — restart it',
              'DNS failure',
              'MTU too large',
            ],
            answer: 0,
            explain: 'Timeout = silent DROP. Refused would mean you reached the host. Check the firewall AND dashboard policies.',
          },
          {
            context: 'INCIDENT #2\n$ curl http://100.64.0.4:8080/api/status\ncurl: (7) Connection refused',
            q: 'Diagnosis?',
            choices: [
              'You reached the host but nothing is listening — check the service and `ss -tulpn`',
              'Firewall is dropping packets',
              'The tunnel is down',
              'Symmetric NAT',
            ],
            answer: 0,
            explain: 'Refused = the host actively said "no" = network path is FINE. The app is down or bound to 127.0.0.1 only.',
          },
          {
            context: 'INCIDENT #3\n$ sudo netbird status → "Connected"\n$ sudo wg show wt0 latest-handshakes\ndef456...  (4 hours ago)',
            q: 'Diagnosis?',
            choices: [
              'Tunnel silently dead despite the status — `netbird down && netbird up`',
              'Everything is fine, handshakes are rare',
              'The peer changed its key',
              'TURN relay is overloaded',
            ],
            answer: 0,
            explain: 'A healthy WireGuard handshake is < ~2 minutes old. Very old handshake = dead tunnel even if status lies. Common after laptop sleep/resume.',
          },
          {
            context: 'INCIDENT #4\nSSH to the kiosk works fine, but rsync of a 2 GB\nfirmware file stalls at random points.',
            q: 'Diagnosis?',
            choices: [
              'Classic MTU problem — WireGuard adds ~60 bytes overhead; try `ip link set wt0 mtu 1280`',
              'The kiosk disk is full',
              'ACL policy blocks rsync',
              'Symmetric NAT',
            ],
            answer: 0,
            explain: 'Small packets (SSH keystrokes) fit; big packets get fragmented/blackholed. Test with `ping -M do -s 1372`.',
          },
          {
            context: 'INCIDENT #5\nEvery factory peer shows:\n  Conn type: Relayed\n  ICE candidate (Local): relay',
            q: 'Diagnosis?',
            choices: [
              'Symmetric NAT or blocked outbound UDP at the factory — test `nc -u -v stun.netbird.io 3478`',
              'The management server is down',
              'WireGuard keys expired',
              'The kiosks need reboots',
            ],
            answer: 0,
            explain: 'All-relay = hole punching keeps failing. Corporate/4G symmetric NAT or a firewall eating outbound UDP are the usual suspects.',
          },
          {
            context: 'INCIDENT #6\nNew headless kiosk: `sudo netbird up`\njust hangs forever on "waiting for login…"',
            q: 'Diagnosis?',
            choices: [
              'No browser on a headless device — use `netbird up --setup-key ⟨KEY⟩` instead',
              'The kiosk has no internet',
              'Netbird is incompatible with ARM',
              'You must install a GUI first',
            ],
            answer: 0,
            explain: 'Interactive login needs a browser. Headless/fleet devices enroll with setup keys — which is also what your ansible role should do.',
          },
        ],
      },
      {
        type: 'match',
        title: 'The Layer Ladder',
        instructions: 'Final exercise: match each command to the layer/question it answers when something "doesn\'t work".',
        pairs: [
          { left: 'ping 100.64.0.4',              right: 'L3 — can I reach the peer at all?', explain: 'Failure here = Netbird/network issue, go check the tunnel.' },
          { left: 'nc -zv 100.64.0.4 8080',       right: 'L4 — is the port open?', explain: 'Failure here = peer\'s firewall or service not listening.' },
          { left: 'curl -v http://100.64.0.4:8080', right: 'L7 — does the service actually respond?', explain: 'Failure here = the app itself is broken.' },
          { left: 'sudo wg show wt0 latest-handshakes', right: '🔦 The ultimate tunnel truth — handshake age', explain: 'Fresh (<2 min) = healthy. Old/zero = dead tunnel, whatever the status says.' },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Climb the Layer Ladder',
        instructions: 'Something "does not work". Fill the command that tests each layer in turn.',
        template: 'L3 — can I reach the peer?    {0} 100.64.0.4\nL4 — is the port open?        {1} 100.64.0.4 8080\nL7 — does the service reply?  {2} http://100.64.0.4:8080/',
        blanks: [
          { answer: 'ping', explain: 'Layer 3 reachability. Failure here = a Netbird/network problem.' },
          { answer: 'nc -zv', explain: 'Layer 4 port check. Failure = firewall or the service is not listening.' },
          { answer: 'curl', explain: 'Layer 7. Failure here = the app itself is broken.' },
        ],
        tokens: ['ping', 'nc -zv', 'curl', 'dig', 'ssh', 'traceroute'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — Ops Superpowers',
        questions: [
          {
            context: '$ sudo netbird status --json | \\\n    jq -e \'[.peers.details[].status] | all(. == "Connected")\' \\\n    || echo "ALERT: a peer is down!"',
            q: 'What is this one-liner good for?',
            choices: [
              'Monitoring — machine-readable status lets scripts/cron alert when any peer drops',
              'Restarting dead peers',
              'Rotating WireGuard keys',
              'Measuring throughput',
            ],
            answer: 0,
            explain: '`--json` + jq turns netbird status into a clean pass/fail signal — the same trick your QC scripts can use for cloud-link validation.',
          },
          {
            q: 'What does `ping -M do -s 1372 100.64.0.4` actually test?',
            choices: [
              'Whether 1400-byte packets survive without fragmentation — an MTU probe',
              'Latency under load',
              'Whether ICMP is allowed',
              'DNS resolution speed',
            ],
            answer: 0,
            explain: '1372 payload + 28 header = 1400 bytes, with -M do forbidding fragmentation. If it fails but small pings work: MTU problem → `ip link set wt0 mtu 1280`.',
          },
          {
            q: 'Why are mesh IPs (100.64.x.x) great Prometheus scrape targets for kiosks?',
            choices: [
              'They are stable regardless of which factory, WiFi or NAT the device physically sits behind',
              'They are faster than normal IPs',
              'Prometheus only supports CGNAT ranges',
              'They never need authentication',
            ],
            answer: 0,
            explain: 'targets: [\'100.64.0.10:9100\', \'100.64.0.11:9100\'] keeps working even when the kiosk moves buildings. Stable identity is the mesh superpower.',
          },
          {
            q: 'A laptop peer is unreachable right after sleep/resume. Quickest fix?',
            choices: [
              '`sudo netbird down && sudo netbird up` — the tunnel state went stale',
              'Reboot the laptop',
              'Reinstall Netbird',
              'Wait 24 hours for key rotation',
            ],
            answer: 0,
            explain: 'Sleep breaks the UDP flows but the client may not notice immediately. A down/up re-punches everything in seconds.',
          },
        ],
      },
    ],
  },
];

/* =====================================================================
   TRACK 2 — AAS FIELD TRACK
   Repo-grounded: aas-ansible roles/api/templates/{cloudLinkValidation,
   obtValidation}.sh.j2, postinstall.sh.j2 (Teleport), env.j2, autoinstall,
   ddns_update.sh.j2, group_vars/all.yml
   ===================================================================== */

const AAS_LEVELS = [

  /* ================= AAS 1 ================= */
  {
    id: 'aas-isolate',
    icon: '🔌',
    title: 'The Enable/Disable Dance',
    badge: 'Isolation Initiate',
    lesson: [
      `<h3>🔌 Online only when it has to be</h3>
       <p>The BX50/CloudLink validation scripts (<code>cloudLinkValidation.sh.j2</code>,
       <code>obtValidation.sh.j2</code>) keep the device <b>offline by default</b> and
       only open the door for the exact moment of an API call:</p>
       <pre>http_request() {
    enable_networking          # bring the device online
    ... curl the AAS API ...   # do the one thing we needed
    disable_networking         # cut it off again
}</pre>
       <p>Every single call to <code>https://&lt;host&gt;:5001</code> is sandwiched
       between <code>enable_networking</code> and <code>disable_networking</code>.
       Less time online = smaller attack surface during factory provisioning.</p>`,
      `<h3>🚪 What the two functions actually do</h3>
       <pre>enable_networking() {
    cat &gt; /etc/resolv.conf &lt;&lt;EOF      # 1. give it DNS
search kpmpowerlab.com kpmpower.com
nameserver 192.168.1.21
nameserver 192.168.1.20
EOF
    route add default gw 10.0.32.1 wlan0  # 2. install the doorman
}
disable_networking() {
    route del default gw 10.0.32.1 wlan0  # fire the doorman
}</pre>
       <p>This is <b>exactly</b> the gateway/default-route concept from the Doorman
       level — applied to a real Raspberry Pi over <code>wlan0</code>.</p>`,
    ],
    stages: [
      {
        type: 'order',
        title: 'Trace one http_request',
        instructions: 'Order the lifecycle of a single <code>http_request</code> call from the validation script.',
        steps: [
          { text: 'enable_networking — write /etc/resolv.conf and add default route via 10.0.32.1', explain: 'The device is dark until this runs: DNS + a doorman to the outside world.' },
          { text: 'curl -k -X POST https://⟨host⟩:5001/cloudLinkValidation … (retry up to 15×)', explain: 'The actual work: report status / fetch the next instruction from the AAS API on port 5001.' },
          { text: 'On a 2xx status: store HTTP_RESPONSE + HTTP_STATUS and break the retry loop', explain: 'Success short-circuits the loop — no more retries needed.' },
          { text: 'disable_networking — delete the default route again', explain: 'The door slams shut. The device is isolated until the next call needs it.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Why Isolate?',
        questions: [
          {
            q: 'Why wrap every API call in enable_networking … disable_networking instead of just staying online?',
            choices: [
              'Minimise the window the factory device is reachable — smaller attack surface during provisioning',
              'It makes curl faster',
              'DNS only works for a few seconds',
              'The Pi has no real network card',
            ],
            answer: 0,
            explain: 'Default-deny posture: the kiosk is dark except for the precise moments it must talk to the AAS API.',
          },
          {
            q: 'What exactly does disable_networking() remove?',
            choices: [
              'The default route (default gw 10.0.32.1 wlan0) — so non-local traffic has nowhere to go',
              'The whole wlan0 interface',
              'The DNS servers from resolv.conf',
              'The firewall rules',
            ],
            answer: 0,
            explain: 'It fires the doorman. Local 10.0.32.0/24 traffic still works; anything needing the gateway dies — exactly the Doorman level in production.',
          },
          {
            q: 'The API returns HTTP 410. The script calls disable_networking and stops. What does 410 mean here?',
            choices: [
              'The validation service has been stopped server-side — shut the door, we are done',
              'A transient error — retry immediately',
              'The device was not found',
              'The build is missing',
            ],
            answer: 0,
            explain: '410 Gone = service stopped. (404 = device not found → exit/restart; 405 = build not found → exit/restart; 2xx = success.)',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Complete the Networking Functions',
        instructions: 'Reconstruct the enable/disable_networking route commands from the validation script.',
        template: 'enable_networking() {\n    # ...write /etc/resolv.conf...\n    route {0} default gw {1} {2}\n}\n\ndisable_networking() {\n    route {3} default gw 10.0.32.1 wlan0\n}',
        blanks: [
          { answer: 'add', explain: 'enable_networking ADDS the default route to bring the device online.' },
          { answer: '10.0.32.1', explain: 'The factory gateway on the kiosk WiFi.' },
          { answer: 'wlan0', explain: 'The WiFi interface.' },
          { answer: 'del', explain: 'disable_networking DELETES the route to isolate the device again.' },
        ],
        tokens: ['add', 'del', '10.0.32.1', 'wlan0', 'eth0', '192.168.1.1', 'show'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — The Fine Print',
        questions: [
          {
            q: 'Which interface and gateway does the BX50 use for its default route?',
            choices: [
              'Gateway 10.0.32.1 on wlan0 (WiFi)',
              'Gateway 192.168.1.1 on eth0',
              'Gateway 10.0.32.1 on eth0',
              'Gateway 192.168.1.21 on wlan0',
            ],
            answer: 0,
            explain: 'route add default gw 10.0.32.1 wlan0 — the kiosk reaches the world over WiFi. 192.168.1.21/.20 are DNS servers, not gateways.',
          },
          {
            q: 'How many times does http_request retry a failed call before giving up?',
            choices: ['15 (sleeping 5s between attempts)', '3', '∞ forever', '1'],
            answer: 0,
            explain: 'retry_attempts=15. After 15 failures it re-enables kpm_boot, disables networking, and restarts the device via the PicoUPS.',
          },
          {
            q: 'After all retries fail, what does the script do before rebooting?',
            choices: [
              'Reset /etc/hosts to localhost, re-enable kpm_boot.service, disable_networking, then PicoUPS restart',
              'Delete the OS',
              'Email an alert',
              'Keep the device online for debugging',
            ],
            answer: 0,
            explain: 'It cleans up to a known-safe state (offline, boot service armed) and power-cycles via PicoUPS_command.py — fail safe, not fail open.',
          },
        ],
      },
    ],
  },

  /* ================= AAS 2 ================= */
  {
    id: 'aas-resolv',
    icon: '📇',
    title: 'resolv.conf & the Doorman',
    badge: 'DNS Decoder',
    lesson: [
      `<h3>📇 Two different jobs, two different IP ranges</h3>
       <p>People mix these up constantly. In <code>enable_networking</code> there are
       three <i>kinds</i> of values, each doing a different job:</p>
       <table>
         <tr><th>Value</th><th>Role</th></tr>
         <tr><td><code>192.168.1.21</code>, <code>192.168.1.20</code></td><td>DNS <b>nameservers</b> — "what IP is this hostname?"</td></tr>
         <tr><td><code>10.0.32.1</code></td><td>Default <b>gateway</b> — "send non-local packets here"</td></tr>
         <tr><td><code>wlan0</code></td><td>The <b>interface</b> the route lives on</td></tr>
         <tr><td><code>kpmpowerlab.com kpmpower.com</code></td><td>DNS <b>search</b> domains — auto-append to short names</td></tr>
       </table>`,
      `<h3>🧭 The cross-subnet twist</h3>
       <p>Notice the DNS servers (<code>192.168.1.x</code>) are in a <b>different subnet</b>
       than the gateway/device (<code>10.0.32.x</code>). That's fine — the device reaches
       the DNS servers <i>through</i> the gateway. Which means:</p>
       <pre>No default route → can't reach 192.168.1.21 → DNS fails →
   every hostname lookup hangs, even though resolv.conf is "correct".</pre>
       <p>This is why the script writes resolv.conf <b>and</b> adds the route together —
       one without the other is useless.</p>`,
    ],
    stages: [
      {
        type: 'bins',
        title: 'Sort the Config',
        instructions: 'Drag each value from enable_networking() into the job it performs.',
        bins: [
          { id: 'dns',     label: '📇 DNS nameserver' },
          { id: 'gateway', label: '🚪 Default gateway' },
          { id: 'iface',   label: '🔌 Interface' },
          { id: 'search',  label: '🔎 DNS search domain' },
        ],
        items: [
          { text: '192.168.1.21', bin: 'dns',     explain: 'nameserver line — resolves hostnames to IPs.' },
          { text: '192.168.1.20', bin: 'dns',     explain: 'The secondary nameserver — used if .21 is unreachable.' },
          { text: '10.0.32.1',    bin: 'gateway', explain: 'route add default gw 10.0.32.1 — the doorman for non-local traffic.' },
          { text: 'wlan0',        bin: 'iface',   explain: 'The WiFi interface the default route is attached to.' },
          { text: 'kpmpowerlab.com', bin: 'search', explain: 'search domain — lets "aas-api" resolve as "aas-api.kpmpowerlab.com".' },
          { text: 'kpmpower.com', bin: 'search',   explain: 'A second search domain tried when expanding short names.' },
        ],
      },
      {
        type: 'quiz',
        title: 'DNS vs Gateway',
        questions: [
          {
            q: 'resolv.conf is written correctly but the route was NOT added. What happens to `curl https://host:5001`?',
            choices: [
              'DNS lookups hang/fail — the DNS servers (192.168.1.x) are themselves unreachable without the gateway',
              'It works fine, DNS is independent of routing',
              'Only HTTPS breaks, HTTP works',
              'curl uses a cached IP',
            ],
            answer: 0,
            explain: 'The nameservers live across a subnet boundary. No default route = no path to them = name resolution stalls. resolv.conf + route are a package deal.',
          },
          {
            q: 'The DNS servers are 192.168.1.x but the device + gateway are 10.0.32.x. How does the device reach DNS?',
            choices: [
              'Through the default gateway 10.0.32.1, which routes between the two subnets',
              'They must be on the same subnet — this is a bug',
              'Over a separate DNS-only interface',
              'It broadcasts to find them',
            ],
            answer: 0,
            explain: 'Cross-subnet traffic (including DNS queries) goes to the gateway, exactly like the Doorman level taught.',
          },
          {
            q: 'What does the `search kpmpowerlab.com kpmpower.com` line do?',
            choices: [
              'Auto-appends those domains to short names so `ping aas-api` tries `aas-api.kpmpowerlab.com`',
              'Blocks those domains',
              'Sets the gateway for those domains',
              'Encrypts DNS to those domains',
            ],
            answer: 0,
            explain: 'Search domains save typing and let internal short names resolve. Nothing to do with routing or security.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Complete /etc/resolv.conf',
        instructions: 'Fill in the resolv.conf that enable_networking writes on the kiosk.',
        template: '# DNS the kiosk writes when it comes online\n{0} kpmpowerlab.com kpmpower.com\nnameserver {1}\nnameserver {2}',
        blanks: [
          { answer: 'search', explain: 'search domains auto-append to short hostnames.' },
          { answer: '192.168.1.21', explain: 'Primary DNS nameserver (cross-subnet, reached via the gateway).' },
          { answer: '192.168.1.20', explain: 'Secondary nameserver, used when the primary is unreachable.' },
        ],
        tokens: ['search', '192.168.1.21', '192.168.1.20', 'nameserver', '10.0.32.1', 'domain'],
      },
      {
        type: 'match',
        bonus: true,
        title: 'Good to Know — Prove It on a Device',
        instructions: 'Bonus round! Match each command to what it verifies on a real BX50.',
        pairs: [
          { left: 'ip route | grep default', right: 'Is the doorman installed? (default via 10.0.32.1 dev wlan0)', explain: 'If this is empty after enable_networking, the route add failed — nothing reaches the API.' },
          { left: 'cat /etc/resolv.conf', right: 'Are the right nameservers + search domains set?', explain: 'Confirms enable_networking wrote the file the script expects.' },
          { left: 'dig +short aas-api.kpmpowerlab.com', right: 'Does DNS actually resolve through 192.168.1.21?', explain: 'A timeout here usually means the route is missing, not that DNS is wrong.' },
          { left: 'ip route get 192.168.1.21', right: '"Which path will my DNS query take?"', explain: 'Should show it leaving via the wlan0 default route toward the gateway.' },
        ],
      },
    ],
  },

  /* ================= AAS 3 ================= */
  {
    id: 'aas-identity',
    icon: '🏷️',
    title: '/etc/hosts & Device Identity',
    badge: 'Identity Inspector',
    lesson: [
      `<h3>🏷️ Making the device answer to its own name</h3>
       <p>Before validation runs, the script grafts the device's serial and a
       placeholder onto the loopback line so local services can resolve it:</p>
       <pre>sed -i "/^127\\.0\\.0\\.1/s/$/ \${CLOUDLINK_SN}/" /etc/hosts   # add the SN
sed -i "/^127\\.0\\.0\\.1/s/$/ CL0000/"          /etc/hosts   # add placeholder</pre>
       <p>So <code>127.0.0.1 localhost &lt;serial&gt; CL0000</code> — the box resolves its
       own identity without needing real DNS. At the end it's reset to a clean
       <code>127.0.0.1\\tlocalhost</code>.</p>`,
      `<h3>🤝 Device types decide everything</h3>
       <p>The first API call returns a <code>type</code>, and the script refuses to
       continue if it's wrong (<code>if [ "$TYPE" != "CL" ]</code> → shut down).
       Each device family has its own QC runner binary:</p>
       <table>
         <tr><th>Type</th><th>QC runner</th><th>Placeholder</th></tr>
         <tr><td>CL (CloudLink)</td><td><code>cl_qc_runner</code></td><td><code>CL0000</code></td></tr>
         <tr><td>OBT</td><td><code>obt_qc_runner</code></td><td><code>OBT00000</code></td></tr>
       </table>
       <p>BX50 and R3000 are the larger units these CM4 boards live inside.</p>`,
    ],
    stages: [
      {
        type: 'match',
        title: 'Type → Behaviour',
        instructions: 'Match each repo fact about device identity to its meaning.',
        pairs: [
          { left: 'cl_qc_runner', right: 'The QC runner binary for CloudLink (CL) devices', explain: 'obtValidation uses obt_qc_runner instead — same flags, different device family.' },
          { left: 'if [ "$TYPE" != "CL" ]', right: 'Guard: wrong device type → shut the device down', explain: 'The server tells the device what it is; a mismatch aborts provisioning safely.' },
          { left: 'sed … 127.0.0.1 … ${CLOUDLINK_SN}', right: 'Make the box resolve its own serial via loopback', explain: 'Local self-resolution so services find the device by name with no real DNS.' },
          { left: '127.0.0.1\\tlocalhost (reset at end)', right: 'Clean the hosts file back to a known state', explain: 'Provisioning leaves no identity crumbs behind once it finishes.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Identity Logic',
        questions: [
          {
            q: 'Why add ${CLOUDLINK_SN} and CL0000 to the 127.0.0.1 line instead of using the DNS servers?',
            choices: [
              'Local self-resolution works even while the device is isolated (no route/DNS needed)',
              'It is faster than DNS',
              'DNS cannot store serial numbers',
              'It hides the device from the network',
            ],
            answer: 0,
            explain: 'The device spends most of provisioning offline. /etc/hosts resolves its own name with zero network dependency.',
          },
          {
            q: 'An OBT validation run uses which QC runner and placeholder?',
            choices: [
              'obt_qc_runner and OBT00000',
              'cl_qc_runner and CL0000',
              'bx50_qc_runner and BX50',
              'qc_runner and OBT',
            ],
            answer: 0,
            explain: 'obtValidation.sh.j2 sets QC_RUNNER="obt_qc_runner" and seeds OBT00000 — mirror image of the CL script.',
          },
          {
            q: 'The first API response says TYPE="OBT" but this is the CL validation script. What happens?',
            choices: [
              'The CL script detects the mismatch and shuts the device down (it is not a CL device)',
              'It silently converts to OBT mode',
              'It crashes with no cleanup',
              'It runs both runners',
            ],
            answer: 0,
            explain: 'The type guard prevents running CL provisioning on an OBT board — wrong device, safe shutdown.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Tag the Device Identity',
        instructions: 'Complete the /etc/hosts grafting and the QC runner for a CloudLink device.',
        template: '# Make the box resolve its own identity locally:\nsed -i "/^127.0.0.1/s/$/ ${{0}}/" /etc/hosts\nsed -i "/^127.0.0.1/s/$/ {1}/"  /etc/hosts\n\n# This CL device uses which QC runner?\nQC_RUNNER="{2}"',
        blanks: [
          { answer: 'CLOUDLINK_SN', explain: 'The device serial, appended onto the loopback line.' },
          { answer: 'CL0000', explain: 'The CloudLink placeholder name.' },
          { answer: 'cl_qc_runner', explain: 'CloudLink devices use cl_qc_runner; OBT devices use obt_qc_runner.' },
        ],
        tokens: ['CLOUDLINK_SN', 'CL0000', 'cl_qc_runner', 'OBT00000', 'obt_qc_runner', 'localhost'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — Hosts File Tricks',
        questions: [
          {
            q: 'In `ss -tulpn` style debugging, why might a service be reachable by name locally but not remotely?',
            choices: [
              'The /etc/hosts entry only resolves the name on THIS box — other machines never see it',
              'hosts entries are broadcast to the LAN',
              'It also opens a firewall port',
              'It changes the default route',
            ],
            answer: 0,
            explain: '/etc/hosts is purely local. Remote peers need real DNS (or Netbird/Teleport names) to resolve the device.',
          },
          {
            q: 'The CL serial is also added to /etc/hosts AND sent to the API as part of the device record. The API field for the WiFi identity is built from what?',
            choices: [
              'WIFI_MAC = cat /sys/class/net/wlan0/address',
              'The serial number only',
              'A random UUID',
              'The public IP',
            ],
            answer: 0,
            explain: 'The script reads the wlan0 MAC straight from sysfs and posts it (with the SIM number) so the AAS can match the physical device.',
          },
        ],
      },
    ],
  },

  /* ================= AAS 4 ================= */
  {
    id: 'aas-vpn',
    icon: '🛰️',
    title: 'Legacy VPN → Netbird Migration',
    badge: 'Migration Mapper',
    lesson: [
      `<h3>🛰️ How the BX50 gets its VPN today</h3>
       <p>The validation script pulls a per-device VPN config from the cloud and
       activates it — the manual, file-based approach Netbird is designed to replace:</p>
       <pre>http_request POST .../getCM4VPN  simNumber "$SIM_NUMBER"
PRESIGNED_URL=$(... jq -r '.presignedUrl')   # short-lived S3 link
curl -s -k -O "$PRESIGNED_URL"               # download the VPN file
\${QC_RUNNER} -v "enable"                     # activate the VPN
# → report vpnFileUpload = 1 to the AAS</pre>
       <p>One config file per device, fetched and enabled by hand — exactly the
       fragile pattern the fundamentals doc's Phase 5 says to migrate.</p>`,
      `<h3>🔁 The same flow, reimagined with Netbird</h3>
       <pre># Instead of: route surgery + presigned download + qc_runner -v enable
sudo netbird up --setup-key &lt;KEY&gt; --hostname "bx50-{{ inventory_hostname }}"
# Device joins the mesh. No file, no manual routes.

# enable/disable_networking could even become:
netbird up      # join mesh  → cloud-link validation can run
netbird down    # leave mesh → isolated again</pre>
       <p>And QC gets a clean pass/fail signal:
       <code>netbird status --json | jq -e '.management.connected'</code>.</p>`,
    ],
    stages: [
      {
        type: 'order',
        title: 'The Legacy VPN Pull',
        instructions: 'Order the current BX50 VPN provisioning steps from the validation script.',
        steps: [
          { text: 'POST /getCM4VPN with the SIM number to ask the AAS for this device\'s VPN', explain: 'The server knows which VPN config belongs to which SIM/device.' },
          { text: 'Parse presignedUrl + fileName from the JSON response (jq)', explain: 'A short-lived S3 presigned URL — no long-term credentials on the device.' },
          { text: 'enable_networking, then curl -s -k -O the presigned URL (retry up to 15×)', explain: 'Download the actual VPN config file while briefly online.' },
          { text: 'Run ${QC_RUNNER} -v "enable" to activate the VPN', explain: 'The QC runner installs/enables the tunnel from the downloaded file.' },
          { text: 'Report vpnFileUpload = 1 back to the AAS API', explain: 'The dashboard now shows this provisioning step as passed.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Why Migrate?',
        questions: [
          {
            q: 'Which pain points of the current getCM4VPN flow does `netbird up --setup-key` remove?',
            choices: [
              'Per-device config files, manual route management, and presigned-URL downloads',
              'The need for any internet at all',
              'WireGuard encryption',
              'The AAS API entirely',
            ],
            answer: 0,
            explain: 'Setup-key enrollment = zero config files, auto route management, auto peer discovery. The doc\'s Phase 5 migration in one line.',
          },
          {
            q: 'For a headless BX50 with no browser, how does Netbird enrol the device?',
            choices: [
              'sudo netbird up --setup-key ⟨KEY⟩ (a pre-auth token, ideal for ansible fleets)',
              'It opens a browser for OAuth',
              'It cannot — Netbird needs a GUI',
              'You type a password on the kiosk',
            ],
            answer: 0,
            explain: 'Reusable setup keys with an auto-group are exactly how the ansible role should enrol kiosks — no human at the device.',
          },
          {
            q: 'How could the enable/disable_networking pattern map onto Netbird?',
            choices: [
              '`netbird up` to join the mesh for validation, `netbird down` to isolate again',
              'It cannot be replaced',
              'Only by keeping the route surgery',
              'By disabling wlan0',
            ],
            answer: 0,
            explain: 'One command each way replaces resolv.conf swapping + route bookkeeping, and status --json gives QC a clean signal.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Complete the VPN Pull',
        instructions: 'Reconstruct the legacy VPN provisioning steps the BX50 runs today.',
        template: '# 1. Ask the AAS for this device VPN\nhttp_request POST .../getCM4VPN simNumber "$SIM_NUMBER"\n\n# 2. Download it from the presigned URL\ncurl -s -k {0} "$PRESIGNED_URL"\n\n# 3. Activate the VPN\n${QC_RUNNER} {1} "{2}"',
        blanks: [
          { answer: '-O', explain: 'curl -O saves the file under its remote name.' },
          { answer: '-v', explain: 'The QC runner VPN flag.' },
          { answer: 'enable', explain: 'Turn the downloaded VPN on.' },
        ],
        tokens: ['-O', '-v', 'enable', '-r', 'disable', '-c'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — Migration Details',
        questions: [
          {
            q: 'What does attaching an auto-group (e.g. "bx50-devices") to the setup key buy you?',
            choices: [
              'Every enrolled kiosk lands in the right ACL group automatically — no manual tagging',
              'Faster downloads',
              'A public IP per kiosk',
              'Automatic OS updates',
            ],
            answer: 0,
            explain: 'Auto-group + reusable key = fleet enrollment where policy is applied the instant a device joins.',
          },
          {
            q: 'Why is a presigned S3 URL used instead of baking VPN credentials into the image?',
            choices: [
              'It is short-lived and device-scoped — no long-term secret sits on the kiosk',
              'It is faster than HTTPS',
              'S3 is free',
              'It avoids needing DNS',
            ],
            answer: 0,
            explain: 'Least privilege again: a time-limited link beats a static credential that could leak from a flashed image.',
          },
        ],
      },
    ],
  },

  /* ================= AAS 5 ================= */
  {
    id: 'aas-teleport',
    icon: '🔐',
    title: 'Teleport — Your Real Zero-Trust Mesh',
    badge: 'Teleport Tactician',
    lesson: [
      `<h3>🔐 What actually gives you remote access today</h3>
       <p>Netbird is the mesh from the fundamentals doc — but the BX50 image already
       ships a different zero-trust access plane: <b>Teleport</b>
       (<code>postinstall.sh.j2</code> writes <code>/etc/teleport.yaml</code>):</p>
       <pre>teleport:
  auth_token: "/var/lib/teleport/joinToken"   # join secret
  ca_pin: "sha256:68e9…"                       # pin the cluster CA (anti-MITM)
  auth_servers: ["teleport.kpmpower.ca:443"]   # the cluster
ssh_service:
  enabled: "yes"
  labels: { type: "bx50", access: "prod" }     # ACL grouping
app_service:
  enabled: "yes"
  apps: [{ name: "&lt;bx50-id&gt;", uri: "http://localhost:6001" }]
proxy_service: { enabled: "no" }               # this node is an AGENT,
auth_service:  { enabled: "no" }               #   not the cluster brain</pre>`,
      `<h3>🆚 Three ways to reach a device — know the difference</h3>
       <table>
         <tr><th>Tech</th><th>Model</th><th>How you connect</th></tr>
         <tr><td><b>Legacy VPN</b></td><td>per-device file + routes</td><td>download config, enable tunnel</td></tr>
         <tr><td><b>Netbird</b></td><td>WireGuard mesh, peer IPs</td><td><code>ssh user@100.64.0.x</code></td></tr>
         <tr><td><b>Teleport</b></td><td>identity-aware proxy, short-lived certs</td><td><code>tsh ssh user@bx50-id</code></td></tr>
       </table>
       <p>Teleport's <code>ca_pin</code> is trust-on-first-use pinning — the same idea as
       SSH <code>known_hosts</code> — so a rogue auth server can't impersonate the cluster.
       And <code>labels</code> work like Netbird's ACL <b>groups</b>.</p>`,
    ],
    stages: [
      {
        type: 'match',
        title: 'Decode teleport.yaml',
        instructions: 'Match each field of the real BX50 teleport.yaml to its job.',
        pairs: [
          { left: 'ca_pin: "sha256:…"', right: 'Pin the cluster CA — a rogue auth server can\'t impersonate it (TOFU, like known_hosts)', explain: 'Trust-on-first-use fingerprint pinning prevents MITM during the node\'s first join.' },
          { left: 'auth_token: /var/lib/teleport/joinToken', right: 'The secret that lets this node JOIN the cluster', explain: 'Like a Netbird setup key — proves the device is allowed to enrol.' },
          { left: 'labels: type=bx50, access=prod', right: 'Group the node for access policies (like Netbird ACL groups)', explain: 'Admins write rules against labels, not individual hostnames.' },
          { left: 'app_service uri http://localhost:6001', right: 'Expose the device\'s local web app through the proxy', explain: 'Reach the BX50\'s local UI without opening any inbound port — the proxy brokers it.' },
          { left: 'proxy_service: no / auth_service: no', right: 'This node is an AGENT, not the cluster brain', explain: 'The Pi only runs the ssh/app agent; the real proxy+auth live at teleport.kpmpower.ca.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Teleport vs Netbird vs VPN',
        questions: [
          {
            q: 'Teleport\'s ca_pin is most analogous to which familiar mechanism?',
            choices: [
              'SSH known_hosts fingerprint pinning (trust-on-first-use, anti-MITM)',
              'A firewall allow-list',
              'A DNS A record',
              'A WireGuard private key',
            ],
            answer: 0,
            explain: 'Both pin a public-key fingerprint so an impostor presenting a different key is rejected.',
          },
          {
            q: 'Teleport labels (type:bx50, access:prod) play the same role as what in Netbird?',
            choices: [
              'ACL groups — policies are written against the group, not each device',
              'The 100.64.x.x mesh IP',
              'The STUN server',
              'The exit node',
            ],
            answer: 0,
            explain: 'Group/label-based policy is the zero-trust pattern in both tools: admins→bx50-devices, or access:prod→admins.',
          },
          {
            q: 'How do you SSH to a BX50 through Teleport vs through Netbird?',
            choices: [
              'Teleport: `tsh ssh user@⟨bx50-id⟩` (cert-based via proxy). Netbird: `ssh user@100.64.0.x` (direct over the mesh)',
              'Both use `tsh`',
              'Both require a presigned URL',
              'Teleport needs the mesh IP too',
            ],
            answer: 0,
            explain: 'Teleport brokers an identity-aware, short-lived-cert session through its proxy; Netbird gives you a flat L3 mesh you SSH across directly.',
          },
          {
            q: 'Why are proxy_service and auth_service disabled in the BX50\'s teleport.yaml?',
            choices: [
              'The Pi is just an agent/node — the proxy and auth live centrally at teleport.kpmpower.ca:443',
              'To save memory only',
              'Because the device is offline',
              'They are deprecated fields',
            ],
            answer: 0,
            explain: 'Thousands of kiosks are agents reporting to one cluster brain — only that central server runs proxy+auth.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Complete teleport.yaml',
        instructions: 'Fill in the BX50 Teleport agent config.',
        template: 'ssh_service:\n  enabled: "yes"\n  labels: { type: "{0}", access: "prod" }\napp_service:\n  enabled: "yes"\n  apps:\n  - uri: "http://localhost:{1}"\nproxy_service: { enabled: "{2}" }   # agent, not the brain',
        blanks: [
          { answer: 'bx50', explain: 'The label that groups this node for access policies.' },
          { answer: '6001', explain: 'The local app the proxy brokers — no inbound port is opened.' },
          { answer: 'no', explain: 'proxy_service/auth_service are off: this Pi is an agent; the cluster lives at teleport.kpmpower.ca.' },
        ],
        tokens: ['bx50', '6001', 'no', 'yes', '443', 'obt', '5001'],
      },
      {
        type: 'quiz',
        bonus: true,
        title: 'Good to Know — The Access Stack',
        questions: [
          {
            q: 'env.j2 sets SSH_HOST=ssh.anzenbms.com, SSH_PORT=22, plus TELEPORT_TOKEN_URL=teleport.anzenbms.com:16002. What does this combination give the AAS?',
            choices: [
              'A bastion/jump path and a Teleport join-token endpoint for remotely reaching provisioned devices',
              'A public IP for every BX50',
              'A DNS server',
              'A backup VPN file',
            ],
            answer: 0,
            explain: 'The AAS brokers access: an SSH bastion plus a Teleport token service so devices behind NAT stay reachable by identity, not IP.',
          },
          {
            q: 'app_service exposes http://localhost:6001 with insecure_skip_verify: true. Why is that acceptable here?',
            choices: [
              'The hop the proxy makes is to localhost on the same box — the public-facing TLS is terminated at the Teleport proxy',
              'Because TLS is never needed',
              'Because the app has no data',
              'It is a security bug',
            ],
            answer: 0,
            explain: 'External clients hit the proxy over real TLS; the proxy→localhost:6001 leg never leaves the device, so skipping verify on that internal hop is fine.',
          },
          {
            q: 'A Teleport ssh_service command runs `uptime -p` every 5m and reports it. What is this for?',
            choices: [
              'Inventory/health labels surfaced in the Teleport UI — like Netbird showing peer status',
              'Keeping the tunnel alive',
              'Rotating certificates',
              'Measuring bandwidth',
            ],
            answer: 0,
            explain: 'Periodic label commands (uptime, bx50 version, teleport version) feed a live fleet dashboard — observability baked into access.',
          },
        ],
      },
    ],
  },

  /* ================= AAS 6 (BOSS) ================= */
  {
    id: 'aas-boss',
    icon: '🐉',
    title: 'BOSS — BX50 Field Troubleshooter',
    badge: 'AAS Field Engineer',
    lesson: [
      `<h3>🐉 A kiosk in the field won't provision</h3>
       <p>You're debugging a real BX50 running the validation script. Combine the
       fundamentals with the repo specifics:</p>
       <pre>ip route | grep default      # is the doorman (10.0.32.1 wlan0) there?
cat /etc/resolv.conf         # are 192.168.1.21/.20 set?
dig +short host.kpmpowerlab.com   # does DNS resolve through the gateway?
curl -k -v https://&lt;host&gt;:5001/   # does the AAS API answer? (timeout vs refused)
tsh status                   # is Teleport access healthy?</pre>
       <p>Diagnose each incident, then claim the <b>AAS Field Engineer</b> badge.</p>`,
    ],
    stages: [
      {
        type: 'quiz',
        title: 'Field Incident Queue',
        questions: [
          {
            context: 'INCIDENT #1\nThe script logs:\n  curl: (28) Connection timed out\nfor every POST to https://⟨host⟩:5001',
            q: 'First thing to check?',
            choices: [
              'Did enable_networking run? `ip route | grep default` — a missing 10.0.32.1 route means nothing leaves the device',
              'The AAS database',
              'The PicoUPS battery',
              'The SIM number',
            ],
            answer: 0,
            explain: 'Timeout = packets going nowhere. On this device that usually means disable_networking left the default route deleted.',
          },
          {
            context: 'INCIDENT #2\n`dig +short aas.kpmpowerlab.com` hangs,\nbut `cat /etc/resolv.conf` shows the correct\nnameservers 192.168.1.21 / .20.',
            q: 'Most likely cause?',
            choices: [
              'No default route — the 192.168.1.x DNS servers are cross-subnet and unreachable without the gateway',
              'The nameservers are wrong',
              'DNS is always broken on wlan0',
              'The search domain is missing',
            ],
            answer: 0,
            explain: 'Correct resolv.conf is useless if you can\'t reach the resolvers. resolv.conf and the route must both be present.',
          },
          {
            context: 'INCIDENT #3\nThe API replies:\n  HTTP 410\nand the script calls disable_networking and exits.',
            q: 'Is this a failure?',
            choices: [
              'No — 410 means the validation service was stopped server-side; shutting the door is the correct response',
              'Yes, restart the device immediately',
              'Yes, the route is broken',
              'Yes, DNS failed',
            ],
            answer: 0,
            explain: '410 Gone is an intentional server signal. (404/405 trigger an exit+restart; 2xx is success; everything else retries.)',
          },
          {
            context: 'INCIDENT #4\n`curl https://⟨host⟩:5001/` returns\n  curl: (7) Connection refused\n(the route and DNS are confirmed good)',
            q: 'Diagnosis?',
            choices: [
              'You reached the host but nothing is listening on 5001 — the AAS API service is down or bound wrong',
              'A firewall is dropping packets',
              'The default route is missing',
              'DNS failed',
            ],
            answer: 0,
            explain: 'Refused = network path is fine, the app isn\'t. Timeout would point back at routing/firewall. Check the API service + `ss -tulpn` on the host.',
          },
          {
            context: 'INCIDENT #5\nDevices in the TEST lab get Aruba switch URL\nT-HP-24-1, but a PROD run expects\nE-HP-48-1 / F-HP-24-1.',
            q: 'What controls which URL the env gets?',
            choices: [
              'group_vars `prod_build_subnet` (== 31 selects the prod Aruba switches in env.j2)',
              'The device serial number',
              'The SIM number',
              'A random choice',
            ],
            answer: 0,
            explain: 'env.j2 branches on `{% if prod_build_subnet == 31 %}` to pick the prod vs test Aruba switch management URLs.',
          },
          {
            context: 'INCIDENT #6\nA provisioned BX50 sits behind a factory NAT.\nYou need a shell on it from your desk — its\nIP changes and ddns_update.sh.j2 is marked\n"NOT CURRENTLY IN USE".',
            q: 'What is the intended access path?',
            choices: [
              'Teleport — `tsh ssh user@⟨bx50-id⟩`, identity-based, works behind NAT without a stable IP',
              'Port-forward the factory router',
              'Re-enable dynamic DNS and SSH to the IP',
              'Drive to the factory',
            ],
            answer: 0,
            explain: 'The dynamic-DNS approach (stable name for a changing IP) was abandoned in favour of Teleport, which reaches NATed devices by identity — the same problem Netbird solves with its mesh.',
          },
        ],
      },
      {
        type: 'fill',
        title: 'Scenario: Field Triage Commands',
        instructions: 'A BX50 will not provision. Fill the command for each triage step.',
        template: '# Triage in order:\nip route | grep {0}             # is the doorman present?\ndig +short {1}.kpmpowerlab.com   # DNS via 192.168.1.21?\ncurl -k {2}://host:5001/         # is the AAS API answering?',
        blanks: [
          { answer: 'default', explain: 'Check the default route (gw 10.0.32.1 on wlan0) exists.' },
          { answer: 'aas', explain: 'Resolve an internal name through the configured DNS server.' },
          { answer: 'https', explain: 'The AAS API is HTTPS on port 5001.' },
        ],
        tokens: ['default', 'aas', 'https', 'gateway', 'ping', 'http'],
      },
      {
        type: 'match',
        bonus: true,
        title: 'Good to Know — The BX50 Layer Ladder',
        instructions: 'Final exercise: match each check to the layer it tests on a real BX50.',
        pairs: [
          { left: 'ping 10.0.32.1', right: 'L3 — can I even reach my own gateway?', explain: 'If the gateway itself is unreachable, the default route or wlan0 link is the problem.' },
          { left: 'dig +short host.kpmpowerlab.com', right: 'DNS — does name resolution work through 192.168.1.21?', explain: 'Failure usually means the route to the cross-subnet DNS server is missing.' },
          { left: 'curl -k https://⟨host⟩:5001/', right: 'L7 — is the AAS API actually answering?', explain: 'Timeout → routing/firewall; refused → service down; 2xx → all good.' },
          { left: 'tsh status', right: 'Access plane — is Teleport connectivity healthy?', explain: 'Confirms the identity-aware path is up even when raw networking looks fine.' },
        ],
      },
    ],
  },
];

/* =====================================================================
   TRACKS — the two learning paths shown on the home screen
   ===================================================================== */
const TRACKS = [
  {
    id: 'fundamentals',
    icon: '🕸️',
    name: 'Networking Fundamentals',
    blurb: 'IPs, subnets, routing, firewalls, NAT, P2P, WireGuard & Netbird policies — the universal building blocks.',
    certTitle: 'MESH MASTER',
    certSub: 'Certificate of Network Mastery',
    levels: LEVELS,
  },
  {
    id: 'aas',
    icon: '🏭',
    name: 'AAS Field Track',
    blurb: 'How networking really works in YOUR repos — the BX50/CloudLink validation scripts, the legacy VPN flow, and Teleport zero-trust access.',
    certTitle: 'AAS FIELD ENGINEER',
    certSub: 'Certificate of Repo-Grounded Mastery',
    levels: AAS_LEVELS,
  },
];
