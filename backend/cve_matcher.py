import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("NVD_API_KEY")

def match_cves(device_brand):
    """Queries the NVD for real-time vulnerabilities."""
    if not device_brand or device_brand == "Generic":
        return []

    # The NVD 2.0 API Endpoint
    url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    
    # We search by keyword (e.g., 'Hikvision') and pull the top 3 results
    params = {
        "keywordSearch": device_brand,
        "resultsPerPage": 3 
    }
    headers = {"apiKey": API_KEY}

    try:
        # MANDATORY: NVD needs a 0.6s breather between calls
        time.sleep(0.6) 
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return format_for_ui(data)
        return []
    except Exception as e:
        print(f"DEBUG: API Request Failed: {e}")
        return []

def format_for_ui(nvd_data):
    """Converts the messy NVD JSON into the clean format your React UI expects."""
    cleaned_list = []
    
    for item in nvd_data.get("vulnerabilities", []):
        cve = item.get("cve", {})
        
        # Pulling CVSS 3.1 metrics (the gold standard for your charts)
        metrics = cve.get("metrics", {}).get("cvssMetricV31", [{}])[0]
        cvss = metrics.get("cvssData", {})

        cleaned_list.append({
            "cve_id": cve.get("id", "CVE-UNKNOWN"),
            "severity": cvss.get("baseSeverity", "HIGH"),
            "cvss_score": cvss.get("baseScore", 0.0),
            "description": cve.get("descriptions", [{}])[0].get("value", "No description provided."),
            "fix": "Apply official manufacturer firmware patch immediately."
        })
    return cleaned_list