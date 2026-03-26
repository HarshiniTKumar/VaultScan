import json

with open("cve_db.json") as f:
    CVE_DB = json.load(f)

def match_cves(banner: str):
    matches = []
    banner_lower = banner.lower()
    
    for cve in CVE_DB:
        if cve["brand"].lower() in banner_lower:
            matches.append(cve)
    
    return matches