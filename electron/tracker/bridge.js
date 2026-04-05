// Local HTTP bridge - the Chrome extension posts browser-side events here
// (per-URL dwell time, LinkedIn profile metadata, connections/messages, etc).
//
// Listens on 127.0.0.1 only so no external process can talk to it.

const http = require("http");

const ALLOWED_ORIGINS = [
  "chrome-extension://",
  "http://localhost",
  "http://127.0.0.1",
];

function cors(res, origin) {
  // Allow only chrome extensions and localhost.
  const ok = origin && ALLOWED_ORIGINS.some((p) => origin.startsWith(p));
  if (ok) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-PA-Token");
}

class Bridge {
  constructor({ store, port = 47624 }) {
    this.store = store;
    this.port = port;
    this.server = null;
  }

  start() {
    this.server = http.createServer((req, res) => {
      cors(res, req.headers.origin);
      if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

      if (req.url === "/ping" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, app: "productivity-analyser" }));
        return;
      }

      if (req.url === "/dwell" && req.method === "POST") {
        this._readJson(req, (err, body) => {
          if (err) return this._bad(res, err.message);
          // body: { ts, url, domain, dwell_ms, title }
          this.store.insertSample({
            ts: body.ts || Date.now(),
            duration_ms: body.dwell_ms || 0,
            app: "Browser",
            title: body.title,
            url: body.url,
            domain: body.domain,
            idle: 0,
          });
          res.writeHead(200); res.end("{}");
        });
        return;
      }

      if (req.url === "/event" && req.method === "POST") {
        this._readJson(req, (err, body) => {
          if (err) return this._bad(res, err.message);
          // body: { source, type, profile_name, profile_title, profile_url, meta }
          if (!body.source || !body.type) return this._bad(res, "source+type required");
          this.store.insertEvent({
            ts: body.ts || Date.now(),
            source: body.source,
            type: body.type,
            profile_name: body.profile_name,
            profile_title: body.profile_title,
            profile_url: body.profile_url,
            meta: body.meta,
          });
          res.writeHead(200); res.end("{}");
        });
        return;
      }

      res.writeHead(404); res.end();
    });

    this.server.listen(this.port, "127.0.0.1", () => {
      console.log(`[bridge] listening on 127.0.0.1:${this.port}`);
    });
  }

  stop() {
    if (this.server) this.server.close();
  }

  _readJson(req, cb) {
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on("end", () => {
      try { cb(null, JSON.parse(data || "{}")); }
      catch (e) { cb(e); }
    });
    req.on("error", cb);
  }

  _bad(res, msg) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: msg }));
  }
}

module.exports = Bridge;
