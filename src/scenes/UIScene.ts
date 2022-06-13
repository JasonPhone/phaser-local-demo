/**
 * init scene for
 *      handle logic between scenes
 *      inject network services into scenes
 */
import Phaser from "phaser";
import ServerSocket from "../obj/ServerSocket";

export class UIScene extends Phaser.Scene {
    public skill_cd: number = 0;
    private text: Phaser.GameObjects.Text;
    constructor() {
        super("UIScene");  // scene id
    }
    create() {
        console.log("UIScene::create: ok");
        this.text = this.add.text(100, 100, "技", {fontFamily: "宋体", fontSize: "50px"});
    }
}

