import axios from 'axios'

const BASE = 'http://127.0.0.1:8000' // Using full path for reliability

export const pingBackend = () => axios.get(`${BASE}/docs`)

export const runScan = (ipRange) =>
  axios.post(`${BASE}/scan`, null, {
    params: { ip_range: ipRange }
  })

export const downloadReport = async (ipRange, devices) => {
  const res = await fetch(`${BASE}/report?ip_range=${ipRange}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      devices: devices,
    }),
  })

  if (!res.ok) {
    throw new Error("Report failed")
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "VaultScan_Report.pdf"
  a.click()
  window.URL.revokeObjectURL(url) // Clean up memory
}

export const getAIAnalysis = (devices) =>
  axios.post(`${BASE}/ai-analysis`, { devices })