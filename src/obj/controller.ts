// need to update when the pointer moves (listen in GameScene)
import { Client, Room } from "colyseus.js";

export default class Controller {
    private client_: Client;
    private room_: Room;
    constructor(server_address: string, room_name: string) {
        this.client_ = new Client(server_address);
        this.client_.joinOrCreate(room_name).then(room => {
            console.log(`Controller::constructor: joined room ${room.id}`);
            this.room_ = room;
        }).catch(e => {
            console.log(`Controller::constructor: failed to join room, ${e}`);
        })
    }

    get client() { return this.client_; }
    get room() { return this.room_; }

}
