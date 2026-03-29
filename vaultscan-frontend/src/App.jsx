import { useState, useEffect } from "react"
import { pingBackend, runScan, getAIAnalysis } from "./api" 
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
  const [aiText, setAiText] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  // Check if backend is alive on startup
  useEffect(() => {
    pingBackend()
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"))
  }, [])

  const handleScan = async (ip) => {
    setLoading(true)
    setError("")
    setScanned(false)
    setDevices([]) // Reset list for new scan
    setAiText("")
    setIpRange(ip)

    try {
      // 1. Trigger the FastAPI Nmap + NVD API Scan
      const res = await runScan(ip)
      const devs = res.data.devices || []

      setDevices(devs)
      setScanned(true)

      // 2. Trigger AI Security Analysis if devices were found
      if (devs.length > 0) {
        setAiLoading(true)
        try {
          const aiRes = await getAIAnalysis(devs)
          setAiText(aiRes.data.analysis)
        } catch (err) {
          setAiText("AI analysis temporarily offline. Check CVE details below.")
        }
        setAiLoading(false)
      }

    } catch (e) {
      setError("Critical: Failed to communicate with VaultScan Backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050a0e] text-[#c8e6f0]" style={{ fontFamily: "Rajdhani, sans-serif" }}>

      {/* Futuristic Grid Background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ 
          backgroundImage: "linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)", 
          backgroundSize: "40px 40px" 
        }}
      />

      {/* Main Header */}
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

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              status === "online" ? "bg-emerald-400" : status === "offline" ? "bg-red-400" : "bg-yellow-400"
            }`} />
            {status === "online" ? "SYSTEMS ONLINE" : status === "offline" ? "CONNECTION LOST" : "INITIALIZING..."}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* The Scan Input Form */}
        <ScanForm onScan={handleScan} loading={loading} />

        {/* Real-time Scanning Logs */}
        {loading && (
          <div className="bg-[#0d1f2d] border border-[#1a3a4a] rounded-xl p-6 mb-6 shadow-lg">
            <div className="h-1 bg-[#050a0e] rounded overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded animate-pulse w-3/4" />
            </div>
            <div className="font-mono text-sm text-emerald-400 space-y-1">
              <p>{">"} INITIALIZING SCAN SEQUENCE ON {ipRange}...</p>
              <p>{">"} PROBING CORE SURVEILLANCE PORTS...</p>
              <p>{">"} EXTRACTING SERVICE BANNERS...</p>
              <p>{">"} MATCHING LIVE NVD THREAT INTELLIGENCE...</p>
            </div>
          </div>
        )}

        {/* Global Error Handler */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 mb-6 font-mono text-sm text-red-400">
            ⚠ SYSTEM ERROR: {error}
          </div>
        )}

        {/* Results Section */}
        {scanned && (
          <>
            {/* AI Security Insight Section */}
            {(aiLoading || aiText) && (
              <div className="bg-purple-500/10 border border-purple-500/30 p-5 rounded-xl mb-6 backdrop-blur-sm">
                <p className="text-purple-400 font-mono text-xs mb-3 flex items-center gap-2">
                  <span className="animate-bounce">🧠</span> AI SECURITY ANALYSIS ENGINE
                </p>

                {aiLoading ? (
                  <div className="flex items-center gap-3 text-sm text-purple-300/70 font-mono">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    Crunching metadata and assessing network risk...
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-line text-gray-300 leading-relaxed font-sans">
                    {aiText}
                  </p>
                )}
              </div>
            )}

            {/* Quick Stats Summary */}
            <StatsBar devices={devices} />

            <div className="flex items-center justify-between mb-4 mt-8">
              <p className="font-mono text-xs text-cyan-400 tracking-[4px] uppercase">// NETWORK NODES DISCOVERED</p>
              {devices.length > 0 && <ReportButton ipRange={ipRange} devices={devices} />}
            </div>

            {/* Device Listing */}
            {devices.length === 0 ? (
              <div className="text-center py-20 text-slate-500 border border-dashed border-[#1a3a4a] rounded-2xl">
                <div className="text-5xl mb-4 opacity-40">📡</div>
                <p className="font-mono text-base text-slate-300 mb-2">TARGET RANGE SECURE</p>
                <p className="text-sm tracking-widest">No vulnerable CCTV/DVR nodes detected on the specified ports.</p>
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

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .glow-cyan { text-shadow: 0 0 20px rgba(0, 229, 255, 0.4); }
      `}</style>
    </div>
  )
}
