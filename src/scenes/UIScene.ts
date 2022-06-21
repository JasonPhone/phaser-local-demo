/**
 * init scene for
 *      handle logic between scenes
 *      inject network services into scenes
 */
import Phaser from "phaser";
import { PlayerInfo } from "../types/common";
import Player from "../obj/Player";
import ServerSocket from "../obj/ServerSocket";

export class UIScene extends Phaser.Scene {
    private ui_active: boolean = false;
    private game_scene: Phaser.Scene;
    public dbg_text: Phaser.GameObjects.Text;
    private skill_text: Phaser.GameObjects.Text;
    private skill_graph: Phaser.GameObjects.Graphics;
    private skill_cd: number = 0;
    private timer_text: Phaser.GameObjects.Text;
    private timer_value: number = 300 * 1000;
    private team_0_text: Phaser.GameObjects.Text;
    private team_1_text: Phaser.GameObjects.Text;
    private prompt_text_title: Phaser.GameObjects.Text;
    private prompt_text_content: Phaser.GameObjects.Text;
    private prompt_bg: Phaser.GameObjects.Graphics;
    private player: PlayerInfo;

    private start_time: number = 999999999;
    constructor() {
        super({ key: "UIScene", active: false });  // scene id
    }
    create(data: any) {
        // console.log("UIScene::create: ok");
        this.player = data.player;
        this.game_scene = this.scene.get("GameScene");
        this.dbg_text = this.add.text(
            10, 10, "", { fontFamily: "宋体", fontSize: "20px" }
        );

        // prompt
        this.prompt_bg = this.add.graphics();
        this.prompt_bg.clear();
        this.prompt_bg.fillStyle(0x333333, 0.8);
        this.prompt_bg.fillRect(0, 0, 800, 600);
        this.prompt_text_title = this.add.text(
            280, 200, "等待其他玩家",
            {
                fontFamily: "宋体", fontSize: "40px",
            }
        );
        this.prompt_text_content = this.add.text(
            100, 300,
            [
                "W 向上，A 向左，S 向下，D 向右",
                "移动鼠标瞄准，单击射击",
                "空格使用技能",
                "5 分钟内，先击败三人的队伍获胜"
            ],
            {
                fontFamily: "宋体", fontSize: "40px", align: "center"
            }
        );


        this.init_game_msg();
    }
    init_game_text() {
        // console.log("UIScene::init text");
        // clear prompt
        this.prompt_bg.clear();
        this.prompt_text_content.setText("");
        this.prompt_text_title.setText("");
        // skill
        this.skill_text = this.add.text(
            10, 550, "技", { fontFamily: "宋体", fontSize: "40px" }
        );
        this.skill_graph = this.add.graphics();

        // timer
        this.timer_text = this.add.text(
            345, 0, "03:00",
            {
                fontFamily: "宋体", fontSize: "40px",
                padding: { left: 5, right: 5, top: 5, bottom: 5 },
                backgroundColor: "#555555"
            }
        );

        // board
        this.team_0_text = this.add.text(
            305, 0, "00",
            {
                fontFamily: "宋体", fontSize: "30px", color: "#ff7777",
                padding: { left: 5, right: 5, top: 5, bottom: 5 },
                backgroundColor: "#555555"
            }
        );
        this.team_1_text = this.add.text(
            455, 0, "00",
            {
                fontFamily: "宋体", fontSize: "30px", color: "#7777ff",
                padding: { left: 5, right: 5, top: 5, bottom: 5 },
                backgroundColor: "#555555"
            }
        );
    }
    init_game_msg() {
        this.game_scene.events.on("game_counting", () => {
            // game counting
            // this.prompt_text_title.setText("3秒后开始");
        }, this);
        this.game_scene.events.on("before_start", (data: any) => {
            // update the counting 
            let { time } = data;
            time = 4 - Math.ceil(time / 1000);
            this.prompt_text_title.setText(time.toString() + "秒后开始");
            this.prompt_text_title.setPosition(310, 200);
        }, this);
        this.game_scene.events.on("game_start", (data: any) => {
            // game start, begin 
            this.ui_active = true;
            this.init_game_text();
        }, this);
        this.game_scene.events.on("show_text", (data: any) => {
            // game start, begin 
            this.dbg_text.setText(data.text);
        }, this);
        this.game_scene.events.on("skill", (data: any) => {
            if (this.player.name != data.player.name) return;
            this.skill_cd = 10 * 1000;
        }, this);
        this.game_scene.events.on("update_board", (data: any) => {
            this.update_board(data);
        }, this);
    }
    update(time: number, delta: number): void {
        if (this.ui_active === false) {
            return;
        }
        /****** skill cd ******/
        this.skill_cd = Math.max(this.skill_cd - delta, 0);
        /****** game time ******/
        this.timer_value = Math.max(this.timer_value - delta, 0);
        /****** tab board ******/
        // update by event
        /****** render ******/
        this.update_skill();
        this.update_timer();
        // this.dbg_text.setText(time.toString());
    }
    update_timer() {
        // timer
        let time = Math.ceil(this.timer_value / 1000);
        let mm = Math.floor(time / 60);
        let ss = time - mm * 60;
        let mm_str = mm.toString();
        let ss_str = ss.toString();
        mm_str = mm_str.length < 2 ? '0' + mm_str : mm_str;
        ss_str = ss_str.length < 2 ? '0' + ss_str : ss_str;
        this.timer_text.setText(mm_str + ':' + ss_str);
    }
    update_board(data: any) {
        // total kill
        let kill: Map<string, number> = data.kill;
        let players: Map<string, Player> = data.players;
        let team_0_kill = 0, team_1_kill = 0;
        kill.forEach((kill_count, player_name) => {
            if (players.get(player_name).info.team === 0) {
                team_0_kill += kill_count;
            } else if (players.get(player_name).info.team === 1) {
                team_1_kill += kill_count;
            }
        });
        // console.log(team_0_kill, team_1_kill);
        let team_0_str = team_0_kill.toString();
        let team_1_str = team_1_kill.toString();
        team_0_str = team_0_str.length < 2 ? '0' + team_0_str : team_0_str;
        team_1_str = team_1_str.length < 2 ? '0' + team_1_str : team_1_str;
        this.team_0_text.setText(team_0_str);
        this.team_1_text.setText(team_1_str);
        // console.log("UIScene::update_board", team_0_str, team_1_str);
    }
    update_skill() {
        // skill bar
        let x = 10, y = 550;
        this.skill_graph.clear();
        // y -= 40;
        this.skill_graph.fillStyle(0x444444, 0.7);
        this.skill_graph.fillRect(x, y, 40, 40 * this.skill_cd / 10 / 1000);
    }
}

