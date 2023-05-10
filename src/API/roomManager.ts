import { APICore } from './client/APICore';
import { Socket } from 'socket.io';

export default class roomManager {
  constructor(api: APICore) {
    this.api = api;
  }

  public api: APICore;

  public destroyRoom(id: string) {
    const room = this.api.cache.rooms.get(id);
    if (!room) return;
    if (room.interval) {
      this.api.client.logger.debug('Clearing interval for room ' + room.id);
      clearInterval(room.interval);
    }
    this.api.client.logger.debug('Removing room from cache ' + room.id);
    this.api.cache.rooms.delete(id);
  }



  private async purgeRooms(socket: Socket, id?: string) {
    console.log('Purging rooms')
    if (!id) id = 'undefined';
    if (socket && socket.rooms && socket.rooms.size) {
      console.log('Purging rooms 1')
      for (const room of socket.rooms) {
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
      }
    }
  }


  public async leave(socket: Socket) {
    this.api.client.logger.debug('Leaving room');
    if (socket && socket.connected) socket.emit('playerDestroy');
    await this.purgeRooms(socket);
  }

  public async join(socket: Socket, guildId: string) {
    console.log('joining room')
    await this.purgeRooms(socket, guildId);
    if (!socket.rooms.has(guildId)) {
      console.log('joining room' + guildId)
      socket.join(guildId);
    }
    if (!this.api.cache.rooms.has(guildId)) {
      this.api.client.logger.debug('Creating new room in cache ' + guildId);
      this.api.cache.rooms.set(guildId, {
        id: guildId,
        members: [socket.request.session.user.id],
        interval:  setInterval(() => {
          this.api.playerPing.playerData(guildId);
        }, 1000)
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
    this.api.playerPing.queueData(guildId);
  }
}
