from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import sys

class KaraokeRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()
    
    def do_GET(self):
        if self.path == '/songs':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # List directories in the songs folder
            songs_path = os.path.join(os.getcwd(), 'songs')
            songs = [d for d in os.listdir(songs_path) 
                    if os.path.isdir(os.path.join(songs_path, d)) and not d.startswith('.')]
            
            self.wfile.write(json.dumps(songs).encode())
            return
            
        return super().do_GET()

if __name__ == '__main__':
    port = 8000
    print(f"Starting server on port {port}...")
    server = HTTPServer(('localhost', port), KaraokeRequestHandler)
    print(f"Server running at http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.socket.close() 