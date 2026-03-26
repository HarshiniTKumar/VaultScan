from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scanner import scan_network
from cve_matcher import match_cves
from credential_checker import check_credentials  # 👈 add this

from fastapi.responses import Response      # add at top
from report_generator import generate_report  # add at top



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "VaultScan backend is running"}

@app.post("/scan")
def run_scan(ip_range: str):
    devices = scan_network(ip_range)

    for device in devices:
        device["vulnerabilities"] = match_cves(device["banner"])
        device["default_creds"] = check_credentials(device["ip"], device["open_ports"])  # 👈 add this

    return {"devices": devices}

@app.post("/report")
def download_report(ip_range: str, devices: list):
    pdf_bytes = generate_report(devices, ip_range)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=vaultscan_report.pdf"}
    )