import { APICore } from '../APIClient';
import { Socket } from 'socket.io';

export default class roomManager {
  constructor(api: APICore) {
    this.api = api;
  }

  public api: APICore;

  private destroyRoom(id: string) {
    const room = this.api.cache.rooms.get(id);
    if (room.interval) {
      this.api.client.logger.debug('Clearing interval for room ' + room.id);
      clearInterval(room.interval);
    }
    this.api.client.logger.debug('Removing room from cache ' + room.id);
    this.api.cache.rooms.delete(id);
  }



  private async purgeRooms(socket: Socket, id?: string) {
    if (!id) id = 'undefined';
    if (socket.rooms.size) {
      socket.rooms.forEach(async (room) => {
        if (room !== id) {
          socket.leave(room);
          if (this.api.cache.rooms.has(room)) {
            this.api.cache.rooms.get(room).members = this.api.cache.rooms
              .get(room)
              .members.filter(
                (member) => member !== socket.request.session.user.id
              );
            if (this.api.cache.rooms.get(room).members.length === 0) {
              this.api.client.logger.debug('Room is empty, destroying');
              this.destroyRoom(room);
            }
          }
        }
      })
    }
  }


  public async leave(socket: Socket) {
    this.api.client.logger.debug('Leaving room');
    //console.log(socket.rooms);
    this.purgeRooms(socket);
  }

  public async join(socket: Socket, guildId: string) {
    await this.purgeRooms(socket, guildId);
    if (!socket.rooms.has(guildId)) {
      socket.join(guildId);
    }
    if (!this.api.cache.rooms.has(guildId)) {
      this.api.client.logger.debug('Creating new room in cache ' + guildId);
      this.api.cache.rooms.set(guildId, {
        id: guildId,
        members: [socket.request.session.user.id],
        interval: null
      });
    } else if (!this.api.cache.rooms.get(guildId).members.includes(socket.request.session.user.id)) {
      this.api.client.logger.debug('Assigning to existing room in cache ' + guildId);
      if (
        !this.api.cache.rooms
          .get(guildId)
          .members.includes(socket.request.session.user.id)
      ) {
        this.api.cache.rooms
          .get(guildId)
          .members.push(socket.request.session.user.id);
      }
    }
  }
}
