import WebSocket from 'ws';
import { CONFIG } from '../utils/config';

// Define the WebSocket server URL
const WS_SERVER_URL = CONFIG.DEPLOYMENT_WS_URL;

export const WS_CLIENT = (token: string) => {
  const ws = new WebSocket(`${WS_SERVER_URL}?token=${token}`);

  ws.on('open', () => {
    console.log('Connected to the server');
  });

  ws.on('message', (data) => {
    console.log('Received: ', data);
  });

  ws.on('close', () => {
    console.log('Disconnected from the server');
  });

  ws.on('error', (error) => {
    console.log('Error: ', error);
  });

  return ws;
};
