import http.server
import socketserver
import urllib.parse
import os
import json
import cgi
import sys

PORT = 8000
DIRECTORY = r"D:\rohan\parth\website skyislimit"

class BeyondSkaiHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Root route
        if path == '/' or path == '/index.php' or path == '/index.html':
            self.path = '/index.html'
            return super().do_GET()

        # Dynamic Package details routing
        if path == '/package-details.php' or path == '/package-details.html':
            pkg_id = query.get('id', ['10'])[0]
            try:
                pkg_id_int = int(pkg_id)
                if pkg_id_int < 1 or pkg_id_int > 25:
                    pkg_id_int = 10
            except ValueError:
                pkg_id_int = 10
            
            target_file = f"/package-details_id_{pkg_id_int}.html"
            if os.path.exists(os.path.join(DIRECTORY, target_file.lstrip('/'))):
                self.path = target_file
            else:
                self.path = '/package-details_id_10.html'
            return super().do_GET()

        # Handle other .php to .html mappings
        if path.endswith('.php'):
            html_equiv = path[:-4] + '.html'
            if os.path.exists(os.path.join(DIRECTORY, html_equiv.lstrip('/'))):
                self.path = html_equiv
                return super().do_GET()

        # Clean URLs without extension
        if not os.path.splitext(path)[1]:
            html_candidate = path + '.html'
            if os.path.exists(os.path.join(DIRECTORY, html_candidate.lstrip('/'))):
                self.path = html_candidate
                return super().do_GET()

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/enquiry-form.php':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            content_type = self.headers.get('Content-Type', '')
            parsed_fields = {}
            
            if 'application/x-www-form-urlencoded' in content_type:
                parsed_fields = urllib.parse.parse_qs(post_data.decode('utf-8', errors='ignore'))
                parsed_fields = {k: v[0] if len(v) == 1 else v for k, v in parsed_fields.items()}
            elif 'multipart/form-data' in content_type:
                # Basic multipart parse
                lines = post_data.decode('utf-8', errors='ignore').split('\r\n')
                curr_key = None
                for line in lines:
                    if 'name="' in line:
                        curr_key = line.split('name="')[1].split('"')[0]
                    elif curr_key and line and not line.startswith('--'):
                        parsed_fields[curr_key] = line.strip()
                        curr_key = None
            else:
                try:
                    parsed_fields = json.loads(post_data.decode('utf-8', errors='ignore'))
                except Exception:
                    parsed_fields = {'raw': post_data.decode('utf-8', errors='ignore')}

            # Log enquiry
            log_file = os.path.join(DIRECTORY, 'enquiries_log.json')
            logs = []
            if os.path.exists(log_file):
                try:
                    with open(log_file, 'r', encoding='utf-8') as f:
                        logs = json.load(f)
                except Exception:
                    logs = []
            
            logs.append(parsed_fields)
            try:
                with open(log_file, 'w', encoding='utf-8') as f:
                    json.dump(logs, f, indent=2)
            except Exception:
                pass

            response_bytes = json.dumps({
                "status": "success",
                "message": "Thank you! Your enquiry has been received. Our Beyond Skai travel team will contact you shortly."
            }).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)
            return

        self.send_error(404, "Endpoint not found")

def run(port=PORT):
    server_address = ('', port)
    try:
        class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
            daemon_threads = True
            allow_reuse_address = True

        httpd = ThreadedTCPServer(server_address, BeyondSkaiHandler)
        print(f"Beyond Skai Web Server running at http://localhost:{port}/")
        sys.stdout.flush()
        httpd.serve_forever()
    except OSError as e:
        if port < 8010:
            run(port + 1)
        else:
            print(f"Error starting server: {e}")

if __name__ == '__main__':
    run()
