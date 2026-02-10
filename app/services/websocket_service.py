from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio

# Store active WebSocket connections
active_connections: List[WebSocket] = []

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"❌ Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            pass

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_order_update(self, order_id: int, status: str):
        message = {
            "type": "order_status_update",
            "order_id": order_id,
            "status": status,
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.broadcast(json.dumps(message))

    async def broadcast_new_order(self, order_data: dict):
        message = {
            "type": "new_order",
            "order": order_data,
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.broadcast(json.dumps(message))

# Global WebSocket manager
websocket_manager = WebSocketManager()
