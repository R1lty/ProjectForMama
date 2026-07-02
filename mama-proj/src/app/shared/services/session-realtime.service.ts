import { Injectable } from '@angular/core';
import { getWsBaseUrl } from '../api-config';

export interface SessionRealtimeMessage {
  type: string;
  session_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionRealtimeService {
  connectToSession(
    sessionId: number,
    onSessionUpdated: () => void
  ): WebSocket {
    const socket = new WebSocket(this.getSessionWebSocketUrl(sessionId));

    socket.onopen = () => {
      console.log('WebSocket connected for session', sessionId);
    };

    socket.onmessage = event => {
      try {
        const message = JSON.parse(event.data) as SessionRealtimeMessage;

        if (message.type === 'session_updated') {
          onSessionUpdated();
        }
      } catch (error) {
        console.error('Invalid WebSocket message', error);
      }
    };

    socket.onerror = error => {
      console.error('WebSocket error', error);
    };

    socket.onclose = () => {
      console.log('WebSocket closed for session', sessionId);
    };

    return socket;
  }

  close(socket: WebSocket | null): void {
    if (!socket) {
      return;
    }

    socket.close();
  }

  private getSessionWebSocketUrl(sessionId: number): string {
    return `${getWsBaseUrl()}/ws/sessions/${sessionId}`;
  }
}