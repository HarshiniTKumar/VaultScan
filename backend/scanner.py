import nmap

def scan_network(ip_range: str):
    scanner = nmap.PortScanner()
    print(f"[*] Starting Nmap Scan on: {ip_range}")

    # NEW OPTIMIZED ARGUMENTS:
    # --min-parallelism 20: Scan 20 IPs at once (Massively faster)
    # --host-timeout 10s: If a device doesn't respond in 10s, move to the next
    # -Pn: Skip ping (Critical for blocked networks)
    arguments = '-p 80,554,8080,23,37777 -sV -Pn -T4 --open --min-parallelism 20 --host-timeout 10s'

    scanner.scan(hosts=ip_range, arguments=arguments)

    results = []
    for host in scanner.all_hosts():
        device = {
            "ip": host,
            "status": scanner[host].state(),
            "open_ports": [],
            "banner": ""
        }
        
        for port in [80, 554, 8080, 23, 37777]:
            if scanner[host].has_tcp(port):
                port_info = scanner[host]['tcp'][port]
                if port_info['state'] == 'open':
                    device["open_ports"].append(port)
                    # Use the 'product' field as the brand keyword
                    product = port_info.get('product', '')
                    if product:
                        device["banner"] = product
        
        if device["open_ports"]:
            results.append(device)
            
    return results