# 🕸️ Netbird Academy

An interactive, gamified learning app for networking. It has **two tracks**:

1. **🕸️ Networking Fundamentals** — IPs, subnets, gateways/routing, firewalls, NAT,
   P2P hole punching, WireGuard, mesh VPNs, and Netbird groups/ACL policies. Based on
   [`aas-docs/netbird-networking-fundamentals.md`](../aas-docs/netbird-networking-fundamentals.md).
2. **🏭 AAS Field Track** — how networking really works in *your own repos*: the BX50/
   CloudLink validation scripts, the enable/disable-networking pattern, the legacy VPN
   flow, and Teleport zero-trust access. Grounded directly in
   [`aas-ansible`](../aas-ansible/) (`cloudLinkValidation.sh.j2`, `obtValidation.sh.j2`,
   `postinstall.sh.j2`, `env.j2`).

Pick a track on the home screen; each has its own level map, badges, and certificate.
XP and ranks are shared across both.

## Run it

No build, no dependencies — pure HTML/CSS/JS:

```bash
# Option 1: just open the file (works fine, everything is local)
explorer.exe index.html        # from WSL
# or double-click index.html in Windows Explorer

# Option 2: serve it
cd netbird-academy
python3 -m http.server 8000
# → http://localhost:8000
```

## How it works

- **15 levels total** (9 Fundamentals + 6 AAS Field) that unlock sequentially within
  each track, each with a short illustrated lesson followed by interactive challenges
  **plus a 🎁 "Good to Know" bonus round** (extra XP, deeper command/ops trivia).
- **Game types:**
  - 🗂️ **Sorting bins** — drag IPs/concepts into category bins (drag-and-drop or tap-tap)
  - 🔢 **Sequence builder** — order the steps of a packet journey, NAT translation, or hole punch
  - 🔗 **Matching** — pair technologies with their roles (STUN, TURN, ICE, WireGuard…)
  - 🧩 **Complete-the-command** — drag tokens into the blanks of a real command/config
    (a default route, a ufw rule, resolv.conf, an ACL policy, `teleport.yaml`, …) — one
    scenario per level
  - 🧠 **Scenario quizzes** — play the firewall guard, the ACL, and the on-call troubleshooter
- **Every level is drag-and-drop interactive** — each has at least one sorting/sequencing/
  matching challenge plus its own "complete-the-command" scenario, then a 🎁 bonus round.
- **Every concept is visualized** — each level has a signature animated diagram
  (HTML/CSS/SVG, no images) showing the idea: IP ranges, two buildings + a router, the
  packet's journey through a gateway, the firewall guard's ALLOW/DROP lanes, NAT's
  many→one mapping, the NAT hole-punch, hub-vs-mesh, the directional ACL matrix, the
  enable/disable-networking gate, cross-subnet DNS, the Teleport identity path, and more.
  The diagram appears on each level's intro and as a "📊 Show concept diagram" toggle
  during play. See them all at once by opening [`gallery.html`](gallery.html).
- **Progression:** XP per first-try correct answer, perfect-challenge bonuses,
  11 ranks (Packet Newbie → Mesh Master → Netbird Legend → AAS Field Engineer),
  per-level badges and 1–3 stars. XP/ranks are shared across both tracks.
- **Progress is saved** in `localStorage` — close the tab and pick up later.
  Reset anytime from the home screen.
- Finish a track (including its Boss level) to earn that track's certificate —
  **Mesh Master** 🕸️ for Fundamentals, **AAS Field Engineer** 🏭 for the AAS Field track.

## Track 1 — 🕸️ Networking Fundamentals

| # | Level | You learn |
|---|-------|-----------|
| 1 | 🏠 Who Are You? — IP Addresses | Private/public/loopback/CGNAT ranges, why Netbird uses 100.64.0.0/16 |
| 2 | 🏘️ Your Neighborhood — Subnets & CIDR | Subnet masks, CIDR math, the "same switch, can't ping" bug |
| 3 | 🚪 The Doorman — Gateways & Routing | Default routes, packet journeys, traceroute |
| 4 | 🛡️ The Security Guard — Firewalls | Rules, default policies, timeout vs refused, ss -tulpn |
| 5 | 📮 The Mail Forwarder — NAT | Translation tables, NAT types, why incoming connections die |
| 6 | 🥊 Hole Punch Hero — P2P & NAT Traversal | STUN/ICE/TURN, the hole-punch dance, srflx vs relay |
| 7 | 🕸️ Mesh vs Hub — VPNs & WireGuard | Hub-and-spoke vs mesh, WireGuard crypto, management plane |
| 8 | 📜 Policy Architect — Groups & ACLs | Netbird security groups, directional policies, setup keys |
| 9 | 🐉 Boss — The Troubleshooter | Real incident diagnosis using the layer ladder |

## Track 2 — 🏭 AAS Field Track (repo-specific)

Every level is grounded in real code from `aas-ansible`.

| # | Level | You learn (from the repo) |
|---|-------|---------------------------|
| 1 | 🔌 The Enable/Disable Dance | `enable_networking`/`disable_networking` wrapping every API call; isolate-by-default; 410/404/405 handling |
| 2 | 📇 resolv.conf & the Doorman | DNS (`192.168.1.21/.20`) vs gateway (`10.0.32.1 wlan0`); why resolv.conf + route are a package deal |
| 3 | 🏷️ /etc/hosts & Device Identity | The loopback SN trick, device types CL/OBT, `cl_qc_runner`/`obt_qc_runner`, type guards |
| 4 | 🛰️ Legacy VPN → Netbird Migration | `getCM4VPN` → presigned URL → `qc_runner -v enable`, and how `netbird up` replaces it |
| 5 | 🔐 Teleport — Your Real Zero-Trust Mesh | `teleport.yaml` (`ca_pin`, labels, `app_service`); Teleport vs Netbird vs legacy VPN |
| 6 | 🐉 Boss — BX50 Field Troubleshooter | Diagnose real provisioning failures; the BX50 layer ladder; Aruba prod/test, Teleport-over-NAT |
