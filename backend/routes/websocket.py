import asyncio
import json
from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from starlette import status
import logging

from services.auth_service import AuthService

logger = logging.getLogger(__name__)
router = APIRouter()

# Global store for active connections: user_id (email) -> List[WebSocket]
active_connections: Dict[str, List[WebSocket]] = {}

async def keep_alive(websocket: WebSocket, user_id: str):
    """Periodically send ping messages to keep the connection alive."""
    try:
        while True:
            await asyncio.sleep(30)  # Send ping every 30 seconds
            await websocket.send_text("ping")
            logger.debug(f"Sent ping to {user_id} for websocket: {websocket}")
    except WebSocketDisconnect:
        logger.info(f"Keep-alive for {user_id} (websocket: {websocket}) stopped due to disconnect.")
    except Exception as e:
        # Catching broad exception if send_text fails for other reasons (e.g. connection already closed)
        logger.info(f"Keep-alive for {user_id} (websocket: {websocket}) stopped: {e}")

async def send_to_user(user_id: str, payload: dict):
    """Sends a JSON payload to all active WebSockets for a given user_id."""
    if user_id in active_connections:
        message = json.dumps(payload)
        # Iterate over a copy of the list in case of disconnections during send
        for connection in list(active_connections[user_id]):
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message to {user_id} on websocket {connection}: {e}")
                # Optionally, attempt to remove this specific dead connection here,
                # though the main endpoint's finally block should also handle it.
                try:
                    active_connections[user_id].remove(connection)
                    if not active_connections[user_id]:
                        del active_connections[user_id]
                except ValueError:
                    pass # Already removed

async def broadcast_auth_update_to_user(user_id: str, is_authenticated: bool):
    """Sends an authentication status update to a specific user."""
    payload = {
        "type": "auth_update",
        "userId": user_id, # Or however the frontend expects this
        "authenticated": is_authenticated
    }
    await send_to_user(user_id, payload)


@router.websocket("/ws/{user_email}")
async def websocket_endpoint(websocket: WebSocket, user_email: str, token: str):
    user_id_from_token: str = None
    keep_alive_task: asyncio.Task = None

    try:
        auth_service = AuthService()
        user_id_from_token = await auth_service.verify_websocket_token(token)

        if not user_id_from_token:
            await websocket.accept() # Accept before closing with code
            logger.warning(f"WebSocket connection attempt with invalid token for claimed email {user_email}. Closing.")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
            return

        if user_id_from_token != user_email:
            await websocket.accept() # Accept before closing with code
            logger.warning(
                f"WebSocket connection attempt: token user_id ({user_id_from_token}) "
                f"does not match path user_email ({user_email}). Closing."
            )
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User ID mismatch")
            return

        await websocket.accept()
        logger.info(f"WebSocket connection accepted for user: {user_id_from_token}")

        if user_id_from_token not in active_connections:
            active_connections[user_id_from_token] = []
        active_connections[user_id_from_token].append(websocket)
        
        # Start keep-alive task
        keep_alive_task = asyncio.create_task(keep_alive(websocket, user_id_from_token))

        while True:
            data = await websocket.receive_text()
            if data == "pong":
                logger.debug(f"Received pong from {user_id_from_token}")
                continue
            # Handle other incoming messages from this client if needed
            logger.info(f"Received message from {user_id_from_token}: {data}")
            # Example: await send_to_user(user_id_from_token, {"echo": data})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user: {user_id_from_token or user_email}, reason: {websocket.client_state}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id_from_token or user_email}: {e}")
        if websocket.client_state != WebSocketDisconnect: # Avoid trying to close an already closed socket
            try:
                await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
            except Exception as close_exc:
                logger.error(f"Error trying to close websocket for {user_id_from_token or user_email}: {close_exc}")
    finally:
        if keep_alive_task and not keep_alive_task.done():
            keep_alive_task.cancel()
            logger.debug(f"Cancelled keep-alive task for {user_id_from_token or user_email} on websocket {websocket}")
        
        if user_id_from_token and user_id_from_token in active_connections:
            if websocket in active_connections[user_id_from_token]:
                active_connections[user_id_from_token].remove(websocket)
                logger.info(f"Removed websocket {websocket} for user {user_id_from_token}")
            if not active_connections[user_id_from_token]:
                del active_connections[user_id_from_token]
                logger.info(f"Removed user {user_id_from_token} from active_connections as they have no more sessions.")
        logger.info(f"Finished cleanup for websocket connection: {user_id_from_token or user_email}")