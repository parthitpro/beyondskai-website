"""
GoDaddy DNS Automation Script for Beyond Skai
Allows querying and updating DNS records (e.g. pointing A record to Hostinger)
using the official GoDaddy v1/v3 REST API.
"""

import urllib.request
import json
import sys

API_BASE = "https://api.godaddy.com/v1"

def get_dns_records(domain, key, secret):
    url = f"{API_BASE}/domains/{domain}/records"
    req = urllib.request.Request(url, headers={
        "Authorization": f"sso-key {key}:{secret}",
        "Accept": "application/json"
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching DNS records: {e}")
        return None

def update_a_record(domain, ip_address, key, secret):
    url = f"{API_BASE}/domains/{domain}/records/A/@"
    payload = json.dumps([{"data": ip_address, "ttl": 600}]).encode('utf-8')
    req = urllib.request.Request(url, data=payload, method='PUT', headers={
        "Authorization": f"sso-key {key}:{secret}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Successfully updated A record for {domain} to {ip_address} (HTTP {resp.status})")
            return True
    except Exception as e:
        print(f"Error updating A record: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python godaddy_dns.py <domain> <api_key> <api_secret> [new_ip_address]")
        sys.exit(1)
        
    domain = sys.argv[1]
    key = sys.argv[2]
    secret = sys.argv[3]
    
    if len(sys.argv) >= 5:
        new_ip = sys.argv[4]
        print(f"Updating A record for {domain} -> {new_ip}...")
        update_a_record(domain, new_ip, key, secret)
    else:
        print(f"Fetching current DNS records for {domain}...")
        records = get_dns_records(domain, key, secret)
        if records:
            print(json.dumps(records, indent=2))
