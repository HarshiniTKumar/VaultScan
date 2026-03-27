from fastapi import FastAPI, Body
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Any
from scanner import scan_network
from cve_matcher import match_cves
from credential_checker import check_credentials
from report_generator import generate_report

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
        device["default_creds"] = check_credentials(device["ip"], device["open_ports"])
    return {"devices": devices}

@app.post("/report")
def download_report(ip_range: str, devices: List[Any] = Body(...)):
    pdf_bytes = generate_report(devices, ip_range)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=vaultscan_report.pdf"}
    )

