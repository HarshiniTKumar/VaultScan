VaultScan: IoT Surveillance VAPT Tool
VaultScan is a specialized Vulnerability Assessment and Penetration Testing (VAPT) tool engineered to secure the "blind spots" in modern networks: IoT Surveillance Devices (CCTVs, DVRs, and NVRs).

Core Functionalities

Active Network Discovery Scans specific IPs or subnets using a high-parallelism Nmap engine to identify active surveillance hardware in real-time.

Service Fingerprinting Probes critical ports (80, 554, 8080, 37777) to extract firmware banners and identify device brands such as Hikvision, Dahua, and Cisco.

Live CVE Intelligence Dynamically queries the NIST National Vulnerability Database (NVD) API to match discovered devices with real-time, known vulnerabilities.

AI-Driven Risk Assessment Utilizes Groq (Llama 3.3) to translate complex, technical CVE data into plain-English security summaries and actionable remediation steps.

Automated PDF Audits Generates professional, downloadable security reports detailing discovered threats, CVSS scores, and specific fix recommendations.

Technical Components

Frontend (React)
Interface: A dark-themed, "Cyber-Ops" dashboard.

Features: Real-time scanning logs, connection heartbeats (heartbeat check), and interactive device cards for vulnerability deep-dives.

Backend (FastAPI)
Logic: A high-performance Python server that orchestrates the scanner, the AI engine, and the report generator.

Middleware: Integrated CORS handling for secure communication with the React frontend.

Scanner Module (python-nmap)
Optimization: Configured with aggressive discovery flags (-Pn, -sV, -T4) to bypass common network firewalls and client isolation protocols.

Intelligence Layer

Threat Data: Integration with the NIST NVD API.

Security Analysis: Powered by Groq Cloud for Large Language Model (LLM) processing.

Project Architecture

The system follows a modular, event-driven design:

Trigger: The React UI sends a target range to the backend.

Probe: The FastAPI Backend orchestrates local Nmap probing.

Enrich: The system fetches external NVD CVEs based on discovered banners.

Analyze: Groq AI processes the risk and generates a human-readable summary.

Output: Results are compiled into an interactive dashboard and a PDF audit.
