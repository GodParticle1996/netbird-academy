/* =====================================================================
   Netbird Academy — Concept Visuals
   One signature diagram per level, built from the .dg-* CSS primitives
   in style.css. Pure HTML/CSS/emoji — no dependencies.
   Each entry: { t: short title, html: diagram markup }
   ===================================================================== */

const VISUALS = {

  /* ---------------- FUNDAMENTALS ---------------- */

  ip: {
    t: 'Anatomy of an IP',
    html: `
      <div class="dg-flow">
        <div class="dg-node is-muted"><span class="ni">🏢</span><span class="nl">Private</span><span class="ns">192.168.1.50</span></div>
        <div class="dg-node is-accent"><span class="ni">🌍</span><span class="nl">Public</span><span class="ns">203.0.113.45</span></div>
        <div class="dg-node is-gold"><span class="ni">🪞</span><span class="nl">Loopback</span><span class="ns">127.0.0.1</span></div>
        <div class="dg-node is-good pulse"><span class="ni">🕸️</span><span class="nl">CGNAT</span><span class="ns">100.64.0.2</span></div>
      </div>
      <div class="dg-legend">
        <span><i class="dg-dot" style="background:#8fa3c0"></i> 10.x · 172.16–31.x · 192.168.x = internal</span>
        <span><i class="dg-dot" style="background:#34d399"></i> 100.64.0.0/10 → Netbird mesh IPs</span>
      </div>
      <div class="dg-cap">An IP is your <b>address</b> — the <b>range</b> it falls in reveals its purpose. Netbird borrows the unused <b>CGNAT</b> range so mesh IPs never clash with home/office LANs.</div>`,
  },

  subnet: {
    t: 'Same building, or take the road?',
    html: `
      <div class="dg-flow">
        <div class="dg-node is-accent"><span class="ni">🏢</span><span class="nl">Building A</span><span class="ns">192.168.1.0/24</span></div>
        <div class="dg-link"><span class="dg-pill">needs a router</span><div class="dg-arrow two"></div></div>
        <div class="dg-node is-gold"><span class="ni">🚪</span><span class="nl">Router</span><span class="ns">between subnets</span></div>
        <div class="dg-link"><span class="dg-pill">&nbsp;</span><div class="dg-arrow two"></div></div>
        <div class="dg-node is-accent"><span class="ni">🏢</span><span class="nl">Building B</span><span class="ns">10.0.0.0/24</span></div>
      </div>
      <div class="dg-flow" style="margin-top:10px">
        <span class="dg-pill good">.50 ↔ .51 ↔ .10 — same /24, talk directly</span>
      </div>
      <div class="dg-cap"><b>Same subnet</b> = same building (knock on any door). <b>Different subnet</b> = drive the road through a router. Gotcha: <code>10.0.32.100/24</code> ≠ <code>10.0.33.5/24</code> even on the same switch!</div>`,
  },

  gateway: {
    t: "The packet's journey",
    html: `
      <div class="dg-flow">
        <div class="dg-node is-accent"><span class="ni">💻</span><span class="nl">You</span><span class="ns">192.168.1.50</span></div>
        <div class="dg-link"><span class="dg-pill">dest not local?</span><div class="dg-arrow flow"></div></div>
        <div class="dg-node is-gold pulse"><span class="ni">🚪</span><span class="nl">Gateway</span><span class="ns">192.168.1.1</span></div>
        <div class="dg-link"><span class="dg-pill acc">hop by hop</span><div class="dg-arrow flow"></div></div>
        <div class="dg-node"><span class="ni">🌐</span><span class="nl">Internet</span><span class="ns">routers…</span></div>
        <div class="dg-link"><span class="dg-pill">&nbsp;</span><div class="dg-arrow flow"></div></div>
        <div class="dg-node is-good"><span class="ni">🖥️</span><span class="nl">Server</span><span class="ns">10.0.0.25</span></div>
      </div>
      <div class="dg-cap">The gateway is the <b>doorman</b>: anything not on your subnet is handed to it. Delete the default route and the internet dies instantly — exactly what BX50 <code>disable_networking()</code> does.</div>`,
  },

  firewall: {
    t: "The guard's checklist",
    html: `
      <div class="dg-flow">
        <div class="dg-col">
          <span class="dg-pill acc">📦 :22 SSH</span>
          <span class="dg-pill acc">📦 :8080 API</span>
          <span class="dg-pill bad">📦 :3306 SQL</span>
        </div>
        <div class="dg-arrow flow"></div>
        <div class="dg-node is-gold pulse"><span class="ni">🛡️</span><span class="nl">Firewall</span><span class="ns">rules, top-down</span></div>
        <div class="dg-col">
          <div class="dg-flow"><div class="dg-arrow good" style="flex-basis:34px"></div><span class="dg-pill good">✓ ALLOW</span></div>
          <div class="dg-flow"><div class="dg-arrow bad" style="flex-basis:34px"></div><span class="dg-pill bad">✗ DROP</span></div>
        </div>
      </div>
      <div class="dg-cap"><b>timeout</b> = silently DROPped (guard says nothing) · <b>refused</b> = reached host, nothing listening. Secure default: <b>deny</b> inbound, allow only what you need.</div>`,
  },

  nat: {
    t: 'One public IP, many devices',
    html: `
      <div class="dg-flow">
        <div class="dg-col">
          <span class="dg-pill">💻 192.168.1.50</span>
          <span class="dg-pill">📱 192.168.1.51</span>
          <span class="dg-pill">🖨️ 192.168.1.10</span>
        </div>
        <div class="dg-link"><span class="dg-pill">many → one</span><div class="dg-arrow flow"></div></div>
        <div class="dg-node is-gold pulse"><span class="ni">📮</span><span class="nl">Router NAT</span><span class="ns">203.0.113.45</span></div>
        <div class="dg-link"><span class="dg-pill acc">remembers ports</span><div class="dg-arrow flow"></div></div>
        <div class="dg-node"><span class="ni">🌐</span><span class="nl">Internet</span></div>
      </div>
      <div class="dg-cap">The mailroom rewrites private → public and tracks only <b>outgoing</b> connections. Unsolicited <b>incoming</b> ones are dropped — which is why you can't SSH home without port-forwarding… or a mesh VPN.</div>`,
  },

  p2p: {
    t: 'Punching through two NATs',
    html: `
      <div class="dg-flow">
        <div class="dg-node is-accent"><span class="ni">💻</span><span class="nl">Laptop</span><span class="ns">behind NAT</span></div>
        <div class="dg-link"><span class="dg-pill gold">🥊 hole punch</span><div class="dg-arrow two flow"></div></div>
        <div class="dg-node is-good"><span class="ni">🍓</span><span class="nl">Factory Pi</span><span class="ns">behind NAT</span></div>
      </div>
      <div class="dg-legend">
        <span><span class="dg-pill acc">STUN</span> "what's my public IP?"</span>
        <span><span class="dg-pill acc">ICE</span> host → srflx → relay</span>
        <span><span class="dg-pill">TURN</span> relay if punch fails</span>
      </div>
      <div class="dg-cap">Both peers fire UDP <b>outward at the same instant</b> — each NAT opens a hole and lets the other's packet in as a "reply". Direct P2P! Same stack as WhatsApp/Zoom calls.</div>`,
  },

  mesh: {
    t: 'Hub vs mesh',
    html: `
      <div class="dg-split">
        <div class="diagram" style="margin:0;background:#160d12">
          <div class="dg-title" style="color:#f87171">❌ Hub &amp; spoke</div>
          <div class="dg-col">
            <div class="dg-node is-bad"><span class="ni">🏤</span><span class="nl">Central VPN</span><span class="ns">bottleneck</span></div>
            <div class="dg-flow"><span class="dg-pill">💻</span><span class="dg-pill">📱</span><span class="dg-pill">🖥️</span></div>
          </div>
          <div class="dg-cap">Everything detours through one box. Mumbai→Frankfurt→Mumbai ≈ 250ms.</div>
        </div>
        <div class="diagram" style="margin:0;background:#0a1a16">
          <div class="dg-title" style="color:#34d399">✅ Netbird mesh</div>
          <div class="dg-flow">
            <span class="dg-pill good">💻 ↔ 📱</span>
            <span class="dg-pill good">📱 ↔ 🖥️</span>
            <span class="dg-pill good">💻 ↔ 🖥️</span>
          </div>
          <div class="dg-flow" style="margin-top:8px"><span class="dg-pill gold">🔒 WireGuard</span></div>
          <div class="dg-cap">Every peer talks direct. Mumbai→Mumbai ≈ 2ms (125× faster).</div>
        </div>
      </div>
      <div class="dg-cap"><b>Netbird = WireGuard + ICE/STUN/TURN + Management Server.</b> The mgmt server only coordinates — your data flows peer-to-peer, so an outage won't cut live tunnels.</div>`,
  },

  policy: {
    t: 'Who may talk to whom',
    html: `
      <div class="dg-flow">
        <div class="dg-node is-gold"><span class="ni">👑</span><span class="nl">admins</span></div>
        <div class="dg-node is-accent"><span class="ni">🏭</span><span class="nl">bx50-devices</span></div>
        <div class="dg-node is-good"><span class="ni">🖥️</span><span class="nl">servers</span></div>
      </div>
      <div class="dg-grid" style="margin-top:12px">
        <div class="dg-rule"><span class="tag">admins</span><div class="dg-arrow good" style="flex-basis:38px"></div><span class="tag">bx50</span><span class="dg-pill good">ALL ports</span></div>
        <div class="dg-rule"><span class="tag">bx50</span><div class="dg-arrow good" style="flex-basis:38px"></div><span class="tag">servers</span><span class="dg-pill good">TCP 8080 / 443</span></div>
        <div class="dg-rule"><span class="tag">bx50</span><div class="dg-arrow bad" style="flex-basis:38px"></div><span class="tag">bx50</span><span class="dg-pill bad">DENY — no lateral move</span></div>
        <div class="dg-rule"><span class="tag">bx50</span><div class="dg-arrow bad" style="flex-basis:38px"></div><span class="tag">admins</span><span class="dg-pill bad">DENY — directional!</span></div>
      </div>
      <div class="dg-cap">Policies are <b>directional</b> group rules (like cloud security groups). A compromised kiosk can't reach other kiosks or SSH your servers — only the one API port it needs.</div>`,
  },

  boss: {
    t: 'The layer ladder',
    html: `
      <div class="dg-ladder">
        <div class="dg-rung"><span class="lv">L3</span><span class="cmd">ping 100.64.0.4</span><span class="q">reach the peer at all?</span></div>
        <div class="dg-rung"><span class="lv">L4</span><span class="cmd">nc -zv 100.64.0.4 8080</span><span class="q">is the port open?</span></div>
        <div class="dg-rung"><span class="lv">L7</span><span class="cmd">curl http://100.64.0.4:8080/</span><span class="q">does the service reply?</span></div>
      </div>
      <div class="dg-legend">
        <span class="dg-pill bad">timeout → DROP (firewall/ACL)</span>
        <span class="dg-pill gold">refused → no listener</span>
        <span class="dg-pill">old handshake → dead tunnel</span>
      </div>
      <div class="dg-cap">Climb one layer at a time. Where it first breaks tells you <b>who</b> to blame: the network, the firewall, or the app itself.</div>`,
  },

  /* ---------------- AAS FIELD TRACK ---------------- */

  'aas-isolate': {
    t: 'Online only when it must be',
    html: `
      <div class="dg-flow">
        <div class="dg-node is-muted"><span class="ni">🔒</span><span class="nl">offline</span><span class="ns">isolated</span></div>
        <div class="dg-link"><span class="dg-pill good">enable_networking</span><div class="dg-arrow good flow"></div></div>
        <div class="dg-node is-good pulse"><span class="ni">🔓</span><span class="nl">online</span><span class="ns">curl :5001</span></div>
        <div class="dg-link"><span class="dg-pill bad">disable_networking</span><div class="dg-arrow bad flow"></div></div>
        <div class="dg-node is-muted"><span class="ni">🔒</span><span class="nl">offline</span><span class="ns">again</span></div>
      </div>
      <div class="dg-cap">Every API call is sandwiched in <code>enable_networking … disable_networking</code>. The kiosk is <b>dark by default</b> — the smallest possible attack surface during factory provisioning.</div>`,
  },

  'aas-resolv': {
    t: 'DNS lives across the gateway',
    html: `
      <div class="dg-flow">
        <div class="dg-node is-accent"><span class="ni">🍓</span><span class="nl">BX50 kiosk</span><span class="ns">10.0.32.100</span></div>
        <div class="dg-link"><span class="dg-pill">cross-subnet</span><div class="dg-arrow flow"></div></div>
        <div class="dg-node is-gold pulse"><span class="ni">🚪</span><span class="nl">Gateway</span><span class="ns">10.0.32.1 · wlan0</span></div>
        <div class="dg-link"><span class="dg-pill acc">DNS query</span><div class="dg-arrow flow"></div></div>
        <div class="dg-node is-good"><span class="ni">📇</span><span class="nl">DNS</span><span class="ns">192.168.1.21</span></div>
      </div>
      <div class="dg-flow" style="margin-top:8px">
        <span class="dg-pill">📝 resolv.conf</span><span style="color:#8fa3c0">+</span><span class="dg-pill">🛣️ default route</span><span class="dg-pill gold">= a package deal</span>
      </div>
      <div class="dg-cap">The DNS servers (192.168.1.x) sit in a <b>different subnet</b>, reachable only <b>through the gateway</b>. So resolv.conf without the route = every lookup hangs.</div>`,
  },

  'aas-identity': {
    t: 'Local identity in /etc/hosts',
    html: `
      <div class="diagram" style="margin:0 0 10px;background:#0a101d">
        <div style="font-family:'Cascadia Code',monospace;font-size:.82rem;color:#a8e6cf">127.0.0.1&nbsp;&nbsp;localhost&nbsp;&nbsp;<span style="color:#fbbf24">\${CLOUDLINK_SN}</span>&nbsp;&nbsp;<span style="color:#34d399">CL0000</span></div>
      </div>
      <div class="dg-flow">
        <div class="dg-node is-accent"><span class="ni">🟦</span><span class="nl">CL device</span><span class="ns">cl_qc_runner</span></div>
        <div class="dg-node is-good"><span class="ni">🟩</span><span class="nl">OBT device</span><span class="ns">obt_qc_runner</span></div>
      </div>
      <div class="dg-cap">The script grafts the serial + placeholder onto the loopback line so the box resolves <b>its own identity</b> with no DNS at all. Wrong <code>TYPE</code> from the API? It shuts down.</div>`,
  },

  'aas-vpn': {
    t: 'Legacy VPN → one command',
    html: `
      <div class="dg-flow">
        <div class="dg-node"><span class="ni">☁️</span><span class="nl">getCM4VPN</span><span class="ns">:5001</span></div>
        <div class="dg-arrow flow"></div>
        <div class="dg-node is-gold"><span class="ni">🔗</span><span class="nl">presigned</span><span class="ns">S3 URL</span></div>
        <div class="dg-arrow flow"></div>
        <div class="dg-node"><span class="ni">⬇️</span><span class="nl">curl -O</span><span class="ns">vpn file</span></div>
        <div class="dg-arrow flow"></div>
        <div class="dg-node is-good"><span class="ni">🔒</span><span class="nl">qc_runner -v</span><span class="ns">enable</span></div>
      </div>
      <div class="dg-flow" style="margin-top:10px">
        <span class="dg-pill" style="opacity:.7">replace all of that with →</span>
        <span class="dg-pill good">netbird up --setup-key &lt;KEY&gt;</span>
      </div>
      <div class="dg-cap">Today: a per-device VPN file, fetched from a presigned URL and enabled by hand. With Netbird it collapses to <b>one command</b> — no files, no route surgery, auto peer discovery.</div>`,
  },

  'aas-teleport': {
    t: 'Reach by identity, not IP',
    html: `
      <div class="dg-flow">
        <div class="dg-node is-accent"><span class="ni">🍓</span><span class="nl">BX50 agent</span><span class="ns">labels: type=bx50</span></div>
        <div class="dg-link"><span class="dg-pill gold">🔐 ca_pin</span><div class="dg-arrow two flow"></div></div>
        <div class="dg-node is-gold pulse"><span class="ni">🛡️</span><span class="nl">Teleport proxy</span><span class="ns">teleport.kpmpower.ca:443</span></div>
        <div class="dg-link"><span class="dg-pill acc">tsh ssh</span><div class="dg-arrow two flow"></div></div>
        <div class="dg-node is-good"><span class="ni">👩‍💻</span><span class="nl">You</span><span class="ns">short-lived cert</span></div>
      </div>
      <div class="dg-flow" style="margin-top:8px"><span class="dg-pill">app_service → http://localhost:6001 brokered · no inbound port opened</span></div>
      <div class="dg-cap"><b>ca_pin</b> pins the cluster CA (trust-on-first-use, like SSH known_hosts). <b>Labels</b> act as ACL groups. Reaches NATed kiosks by <b>identity, not IP</b> — the same problem Netbird solves with its mesh.</div>`,
  },

  'aas-boss': {
    t: 'BX50 field triage',
    html: `
      <div class="dg-ladder">
        <div class="dg-rung"><span class="lv">1</span><span class="cmd">ip route | grep default</span><span class="q">doorman 10.0.32.1 present?</span></div>
        <div class="dg-rung"><span class="lv">2</span><span class="cmd">dig +short host.kpmpowerlab.com</span><span class="q">DNS via 192.168.1.21?</span></div>
        <div class="dg-rung"><span class="lv">3</span><span class="cmd">curl -k https://host:5001/</span><span class="q">AAS API answering?</span></div>
        <div class="dg-rung a"><span class="lv">4</span><span class="cmd">tsh status</span><span class="q">Teleport access healthy?</span></div>
      </div>
      <div class="dg-cap">Work outward: link → route → DNS → API → access plane. <b>timeout</b> ⇒ routing/firewall; <b>refused</b> ⇒ the service is down, not the network.</div>`,
  },

};
