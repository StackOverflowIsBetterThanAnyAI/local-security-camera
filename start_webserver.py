import os
import re
import http.server
import socketserver
import subprocess
import json
from urllib.parse import urlparse, parse_qs

from folder_data import HTML_FOLDER_LOCATION, IMAGE_FOLDER_LOCATION

PORT = 8080

REGEX = re.compile(r'^security_image_\d{4}-\d{2}-\d{2}_\d{2}:\d{2}:\d{2}\.jpg$')

class HTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
                if self.path.startswith('/images'):
                        query_components = parse_qs(urlparse(self.path).query)
                        page = int(query_components.get('page', [1])[0])
                        page_size = int(query_components.get('page_size', [24])[0])

                        images = sorted(os.listdir(IMAGE_FOLDER_LOCATION))
                        images = [f for f in images if REGEX.match(f)]

                        start = (page - 1) * page_size
                        end = start + page_size
                        paginated_images = images[start:end]

                        response = {
                                'images': paginated_images,
                                'total_images': len(images),
                                'page': page,
                                'page_size': page_size
                        }

                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps(response).encode())
                else:
                        super().do_GET()

def start_webserver():
        os.chdir(HTML_FOLDER_LOCATION)
        with socketserver.TCPServer(('', PORT), HTTPRequestHandler) as httpd:
                try:
                        ip_address = subprocess.run(['hostname', '-I'], stdout=subprocess.PIPE, text=True).stdout.strip>                        print(f'Serving on {ip_address}:{PORT}')
                        httpd.serve_forever()
                except KeyboardInterrupt:
                        print('\nServer is shutting down.')
                        httpd.server_close()

if __name__ == '__main__':
        start_webserver()
