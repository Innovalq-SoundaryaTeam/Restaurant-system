from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_service import websocket_manager
import json

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            # Handle any incoming messages if needed
            message = json.loads(data)
            print(f"📨 Received message: {message}")
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
        print("🔌 WebSocket disconnected")
