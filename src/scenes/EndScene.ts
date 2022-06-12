import Phaser, { Physics, Scenes } from "phaser";
import { PlayerInfo, RoleType, CommandType, Command } from "../types/common";
import Bullet from "../obj/Bullet";
import { Room, Client } from "colyseus.js";
import ServerSocket from "../obj/ServerSocket";

import bg from "../assets/images/bluebg.png";
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

export class EndScene extends Phaser.Scene {
    private exit_text: Phaser.GameObjects.Text;
    private restart_text: Phaser.GameObjects.Text;
    private nm: string;
    private win: boolean;
    private choose: number = -1;
    constructor() {
        super({
            key: "EndScene"
        });
    }

    preload() {
        this.load.image('bg', bg);
    }
    create(data: any) {
        console.log("EndScene::create: scene created");
        const { name, win } = data;
        this.nm = name;
        this.win = win;
        const img = this.add.image(0, 0, 'bg').setOrigin(0, 0);
        /****** team choose ******/
        const team_prompt_text = this.add.text(50, 50, "游戏结束", { fontFamily: "宋体", fontSize: "40px" });
        const win_prompt_text = this.add.text(
            340, 220,
            this.win ? "胜利" : "失败",
            {
                fontFamily: "宋体", fontSize: "60px"
            });
        this.restart_text = this.add.text(220, 330, "重新开始",
            {
                fontFamily: "宋体",
                fontSize: "30px",
            }).setInteractive();
        this.exit_text = this.add.text(520, 330, "退出",
            {
                fontFamily: "宋体",
                fontSize: "30px",
            }).setInteractive();
        this.click_events(this.exit_text, 0);
        this.click_events(this.restart_text, 1);
    }
    goto_gamescene() {
        if (this.choose === 1) {
            // goto welcome scene
            this.scene.start("WelcomeScene", { name: this.nm });
        } else if (this.choose === 0) {
            // goto login scene
            this.scene.start("LoginScene");
        }
    }
    update(time: number, delta: number): void {
    }
    click_events(obj: Phaser.GameObjects.Text, choose: number) {
        obj.on("pointerover", () => {
            obj.setTint(0xdddddd);
        });
        obj.on("pointerout", () => {
            obj.clearTint();
        });
        obj.on("pointerdown", () => {
            obj.setTint(0x999999);
        });
        obj.on("pointerup", () => {
            obj.setTint(0xdddddd);
            this.choose = choose;
            this.goto_gamescene();
        });
    }
};
