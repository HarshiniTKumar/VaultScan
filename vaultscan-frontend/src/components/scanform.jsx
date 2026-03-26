import { useState } from "react"

export default function ScanForm({ onScan, loading }) {
  const [ip, setIp] = useState("")

  const handleScan = () => {
    if (ip.trim()) onScan(ip.trim())
  }

  return (
    <div className="bg-[#0d1f2d] border border-[#1a3a4a] rounded-xl p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      <p className="font-mono text-xs text-cyan-400 tracking-[4px] uppercase mb-4">
        // Network Scan
      </p>

      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[280px]">
          <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">
            // TARGET IP RANGE
          </label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="192.168.1.0/24  or  10.0.0.1-50"
            className="w-full bg-[#050a0e] border border-[#1a3a4a] rounded-md px-4 py-3 text-cyan-400 font-mono text-base outline-none focus:border-cyan-400 focus:shadow-[0_0_16px_rgba(0,229,255,0.2)] transition-all placeholder:text-slate-600"
          />
          <div className="flex gap-2 mt-2 flex-wrap items-center">
            <span className="font-mono text-xs text-slate-500">e.g.</span>
            {["192.168.1.0/24", "10.0.0.1-50", "172.16.0.0/16"].map((ex) => (
              <button
                key={ex}
                onClick={() => setIp(ex)}
                className="font-mono text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded hover:bg-emerald-400/20 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={loading}
          className="border-2 border-cyan-400 text-cyan-400 font-mono text-sm tracking-widest px-8 py-3 rounded-md uppercase hover:bg-cyan-400 hover:text-[#050a0e] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "⟩ SCANNING..." : "⟩ SCAN"}
        </button>
      </div>
    </div>
  )
}