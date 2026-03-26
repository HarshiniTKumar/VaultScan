import { downloadReport } from "../api"
import { useState } from "react"

export default function ReportButton({ ipRange, devices }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      await downloadReport(ipRange, devices)
    } catch (e) {
      alert("Failed to generate report. Make sure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="border-2 border-emerald-400 text-emerald-400 font-mono text-sm tracking-widest px-6 py-2 rounded-md uppercase hover:bg-emerald-400 hover:text-[#050a0e] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? "⟩ GENERATING..." : "⟩ DOWNLOAD PDF REPORT"}
    </button>
  )
}