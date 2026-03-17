from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile, os
from detect import detect_from_image, download_image

app = FastAPI(title="Snap & Report ML API", version="2.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class URLRequest(BaseModel):
    image_url: str

@app.get("/")
def root():
    return {"message": "Snap & Report ML Service", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "model": "YOLOv8n + EasyOCR"}

@app.post("/detect")
async def detect_url(req: URLRequest):
    tmp = None
    try:
        tmp = download_image(req.image_url)
        if not tmp:
            raise HTTPException(status_code=400, detail="Could not download image")
        return detect_from_image(tmp)
    finally:
        if tmp and os.path.exists(tmp):
            os.remove(tmp)

@app.post("/detect/upload")
async def detect_upload(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    tmp = None
    try:
        suffix = '.png' if 'png' in file.content_type else '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            f.write(await file.read())
            tmp = f.name
        return detect_from_image(tmp)
    finally:
        if tmp and os.path.exists(tmp):
            os.remove(tmp)
