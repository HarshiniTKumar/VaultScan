import nmap

def scan_network(ip_range: str):
    scanner = nmap.PortScanner()
    
    scanner.scan(hosts=ip_range, arguments='-p 80,554,8080,23,37777 -sV --open')
    
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
                    if port_info.get('product'):
                        device["banner"] += port_info['product'] + " "
        
        if device["open_ports"]:
            results.append(device)
    
    return results