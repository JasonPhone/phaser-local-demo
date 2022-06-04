import Phaser, { Physics, Scenes } from "phaser";
import { KeyState, PlayerInfo, RoleType, CommandType, Command } from "../types/common";
import Player from "../obj/Player";
import Bullet from "../obj/Bullet";
import { Room, Client } from "colyseus.js";
import ServerSocket from "../obj/ServerSocket";

import pngPlayerADC from "../assets/adc_body.png";
import pngPlayerSUP from "../assets/sup_body.png";
import pngPlayerTNK from "../assets/tank_body.png";
import pngStar from "../assets/star.png";
import pngBomb from "../assets/bomb.png";
import jsonDefaultMap from "../assets/maps/map_default.json";
import jsonMapTileSet from "../assets/maps/tileset_map.json";
import pngTileSetImg from "../assets/wall_bricks.png";
import pngDude from "../assets/dude.png"
import pngFlare from "../assets/particle/flares.png";
import jsonFlare from "../assets/particle/flares.json";

export class WelcomeScene extends Phaser.Scene {
    private server: ServerSocket;
    private sent: boolean = false;
    private ty: CommandType = CommandType.KEYEVENT;

    constructor() {
        super({
            key: "WelcomeScene"
        });
    }

    async create(data: { server: ServerSocket }) {
        this.server = data.server;
        console.log("WelcomeScene::create: created");
        await this.server.connect();
        this.server.room.onMessage(this.ty, (message: Command) => {
            console.log("received msg", message);
            console.log(message.key);
        });
        this.server.room.onStateChange.once((state: any) => {
            console.log("state first init", state);
        })
        this.server.room.onStateChange.once((state: any) => {
            console.log("state follow update", state);
        })

        this.input.on("pointerdown", this.test, this);

    }
    test() {

        //     KEYEVENT= "keyevent",
        //     PTREVENT= "pointerevent",
        //     SPWAN = "spawn",
        //     KILL = "kill"
        this.server.send_msg(this.ty, {
            playerIf: {
                name: "test",
                team: 10,
                role: RoleType.ADC
            },
            key: "w",
            isDown: true,
            playerPositionX: 400,
            playerPositionY: 500,
            MousePositionX: 300,
            MousePositionY: 200
        });
    }
    update(time: number, delta: number): void {
    }
};
