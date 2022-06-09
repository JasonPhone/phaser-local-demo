/**
 * init scene for
 *      handle logic between scenes
 *      inject network services into scenes
 */
import Phaser from "phaser";
import ServerSocket from "../obj/ServerSocket";

export default class UIScene extends Phaser.Scene {
    public skill_cd: number = 0;
    private text: Phaser.GameObjects.Text;
    constructor() {
        super("UIScene");  // scene id
    }
    create() {
        this.text = this.add.text(10, 550, "技", {fontFamily: "宋体", fontSize: "25px"});
    }
}

