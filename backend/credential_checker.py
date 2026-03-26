import socket
import requests
from requests.auth import HTTPBasicAuth
import telnetlib

DEFAULT_CREDS = [
    ("admin", "admin"),
    ("admin", "12345"),
    ("admin", "123456"),
    ("admin", ""),
    ("root", "root"),
    ("root", "12345"),
    ("user", "user"),
]

def check_http_auth(ip, port):
    for username, password in DEFAULT_CREDS:
        try:
            res = requests.get(
                f"http://{ip}:{port}",
                auth=HTTPBasicAuth(username, password),
                timeout=3
            )
            if res.status_code == 200:
                return {
                    "vulnerable": True,
                    "username": username,
                    "password": password,
                    "port": port,
                    "method": "HTTP Basic Auth"
                }
        except Exception:
            continue
    return {"vulnerable": False}

def check_telnet(ip):
    for username, password in DEFAULT_CREDS:
        try:
            tn = telnetlib.Telnet(ip, 23, timeout=3)
            tn.read_until(b"login:", timeout=2)
            tn.write(username.encode() + b"\n")
            tn.read_until(b"Password:", timeout=2)
            tn.write(password.encode() + b"\n")
            result = tn.read_some().decode(errors="ignore")
            tn.close()
            if "$" in result or "#" in result or ">" in result:
                return {
                    "vulnerable": True,
                    "username": username,
                    "password": password,
                    "port": 23,
                    "method": "Telnet"
                }
        except Exception:
            continue
    return {"vulnerable": False}

def check_credentials(ip, open_ports):
    results = []

    if 80 in open_ports:
        result = check_http_auth(ip, 80)
        if result["vulnerable"]:
            results.append(result)

    if 8080 in open_ports:
        result = check_http_auth(ip, 8080)
        if result["vulnerable"]:
            results.append(result)

    if 23 in open_ports:
        result = check_telnet(ip)
        if result["vulnerable"]:
            results.append(result)

    return results