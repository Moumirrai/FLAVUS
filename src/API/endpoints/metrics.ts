import { APIEndpoint } from 'flavus-api';

interface metrics {
  status: number;
  activePlayers: number;
  uptime: number;
  cpuUsage: number;
  cpuUsageTotal: number;
  memoryUsage: number;
}

const MetricsEndpoint: APIEndpoint = {
  path: 'metrics',
  async execute(client, req, res): Promise<Express.Response> {
    const response: metrics = {
      status: client.status,
      activePlayers: client.manager.players.size,
      uptime: client.uptime,
      cpuUsage: Math.round(process.cpuUsage().user / 1000000),
      cpuUsageTotal: Math.round(process.cpuUsage().system / 1000000),
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    };
    return res.status(200).json(response);
  }
};

export default MetricsEndpoint;
