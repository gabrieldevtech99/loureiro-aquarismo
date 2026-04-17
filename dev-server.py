import http.server
import socketserver
import os
from urllib.parse import urlparse

PORT = 3000
ROOT = os.path.dirname(os.path.abspath(__file__))

REWRITES = {
    "/categoria": "/categoria.html",
    "/produto": "/produto.html",
    "/carrinho": "/carrinho.html",
    "/checkout": "/checkout.html",
    "/admin": "/admin.html",
    "/pedido-confirmado": "/pedido-confirmado.html",
}

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def _apply_rewrite(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        if path in REWRITES:
            new_path = REWRITES[path]
            if parsed.query:
                new_path += "?" + parsed.query
            self.path = new_path

    def do_GET(self):
        self._apply_rewrite()
        return super().do_GET()

    def do_HEAD(self):
        self._apply_rewrite()
        return super().do_HEAD()

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler) as httpd:
    httpd.allow_reuse_address = True
    print(f"Servindo http://127.0.0.1:{PORT}/ (Ctrl+C para parar)")
    httpd.serve_forever()
