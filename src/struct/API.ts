//create simple api using typescript and express
//aslo public async main() to start express server

const express = require('express');
import { readdirSync } from 'fs';
import { resolve } from 'path';
import type { APIInterface, APIEndpoint } from 'flavus-api';
import { Collection } from 'discord.js';
import type { BotClient } from './Client';
import Logger from './Logger';

export class APIClient implements APIInterface {
  EndPoints = new Collection<string, APIEndpoint>();

  public async main(client: BotClient) {
    const app = express();

    await this.loadEndpoints();

    const port = process.env.APIPORT || 3000;

    app.get('/api/:path', async (req, res) => {
      const path = req.params.path;
      const endpoint = this.EndPoints.get(path);
      if (!endpoint) return res.status(404).send('404 Not Found');
      await endpoint.execute(client, req, res);
    });

    app.listen(port, () => Logger.info(`API running on port ${port}`));
  }

  private async loadEndpoints(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'API'));
    for (const file of files) {
      console.log(file);
      const endpoint: APIEndpoint = (await import(resolve(__dirname, '..', 'API', file)))
        .default;
      this.EndPoints.set(endpoint.path, endpoint);
    }
    Logger.info(`${this.EndPoints.size} API endpoints loaded!`);
  }
}
