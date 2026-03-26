import { useState } from "react"

const PORT_NAMES = { 80: "HTTP", 554: "RTSP", 8080: "HTTP-ALT", 23: "TELNET", 37777: "DAHUA" }

const SEVERITY_COLORS = {
  Critical: "text-red-400 bg-red-400/10 border-red-400/30",
  High:     "text-orange-400 bg-orange-400/10 border-orange-400/30",
  Medium:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Low:      "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
}

const CVSS_COLOR = (score) => {
  if (score >= 9) return "bg-red-400"
  if (score >= 7) return "bg-orange-400"
  if (score >= 4) return "bg-yellow-400"
  return "bg-emerald-400"
}

export default function DeviceCard({ device, index }) {
  const [open, setOpen] = useState(false)
  const vulns = device.vulnerabilities || []
  const creds = device.default_creds || []

  return (
    <div
      className="bg-[#0d1f2d] border border-[#1a3a4a] rounded-xl overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_24px_rgba(0,229,255,0.1)] transition-all"
      style={{ animation: `fadeSlideIn 0.4s ease forwards`, animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-[#1a3a4a] cursor-pointer hover:bg-cyan-400/5 transition-all"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg text-cyan-400">{device.ip}</span>
          <span className="font-mono text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-1 rounded">
            ● {(device.status || "up").toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            {(device.open_ports || []).map((p) => (
              <span key={p} className="font-mono text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-1 rounded">
                {PORT_NAMES[p] || p}:{p}
              </span>
            ))}
          </div>

          {vulns.length > 0 ? (
            <span className="font-mono text-xs text-red-400 bg-red-400/10 border border-red-400/30 px-3 py-1 rounded">
              ⚠ {vulns.length} VULN{vulns.length > 1 ? "S" : ""}
            </span>
          ) : (
            <span className="font-mono text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded">
              ✓ CLEAN
            </span>
          )}

          <span className="text-slate-500 text-sm transition-transform duration-300" style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            ▼
          </span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="px-6 py-5">
          {device.banner && (
            <div className="flex items-center gap-3 bg-[#050a0e] border border-[#1a3a4a] rounded-md px-4 py-2 mb-4">
              <span className="font-mono text-xs text-slate-500 tracking-widest">BANNER</span>
              <span className="font-mono text-sm text-emerald-400">{device.banner.trim()}</span>
            </div>
          )}

          {/* CVE Table */}
          {vulns.length > 0 ? (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a3a4a]">
                    {["CVE ID", "Severity", "CVSS", "Description", "Fix"].map((h) => (
                      <th key={h} className="font-mono text-xs text-slate-500 tracking-widest text-left py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vulns.map((v) => (
                    <tr key={v.cve_id} className="border-b border-[#1a3a4a]/50 hover:bg-cyan-400/5 transition-all">
                      <td className="py-3 px-3 font-mono text-cyan-400 text-xs">{v.cve_id}</td>
                      <td className="py-3 px-3">
                        <span className={`font-mono text-xs px-2 py-1 rounded border font-bold ${SEVERITY_COLORS[v.severity]}`}>
                          {v.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-[#050a0e] rounded overflow-hidden">
                            <div className={`h-full rounded ${CVSS_COLOR(v.cvss_score)}`} style={{ width: `${(v.cvss_score / 10) * 100}%` }} />
                          </div>
                          <span className="font-mono text-xs text-slate-300">{v.cvss_score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-xs max-w-[200px]">{v.description}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs max-w-[200px]">{v.fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-400/5 border border-emerald-400/20 rounded-md px-4 py-3 font-mono text-sm text-emerald-400 mb-4">
              ✓ No known CVEs matched for this device
            </div>
          )}

          {/* Default Creds */}
          {creds.length > 0 && (
            <div>
              <p className="font-mono text-xs text-red-400 tracking-widest mb-2">⚠ DEFAULT CREDENTIALS FOUND</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-400/20">
                      {["Method", "Port", "Username", "Password"].map((h) => (
                        <th key={h} className="font-mono text-xs text-slate-500 tracking-widest text-left py-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {creds.map((c, i) => (
                      <tr key={i} className="border-b border-red-400/10 bg-red-400/5">
                        <td className="py-2 px-3 font-mono text-xs text-red-300">{c.method}</td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-300">{c.port}</td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-300">{c.username}</td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-300">{c.password || "(empty)"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}