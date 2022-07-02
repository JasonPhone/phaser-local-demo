import Phaser, { Physics, Scenes } from "phaser";
import bg from "../assets/images/bluebg.png";

export class EndScene extends Phaser.Scene {
    private exit_text: Phaser.GameObjects.Text;
    // private restart_text: Phaser.GameObjects.Text;
    private nm: string;
    private win: boolean;
    private choose: number = -1;
    constructor() {
        super({
            key: "EndScene",
            active: false
        });
    }

    preload() {
        this.load.image('bg', bg);
    }
    create(data: any) {
        // console.log("EndScene::create: scene created");
        const { name, win } = data;
        this.nm = name;
        this.win = win;
        this.scene.stop("GameScene");
        this.scene.stop("UIScene");
        const img = this.add.image(0, 0, 'bg').setOrigin(0, 0);
        /****** team choose ******/
        const team_prompt_text = this.add.text(50, 50, "游戏结束", { fontFamily: "宋体", fontSize: "40px" });
        const win_prompt_text = this.add.text(
            340, 220,
            this.win ? "胜利" : "失败",
            {
                fontFamily: "宋体", fontSize: "60px"
            });
        this.exit_text = this.add.text(370, 330, "退出",
            {
                fontFamily: "宋体",
                fontSize: "30px",
            }).setInteractive();
        this.click_events(this.exit_text, 0);
    }
    goto_gamescene() {
        if (this.choose === 1) {
            // goto welcome scene
            // this.scene.start("WelcomeScene", { name: this.nm });
        } else if (this.choose === 0) {
            // goto login scene
            history.go(0);
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
