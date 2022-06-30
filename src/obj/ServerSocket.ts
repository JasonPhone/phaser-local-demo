import { Client, Room } from "colyseus.js";
import { PlayerInfo, RoleType, Command } from "../types/common";

export default class ServerSocket {
    private client_: Client;
    private room_: Room;
    private server_address_: string;
    private room_name_: string;
    constructor(server_addr: string, room_nm: string) {
        this.server_address_ = server_addr;
        this.room_name_ = room_nm;
        this.client_ = new Client(this.server_address_);
    }
    async connect() {
        this.room_ = await this.client_.joinOrCreate(this.room_name_);
    }
    /**
     * get all players 
     * @returns PlayerInfo[], all players in current room
     */
    get_players() {
        let player_list = new Array<PlayerInfo>();
        return player_list;
    }
    send_msg(type: string, msg: Command) {
        this.room_.send(type, msg);
    }

    get client() { return this.client_; }
    get room() { return this.room_; }

}
