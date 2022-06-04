import Phaser, { Physics, Scenes } from "phaser";
import { KeyState, PlayerInfo, RoleType, CommandType, Command } from "../types/common";
import Bullet from "../obj/Bullet";
import { Room, Client } from "colyseus.js";
import ServerSocket from "../obj/ServerSocket";

import bg from "../assets/images/citybg.png";
import pngPlayerADC from "../assets/adc_body.png";
import pngPlayerSUP from "../assets/sup_body.png";
import pngPlayerTNK from "../assets/tank_body.png";
// import pngStar from "../assets/star.png";
// import pngBomb from "../assets/bomb.png";
// import jsonDefaultMap from "../assets/maps/map_default.json";
// import jsonMapTileSet from "../assets/maps/tileset_map.json";
// import pngTileSetImg from "../assets/wall_bricks.png";
// import pngDude from "../assets/dude.png"
// import pngFlare from "../assets/particle/flares.png";
// import jsonFlare from "../assets/particle/flares.json";

export class WelcomeScene extends Phaser.Scene {
    private server: ServerSocket;
    private team_choose: number = -1;
    private role_choose: number = -1;
    constructor() {
        super({
            key: "WelcomeScene"
        });
        this.server = new ServerSocket("ws://localhost:2567", "game-server");
    }

    preload() {
        this.load.image('bg', bg);

        this.load.image("playerADC", pngPlayerADC);
        this.load.image("playerSUP", pngPlayerSUP);
        this.load.image("playerTNK", pngPlayerTNK);
    }
    init() {
    }
    create() {
        console.log("WelcomeScene::create: scene created");
        const img = this.add.image(0, 0, 'bg').setOrigin(0, 0);
        /****** team choose ******/
        const team_prompt_text = this.add.text(50, 50, "选择队伍", { fontFamily: "宋体", fontSize: "50px" });
        const team_A = this.add.text(170, 130, "tab缩进队",
            {
                fontFamily: "宋体",
                fontSize: "30px",
                color: "#ff7777"
            }).setInteractive();
        // event vfx
        team_A.on("pointerover", () => {
            team_A.setTint(0xdddddd);
        });
        team_A.on("pointerout", () => {
            team_A.clearTint();
        });
        team_A.on("pointerdown", () => {
            team_A.setTint(0x999999);
        });
        team_A.on("pointerup", () => {
            team_A.setTint(0xdddddd);
            this.team_choose = 0;
        });
        const team_B = this.add.text(470, 130, "空格缩进队",
            {
                fontFamily: "宋体",
                fontSize: "30px",
                color: "#7777ff"
            }).setInteractive();
        team_B.on("pointerover", () => {
            team_B.setTint(0xdddddd);
        });
        team_B.on("pointerout", () => {
            team_B.clearTint();
        });
        team_B.on("pointerdown", () => {
            team_B.setTint(0x999999);
        });
        team_B.on("pointerup", () => {
            team_B.setTint(0xdddddd);
            this.team_choose = 1;
        });
        /****** role choose ******/
        const role_prompt_text = this.add.text(50, 200, "选择角色", { fontFamily: "宋体", fontSize: "50px" });
        // TODO add player image
    }
    goto_gamescene(info: PlayerInfo) {
        // GameScene needs playerinfo and server
        this.scene.launch("GameScene", {
            server: this.server,
            info: info
        });
    }
    update(time: number, delta: number): void {
    }
};
