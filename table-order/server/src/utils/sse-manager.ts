import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
  storeId: string;
}

class SSEManager {
  private clients: SSEClient[] = [];

  addClient(id: string, storeId: string, res: Response): void {
    this.clients.push({ id, storeId, res });

    res.on('close', () => {
      this.removeClient(id);
    });
  }

  removeClient(id: string): void {
    this.clients = this.clients.filter(client => client.id !== id);
  }

  broadcast(storeId: string, event: string, data: object): void {
    const storeClients = this.clients.filter(client => client.storeId === storeId);

    storeClients.forEach(client => {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  getClientCount(storeId: string): number {
    return this.clients.filter(client => client.storeId === storeId).length;
  }
}

export const sseManager = new SSEManager();
