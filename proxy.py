#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.parse

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urllib.parse.unquote(self.path[1:])
        if not url.startswith('http'):
            self.send_response(400)
            self.end_headers()
            return
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (compatible; OWL-Monitor/1.0)',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            })
            resp = urllib.request.urlopen(req, timeout=10)
            data = resp.read()
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', resp.headers.get('Content-Type', 'text/xml'))
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(str(e).encode())

    def log_message(self, *args):
        pass

HTTPServer(('127.0.0.1', 8123), ProxyHandler).serve_forever()
