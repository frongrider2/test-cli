import WebSocket from "ws";
import { CONFIG } from "../utils/config";

// Define the WebSocket server URL
const WS_SERVER_URL = CONFIG.DEPLOYMENT_WS_URL;

export const WS_CLIENT = new WebSocket(WS_SERVER_URL);
