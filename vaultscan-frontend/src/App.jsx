import { useState, useEffect } from "react"
import { pingBackend, runScan } from "./api"
import ScanForm from "./components/scanform"
import StatsBar from "./components/statsbar"
import DeviceCard from "./components/devicecard"
import ReportButton from "./components/reportbutton"

export default function App() {
  const [status, setStatus] = useState("checking")
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState([])
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState("")
  const [ipRange, setIpRange] = useState("")

  useEffect(() => {
    pingBackend()
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"))
  }, [])

  const handleScan = async (ip) => {
    setLoading(true)
    setError("")
    setScanned(false)
    setIpRange(ip)
    try {
      const res = await runScan(ip)
      setDevices(res.data.devices || [])
      setScanned(true)
    } catch (e) {
      setError("Failed to reach backend. Make sure FastAPI is running on port 8000.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050a0e] text-[#c8e6f0]" style={{ fontFamily: "Rajdhani, sans-serif" }}>

      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1a3a4a] bg-[#050a0e]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-cyan-400 rounded-lg flex items-center justify-center text-lg shadow-[0_0_12px_rgba(0,229,255,0.3)]">
              🔍
            </div>
            <div>
              <div className="font-mono text-xl text-cyan-400 tracking-widest" style={{ textShadow: "0 0 20px rgba(0,229,255,0.5)" }}>
                VAULTSCAN
              </div>
              <div className="font-mono text-[10px] text-slate-500 tracking-[3px]">VAPT FOR CCTV & DVR</div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full animate-pulse ${status === "online" ? "bg-emerald-400" : status === "offline" ? "bg-red-400" : "bg-yellow-400"}`} />
            {status === "online" ? "BACKEND READY" : status === "offline" ? "BACKEND OFFLINE" : "CHECKING..."}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <ScanForm onScan={handleScan} loading={loading} />

        {/* Loading */}
        {loading && (
          <div className="bg-[#0d1f2d] border border-[#1a3a4a] rounded-xl p-6 mb-6">
            <div className="h-1 bg-[#050a0e] rounded overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded animate-pulse w-3/4" />
            </div>
            <div className="font-mono text-sm text-emerald-400 space-y-1">
              <p>{">"} Initiating scan on {ipRange}...</p>
              <p>{">"} Probing ports: 80, 554, 8080, 23, 37777</p>
              <p>{">"} Running service fingerprinting (-sV)...</p>
              <p>{">"} Matching CVE database...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 mb-6 font-mono text-sm text-red-400">
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {scanned && (
          <>
            <StatsBar devices={devices} />

            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-xs text-cyan-400 tracking-[4px] uppercase">// Discovered Devices</p>
              {devices.length > 0 && <ReportButton ipRange={ipRange} devices={devices} />}
            </div>

            {devices.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <div className="text-5xl mb-4 opacity-40">📡</div>
                <p className="font-mono text-base text-slate-300 mb-2">No devices found</p>
                <p className="text-sm tracking-widest">No CCTV/DVR devices responded on scanned ports</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {devices.map((device, i) => (
                  <DeviceCard key={device.ip} device={device} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
