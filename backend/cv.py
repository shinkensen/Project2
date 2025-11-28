"""
FastAPI service for CV detection

Endpoint: POST /detect
Body: { "user_id": "<uid>", "bucket": "fridge-images" }

Behavior:
- list files in the specified bucket under the user's folder
- pick the most recently created file
- download the file bytes
- run object detection (Faster R-CNN pretrained on COCO)
- filter detections to common food classes and return list of ingredients

Requires environment variables:
- SUPABASE_URL
- SUPABASE_KEY (service role key recommended)

"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
load_dotenv()

import io
from PIL import Image
import torch
import torchvision.transforms as T
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in environment")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="SmartPlate CV Service")


class DetectRequest(BaseModel):
    user_id: str
    bucket: Optional[str] = "fridge-images"


# COCO class names (index 0 is __background__)
COCO_INSTANCE_CATEGORY_NAMES = [
    '__background__', 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
    'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter',
    'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe',
    'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
    'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
    'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed',
    'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave',
    'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
    'toothbrush'
]

# Select COCO classes that correspond to common ingredients/food items
FOOD_CLASSES = set([
    'banana', 'apple', 'orange', 'broccoli', 'carrot', 'pizza', 'donut', 'sandwich', 'hot dog',
    'bottle', 'wine glass', 'cup', 'bowl', 'cake'
])


def list_user_files(bucket: str, user_id: str):
    """List files under a user's top-level folder. Returns list of file metadata dicts."""
    try:
        # Try listing with path if supported
        res = supabase.storage.from_(bucket).list(path=user_id)
    except Exception:
        # Fallback: list all and filter by prefix
        res = supabase.storage.from_(bucket).list()
        if isinstance(res, list):
            res = [f for f in res if f.get('name','').startswith(f"{user_id}/")]

    if not res:
        return []

    # Ensure items have created_at; sort descending
    try:
        files = sorted(res, key=lambda x: x.get('created_at', ''), reverse=True)
    except Exception:
        files = res
    return files


def download_file_bytes(bucket: str, file_name: str) -> bytes:
    """Download file bytes from Supabase storage. Returns bytes."""
    data = supabase.storage.from_(bucket).download(file_name)
    # supabase-py may return bytes or a requests.Response-like object
    if hasattr(data, 'read'):
        return data.read()
    if isinstance(data, (bytes, bytearray)):
        return bytes(data)
    # If it's a dict with 'content' key
    if isinstance(data, dict) and 'content' in data:
        return data['content']
    raise RuntimeError('Unsupported download response type from Supabase')


@app.post('/detect')
async def detect(req: DetectRequest):
    bucket = req.bucket
    user_id = req.user_id

    files = list_user_files(bucket, user_id)
    if not files:
        raise HTTPException(status_code=404, detail=f'No files found for user {user_id} in bucket {bucket}')

    latest = files[0]
    file_name = latest.get('name')
    if not file_name:
        raise HTTPException(status_code=500, detail='Latest file metadata missing name')

    try:
        file_bytes = download_file_bytes(bucket, file_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to download file: {e}')

    try:
        image = Image.open(io.BytesIO(file_bytes)).convert('RGB')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Failed to open image: {e}')

    # Prepare image tensor
    transform = T.Compose([T.ToTensor()])
    img_t = transform(image)

    # Load model (cache globally to avoid reloading on each request)
    if not hasattr(app.state, 'model'):
        model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
        model.eval()
        app.state.model = model
    model = app.state.model

    with torch.no_grad():
        outputs = model([img_t])[0]

    labels = outputs.get('labels').cpu().numpy()
    scores = outputs.get('scores').cpu().numpy()

    detected = []
    for label, score in zip(labels, scores):
        if score < 0.35:
            continue
        name = COCO_INSTANCE_CATEGORY_NAMES[label]
        lname = name.lower()
        if lname in FOOD_CLASSES:
            detected.append({'name': lname, 'score': float(score)})

    # Deduplicate by name keeping highest score
    result_map = {}
    for d in detected:
        n = d['name']
        s = d['score']
        if n not in result_map or s > result_map[n]:
            result_map[n] = s

    ingredients = [{'name': k, 'score': v} for k, v in sorted(result_map.items(), key=lambda x: -x[1])]

    return {
        'file': file_name,
        'ingredients': ingredients
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('cv:app', host='0.0.0.0', port=8001, reload=True)