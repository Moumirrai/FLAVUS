//create simple api using typescript and express
//aslo public async main() to start express server

const express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors');
const axios = require('axios');
import { readdirSync } from 'fs';
import { resolve } from 'path';
import type { APIInterface, APIEndpoint, UserInterface } from 'flavus-api';
import { Collection } from 'discord.js';
import type { BotClient } from './Client';
import Logger from './Logger';

export class APIClient implements APIInterface {
  EndPoints = new Collection<string, APIEndpoint>();

  public async main(client: BotClient) {
    const app = express();

    await this.loadEndpoints();

    const port = process.env.APIPORT || 3000;

    app.use(cors());
    app.use(bodyParser.json())

    app.use(function(req, res, next) {
      //intercepts OPTIONS method
      if ('OPTIONS' === req.method) {
        //respond with 200
        res.send(200);
      }
      else {
        next();
      }
  });

    app.post('/api/:path', async (req, res) => {
      const user: UserInterface = await this.auth(req);
      if (user === null) {
        res.status(401).send('Unauthorized');
      } else {
        const path = req.params.path;
        const endpoint = this.EndPoints.get(path);
        if (!endpoint) return res.status(404).send('404 Not Found');
        await endpoint.execute(client, req, res, user);
      }
    });

    app.listen(port, () => Logger.info(`API running on port ${port}`));
  }

  private async loadEndpoints(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'API'));
    for (const file of files) {
      const endpoint: APIEndpoint = (
        await import(resolve(__dirname, '..', 'API', file))
      ).default;
      this.EndPoints.set(endpoint.path, endpoint);
    }
    Logger.info(`${this.EndPoints.size} API endpoints loaded!`);
  }

  private async auth(req: any): Promise<UserInterface> {
    let returnRes;
    await axios
      .get('https://discord.com/api/users/@me', {
        headers: {
          authorization: req.headers.authorization
        }
      })
      .then(function (response) {
        if (response.data.userId === req.headers.userId) {
          returnRes = response.data;
        } else {
          returnRes = null;
        }
      })
      .catch(function (error) {
        returnRes = null;
      });
    return returnRes;
  }

  //function above is somehow not working, can you fix it?
}
