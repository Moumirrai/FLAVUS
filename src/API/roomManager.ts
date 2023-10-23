import type { APICore } from './client/APICore';
import { Socket } from 'socket.io';

export default class roomManager {
  constructor(api: APICore) {
    this.api = api;
  }

  public api: APICore;

  /**
   * Stops the room interval and removes it from cache
   * @param {string} id ID of the room to destroy
   * @returns {void}
   */
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

  //TF IS THIS???
  /**
   * Purges all unnecessary rooms from the socket, also should destroy the room if it's empty but idk about that
   * @param {Socket} socket Socket
   * @param {string} id ID of the room to omit from the purge
   * @returns {Promise<IGuildModel>} GuildModel
   */
  private purgeRooms(socket: Socket, id?: string): Promise<void> {
    this.api.client.logger.debug('Purging rooms');
    if (!id) id = 'undefined';
    if (!socket) return;
    const { rooms } = socket;
    if (!rooms || !rooms.size) return;
    this.api.client.logger.debug('Purging rooms 1');
    const user_id = socket.request.session.user.id;
    const { cache } = this.api;
    const { rooms: roomCache } = cache;
    for (const room of rooms) {
      if (room !== id) {
        socket.leave(room);
        if (!roomCache.has(room)) return;
        const roomData = roomCache.get(room);
        const roomMembers = roomData.members;
        const filteredMembers = roomMembers.filter(
          (member) => member !== user_id
        );
        cache.rooms.get(room).members = filteredMembers;
        if (filteredMembers.length === 0) {
          this.api.client.logger.debug('Room is empty, destroying');
          this.destroyRoom(room);
        }
      }
    }
  }

  /**
   * Checks if socket is still connected, if so it emits a playerDestroy event on client. Then calls purgeRooms
   * I don't know if this is necessary. Maybe this could be done in purgeRooms?
   * @param {Socket} socket Socket
   */
  public async leave(socket: Socket): Promise<void> {
    this.api.client.logger.debug('Leaving room');
    if (socket && socket.connected) socket.emit('player:destroy');
    await this.purgeRooms(socket);
  }

  public async join(socket: Socket, guildId: string) {
    await this.purgeRooms(socket, guildId);
    if (!socket.rooms.has(guildId)) {
      console.log('joining room' + guildId);
      socket.join(guildId);
    }
    if (!this.api.cache.rooms.has(guildId)) {
      this.api.client.logger.debug('Creating new room in cache ' + guildId);
      this.api.cache.rooms.set(guildId, {
        id: guildId,
        members: [socket.request.session.user.id],
        interval: setInterval(() => {
          this.api.playerPing.playerData(guildId);
        }, 1000)
      });
    } else if (
      !this.api.cache.rooms
        .get(guildId)
        .members.includes(socket.request.session.user.id)
    ) {
      this.api.client.logger.debug(
        'Assigning to existing room in cache ' + guildId
      );
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
    await this.api.playerPing.playerData(guildId);
    await this.api.playerPing.queueData(guildId);
  }
}
