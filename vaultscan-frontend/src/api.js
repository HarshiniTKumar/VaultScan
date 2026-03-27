import axios from 'axios'

const BASE = '/api'

export const pingBackend = () => axios.get(`${BASE}/`)

export const runScan = (ipRange) =>
  axios.post(`${BASE}/scan`, null, {
    params: { ip_range: ipRange }
  })

export const downloadReport = async (ipRange, devices) => {
  const res = await axios.post(
    `${BASE}/report?ip_range=${encodeURIComponent(ipRange)}`,
    JSON.stringify(devices),
    {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'vaultscan_report.pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
}