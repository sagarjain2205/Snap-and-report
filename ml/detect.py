import sys
import json
import cv2
import tempfile
import os
import requests

try:
    from ultralytics import YOLO
    import easyocr
    MODELS_AVAILABLE = True
except ImportError:
    MODELS_AVAILABLE = False

reader = None
yolo_model = None

VEHICLE_CLASSES = { 2:'car', 3:'motorcycle', 5:'bus', 7:'truck' }

def get_reader():
    global reader
    if reader is None:
        reader = easyocr.Reader(['en'], gpu=False)
    return reader

def get_model():
    global yolo_model
    if yolo_model is None:
        yolo_model = YOLO('yolov8n.pt')
    return yolo_model

def download_image(url):
    try:
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        suffix = '.png' if '.png' in url.lower() else '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(r.content)
            return tmp.name
    except Exception as e:
        print(f"Download error: {e}", file=sys.stderr)
        return None

def read_plate(image, bbox):
    x1,y1,x2,y2 = int(bbox[0]),int(bbox[1]),int(bbox[2]),int(bbox[3])
    crop = image[y1:y2, x1:x2]
    if crop.size == 0:
        return None, 0
    h = crop.shape[0]
    plate_region = crop[int(h*0.6):, :]
    try:
        ocr = get_reader()
        results = ocr.readtext(plate_region) or ocr.readtext(crop)
        if results:
            best = max(results, key=lambda x: x[2])
            text = ''.join(c for c in best[1].upper() if c.isalnum())
            if len(text) >= 4:
                return text, round(best[2]*100, 2)
    except Exception as e:
        print(f"OCR error: {e}", file=sys.stderr)
    return None, 0

def detect_from_image(image_path):
    if not MODELS_AVAILABLE:
        return {"plate":"NOT_DETECTED","confidence":0,"vehicle_type":"Unknown","success":False}

    try:
        image = cv2.imread(image_path)
        if image is None:
            return {"plate":"NOT_DETECTED","confidence":0,"vehicle_type":"Unknown","success":False}

        model = get_model()
        results = model(image, verbose=False)
        vehicles = []

        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                cls_id = int(box.cls[0])
                conf   = float(box.conf[0])
                if cls_id in VEHICLE_CLASSES and conf > 0.4:
                    vehicles.append({'bbox': box.xyxy[0].tolist(), 'vehicle_type': VEHICLE_CLASSES[cls_id], 'conf': conf})

        if not vehicles:
            try:
                ocr = get_reader()
                full = ocr.readtext(image)
                if full:
                    best = max(full, key=lambda x: x[2])
                    text = ''.join(c for c in best[1].upper() if c.isalnum())
                    if len(text) >= 4:
                        return {"plate":text,"confidence":round(best[2]*100,2),"vehicle_type":"Unknown","success":True}
            except: pass
            return {"plate":"NOT_DETECTED","confidence":0,"vehicle_type":"No vehicle detected","success":False}

        best_vehicle = max(vehicles, key=lambda x: x['conf'])
        plate, conf  = read_plate(image, best_vehicle['bbox'])

        if plate:
            return {"plate":plate,"confidence":conf,"vehicle_type":best_vehicle['vehicle_type'],"success":True}
        return {"plate":"PLATE_NOT_READABLE","confidence":0,"vehicle_type":best_vehicle['vehicle_type'],"success":False}

    except Exception as e:
        print(f"Detection error: {e}", file=sys.stderr)
        return {"plate":"NOT_DETECTED","confidence":0,"vehicle_type":"Unknown","success":False,"error":str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"plate":"NOT_DETECTED","confidence":0,"vehicle_type":"Unknown","success":False}))
        sys.exit(1)

    inp = sys.argv[1]
    tmp = None

    if inp.startswith('http://') or inp.startswith('https://'):
        tmp = download_image(inp)
        path = tmp
    else:
        path = inp

    result = detect_from_image(path)
    if tmp and os.path.exists(tmp):
        os.remove(tmp)

    print(json.dumps(result))
