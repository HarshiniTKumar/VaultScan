export default function StatsBar({ devices }) {
  const total = devices.length
  const critical = devices.reduce(
    (acc, d) => acc + (d.vulnerabilities?.filter((v) => v.severity === "Critical").length || 0), 0
  )
  const highMed = devices.reduce(
    (acc, d) => acc + (d.vulnerabilities?.filter((v) => ["High","Medium"].includes(v.severity)).length || 0), 0
  )
  const safe = devices.filter((d) => !d.vulnerabilities?.length).length

  const stats = [
    { label: "Devices Found", value: total, color: "text-cyan-400" },
    { label: "Critical CVEs", value: critical, color: "text-red-400" },
    { label: "High / Medium", value: highMed, color: "text-orange-400" },
    { label: "Safe Devices", value: safe, color: "text-emerald-400" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[#0d1f2d] border border-[#1a3a4a] rounded-xl p-5 text-center hover:border-cyan-400 transition-all"
        >
          <div className={`font-mono text-4xl font-bold ${s.color} mb-1`}>{s.value}</div>
          <div className="text-xs text-slate-500 tracking-widest uppercase">{s.label}</div>
        </div>
      ))}
    </div>
  )
}