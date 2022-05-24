import Phaser from "phaser"
import { GameScene } from "./scenes/GameScene";
import { LoginScene } from "./scenes/LoginScene";
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "gameContainer",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    dom: {
        createContainer: true
    },
    scene: [LoginScene, GameScene]
};
export default new Phaser.Game(config);
