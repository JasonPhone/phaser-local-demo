import { Client, Room } from "colyseus.js";
import { PlayerInfo, RoleType, Command } from "../types/common";
/*
    message types:
    keydown
    pointermove
    kill
    spawn
*/
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
        // player_list.push(
        //     { name: "jason", team: 0, role: RoleType.ADC }
        // );
        player_list.push(
            { name: "ally", team: 0, role: RoleType.SUP }
        );
        player_list.push(
            { name: "enemy", team: 1, role: RoleType.TNK }
        );
        return player_list;
    }
    send_msg(type: string, msg: Command) {

        //     KEYEVENT= "keyevent",
        //     PTREVENT= "pointerevent",
        //     SPWAN = "spawn",
        //     KILL = "kill"
        this.room_.send(type, msg);
    }

    get client() { return this.client_; }
    get room() { return this.room_; }

}
