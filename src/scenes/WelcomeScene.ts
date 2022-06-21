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

export class WelcomeScene extends Phaser.Scene {
    private team_indicator: Phaser.GameObjects.Graphics;
    private role_indicator: Phaser.GameObjects.Graphics;
    private team_A: Phaser.GameObjects.Text;
    private team_B: Phaser.GameObjects.Text;
    private role_ADC: Phaser.GameObjects.Sprite;
    private role_SUP: Phaser.GameObjects.Sprite;
    private role_TNK: Phaser.GameObjects.Sprite;
    private start: Phaser.GameObjects.Text;
    private player_info = new PlayerInfo();
    constructor() {
        super({
            key: "WelcomeScene"
        });
    }

    preload() {
        this.load.image('bg', bg);

        this.load.image("playerADC", pngPlayerADC);
        this.load.image("playerSUP", pngPlayerSUP);
        this.load.image("playerTNK", pngPlayerTNK);
    }
    create(data: any) {
        // console.log("WelcomeScene::create: scene created");
        const { name } = data;
        this.player_info.name = name ? name : (Math.random() * 5).toString().substring(0, 5);
        this.player_info.team = 0;
        this.player_info.role = RoleType.ADC;
        const img = this.add.image(0, 0, 'bg').setOrigin(0, 0);
        /****** team choose ******/
        const team_prompt_text = this.add.text(50, 50, "选择队伍", { fontFamily: "宋体", fontSize: "50px" });
        this.team_A = this.add.text(170, 130, "tab缩进队",
            {
                fontFamily: "宋体",
                fontSize: "30px",
                color: "#ff7777"
            }).setInteractive();
        this.team_B = this.add.text(470, 130, "空格缩进队",
            {
                fontFamily: "宋体",
                fontSize: "30px",
                color: "#7777ff"
            }).setInteractive();
        this.team_events(this.team_A, 0);
        this.team_events(this.team_B, 1);
        /****** role choose ******/
        const role_prompt_text = this.add.text(50, 180, "选择角色", { fontFamily: "宋体", fontSize: "50px" });
        this.role_ADC = this.add.sprite(200, 310, "playerADC").setScale(2).setInteractive();
        this.role_SUP = this.add.sprite(400, 310, "playerSUP").setScale(2).setInteractive();
        this.role_TNK = this.add.sprite(600, 310, "playerTNK").setScale(2).setInteractive();
        this.role_events(this.role_ADC, RoleType.ADC);
        this.role_events(this.role_SUP, RoleType.SUP);
        this.role_events(this.role_TNK, RoleType.TNK);

        // indicator init
        this.team_indicator = this.add.graphics();
        this.role_indicator = this.add.graphics();

        // draw property
        this.draw_role_property();

        this.start = this.add.text(350, 530, "继续", { fontFamily: "宋体", fontSize: "45px" }).setInteractive();
        this.start.on("pointerover", () => {
            this.start.setTint(0xdddddd);
        });
        this.start.on("pointerout", () => {
            this.start.clearTint();
        });
        this.start.on("pointerdown", () => {
            this.start.setTint(0x999999);
        });
        this.start.on("pointerup", () => {
            this.start.setTint(0xdddddd);
            this.goto_gamescene();
        });

    }
    goto_gamescene() {
        // GameScene needs playerinfo and server
        this.scene.start("GameScene", this.player_info);
    }
    update(time: number, delta: number): void {
        // draw indicator
        // --------------
        // team
        if (this.player_info.team === 0) {
            this.draw_indicator(this.team_indicator, 160, 120, 155, 50);
        } else if (this.player_info.team === 1) {
            this.draw_indicator(this.team_indicator, 460, 120, 170, 50);
        }
        // role
        if (this.player_info.role === RoleType.ADC) {
            this.draw_indicator(this.role_indicator, 137, 242, 125, 125);
        } else if (this.player_info.role === RoleType.SUP) {
            this.draw_indicator(this.role_indicator, 337, 242, 125, 125);
        } else if (this.player_info.role === RoleType.TNK) {
            this.draw_indicator(this.role_indicator, 537, 242, 125, 125);
        }
    }
    draw_indicator(obj: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
        obj.clear();
        obj.lineStyle(8, 0xffffff, 0.7);
        obj.strokeRoundedRect(x, y, w, h);
    }
    team_events(obj: Phaser.GameObjects.Text, choose: number) {
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
            this.player_info.team = choose;
        });
    }
    role_events(obj: Phaser.GameObjects.Sprite, choose: RoleType) {
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
            this.player_info.role = choose;
        });
    }
    draw_role_property() {
        // adc
        this.draw_bar(135, 380, "攻", 0.8);
        this.draw_bar(135, 405, "防", 0.5);
        this.draw_bar(135, 430, "速", 0.7);
        this.draw_desc(135, 460, "技", ["一段时间内", "攻击力翻倍"]);
        // sup 
        this.draw_bar(335, 380, "攻", 0.6);
        this.draw_bar(335, 405, "防", 0.5);
        this.draw_bar(335, 430, "速", 0.7);
        this.draw_desc(335, 460, "技", ["缓慢恢复", "一定生命"]);
        // tnk
        this.draw_bar(535, 380, "攻", 0.6);
        this.draw_bar(535, 405, "防", 0.7);
        this.draw_bar(535, 430, "速", 0.6);
        this.draw_desc(535, 460, "技", ["获得一个护盾", "持续一段时间"]);
    }
    draw_bar(x: number, y: number, text: string, percent: number) {
        if (percent > 1) return;
        this.add.text(x, y, text,
            { fontFamily: "宋体", fontSize: "20px", color: "#ffffff" });
        x += 25;
        y += 7;
        const grap = this.add.graphics();
        grap.clear();
        grap.fillStyle(0x000000);
        grap.fillRect(x, y, 100, 8);
        grap.fillStyle(0xffffff);
        grap.fillRect(x + 2, y + 2, Math.floor(percent * 100), 4);
    }
    draw_desc(x: number, y: number, title: string, detail: string[]) {
        this.add.text(x, y, title,
            { fontFamily: "宋体", fontSize: "20px", color: "#ffffff" });
        x += 25;
        this.add.text(x, y, detail,
            { fontFamily: "宋体", fontSize: "20px", color: "#ffffff", wordWrap: { width: 20 } });
    }
};
