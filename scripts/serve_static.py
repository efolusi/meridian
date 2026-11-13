#!/usr/bin/env python3
"""Serve the repository root for the browser smoke and visual checks.

`python3 -m http.server` listens with a backlog of 5. The smoke page fires a
burst of icon fetches as its demos mount; on the Linux runner the connections
past the backlog were refused, Icon cached each failure as an empty glyph, and
screenshots came out with blank icons at random. A deep backlog keeps every
request queued instead.

Usage: python3 scripts/serve_static.py [port] [bind]
"""
import functools
import http.server
import os
import sys


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 512
    daemon_threads = True


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    bind = sys.argv[2] if len(sys.argv) > 2 else "127.0.0.1"
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
    with Server((bind, port), handler) as httpd:
        print(f"serving {root} on http://{bind}:{port}/", flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
