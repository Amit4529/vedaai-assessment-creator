import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

// Map of assignmentId -> Set of WebSocket clients
const subscriptions = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer;

export function initWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 WebSocket client connected');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'subscribe' && message.assignmentId) {
          const assignmentId = message.assignmentId;

          if (!subscriptions.has(assignmentId)) {
            subscriptions.set(assignmentId, new Set());
          }
          subscriptions.get(assignmentId)!.add(ws);
          console.log(`📡 Client subscribed to assignment ${assignmentId}`);

          // Send acknowledgment
          ws.send(JSON.stringify({
            type: 'subscribed',
            assignmentId,
          }));
        }

        if (message.type === 'unsubscribe' && message.assignmentId) {
          const clients = subscriptions.get(message.assignmentId);
          if (clients) {
            clients.delete(ws);
            if (clients.size === 0) {
              subscriptions.delete(message.assignmentId);
            }
          }
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    });

    ws.on('close', () => {
      // Remove from all subscriptions
      for (const [assignmentId, clients] of subscriptions.entries()) {
        clients.delete(ws);
        if (clients.size === 0) {
          subscriptions.delete(assignmentId);
        }
      }
      console.log('🔌 WebSocket client disconnected');
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });

  console.log('✅ WebSocket server initialized');
}

export function broadcastToAssignment(assignmentId: string, data: any): void {
  const clients = subscriptions.get(assignmentId);
  if (!clients) return;

  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
