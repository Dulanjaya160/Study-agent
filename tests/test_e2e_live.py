import os
import sys
import time
import subprocess
import json
import urllib.request
import urllib.parse
import fitz

def test_live_server():
    print("=== STARTING LIVE END-TO-END SERVER TEST ===")
    
    # 1. Start uvicorn server in a subprocess
    python_exe = sys.executable
    cmd = [
        python_exe, "-m", "uvicorn", "backend.backend:app",
        "--host", "127.0.0.1", "--port", "8005", "--log-level", "warning"
    ]
    
    env = os.environ.copy()
    env["OPENBLAS_NUM_THREADS"] = "1"
    env["OMP_NUM_THREADS"] = "1"
    
    proc = subprocess.Popen(cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    try:
        base_url = "http://127.0.0.1:8005"
        
        # Wait for server to be responsive
        ready = False
        print("Waiting for server to initialize model and bind to port...")
        for attempt in range(45):
            time.sleep(1)
            # Check if process died
            if proc.poll() is not None:
                stdout, stderr = proc.communicate()
                raise RuntimeError(f"Server exited prematurely with code {proc.returncode}:\nSTDERR: {stderr.decode()}\nSTDOUT: {stdout.decode()}")
            try:
                with urllib.request.urlopen(f"{base_url}/status", timeout=2) as res:
                    if res.status == 200:
                        data = json.loads(res.read().decode())
                        print(f"Server is LIVE! /status response: {data}")
                        ready = True
                        break
            except Exception:
                pass
                
        if not ready:
            proc.terminate()
            stdout, stderr = proc.communicate()
            raise RuntimeError(f"FastAPI server did not start within 45 seconds:\nSTDERR: {stderr.decode()}\nSTDOUT: {stdout.decode()}")
            
        # 2. Test /status endpoint
        req = urllib.request.Request(f"{base_url}/status")
        with urllib.request.urlopen(req) as resp:
            status_data = json.loads(resp.read().decode())
            assert "total_chunks" in status_data
            print(f"[PASS] /status endpoint returned total_chunks = {status_data['total_chunks']}")

        # 3. Test /chat greeting
        greeting_q = urllib.parse.quote("hello! how can you help me?")
        req = urllib.request.Request(f"{base_url}/chat?question={greeting_q}", method="POST")
        with urllib.request.urlopen(req) as resp:
            chat_data = json.loads(resp.read().decode())
            assert "answer" in chat_data
            assert "sources" in chat_data
            print(f"[PASS] /chat greeting response: {chat_data['answer'][:80]}...")

        # 4. Test /upload endpoint with multipart/form-data
        doc = fitz.open()
        p = doc.new_page()
        p.insert_text((50, 72), "Autonomous intelligent agents perceive their environment through sensors and act upon it using actuators.")
        pdf_bytes = doc.tobytes()
        doc.close()
        
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="files"; filename="live_test_agent.pdf"\r\n'
            f"Content-Type: application/pdf\r\n\r\n"
        ).encode("utf-8") + pdf_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")
        
        req = urllib.request.Request(f"{base_url}/upload", data=body, method="POST")
        req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
        with urllib.request.urlopen(req) as resp:
            upload_data = json.loads(resp.read().decode())
            assert upload_data["chunks_added"] >= 1
            print(f"[PASS] /upload endpoint successfully indexed {upload_data['chunks_added']} chunk(s) (total: {upload_data['total_chunks']})")

        # 5. Test /chat factual search on the uploaded doc
        fact_q = urllib.parse.quote("How do intelligent agents perceive and act?")
        req = urllib.request.Request(f"{base_url}/chat?question={fact_q}", method="POST")
        with urllib.request.urlopen(req) as resp:
            fact_data = json.loads(resp.read().decode())
            assert "answer" in fact_data
            print(f"[PASS] /chat semantic QA response: {fact_data['answer'][:100]}...")

        print("\n=== ALL LIVE ENDPOINTS VERIFIED AND WORKING SMOOTHLY ===")

    finally:
        proc.terminate()
        proc.wait(timeout=5)
        print("Live test server terminated.")

if __name__ == "__main__":
    test_live_server()

