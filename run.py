
import subprocess
import sys
import webbrowser
import time
import os
from threading import Thread
import logging
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('FatigueGuard')

def check_port(port: int) -> bool:
    """Check if port is available."""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('', port))
            return True
        except OSError:
            return False

def wait_for_server(port: int, timeout: int = 30) -> bool:
    """Wait for server to be ready."""
    import socket
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(('localhost', port), timeout=1):
                return True
        except (ConnectionRefusedError, socket.timeout):
            time.sleep(0.5)
    return False

def run_frontend() -> Optional[subprocess.Popen]:
    """Run the frontend development server."""
    try:
        if not check_port(8080):
            logger.error("Port 8080 is already in use")
            return None
            
        npm_cmd = 'npm.cmd' if sys.platform == 'win32' else 'npm'
        process = subprocess.Popen(
            [npm_cmd, 'run', 'dev'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        logger.info("Frontend server started")
        return process
    except Exception as e:
        logger.error(f"Failed to start frontend server: {e}")
        return None

def run_backend() -> None:
    """Run the Flask backend server."""
    try:
        if not check_port(5000):
            logger.error("Port 5000 is already in use")
            return
            
        from routes import app
        logger.info("Starting backend server...")
        app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    except Exception as e:
        logger.error(f"Backend error: {e}")
        sys.exit(1)

def open_browser() -> None:
    """Open the browser when servers are ready."""
    if wait_for_server(8080):
        time.sleep(1)  # Small delay to ensure frontend is fully loaded
        webbrowser.open('http://localhost:8080')
        logger.info("Application opened in browser")
    else:
        logger.error("Frontend server failed to start in time")

def main() -> None:
    """Main entry point with improved process management."""
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Start backend in a separate thread
        backend_future = executor.submit(run_backend)
        
        # Start frontend
        frontend_process = run_frontend()
        if not frontend_process:
            logger.error("Failed to start frontend server")
            sys.exit(1)
            
        # Open browser in another thread
        browser_future = executor.submit(open_browser)
        
        try:
            while True:
                if frontend_process.poll() is not None:
                    logger.error("Frontend process terminated unexpectedly")
                    sys.exit(1)
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Shutting down servers...")
            if frontend_process:
                frontend_process.terminate()
            sys.exit(0)

if __name__ == "__main__":
    main()

