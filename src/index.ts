import Phaser from "phaser"
import BootstrapScene from "./scenes/BootstrapScene";
import { GameScene } from "./scenes/GameScene";
import { LoginScene } from "./scenes/LoginScene";
import { WelcomeScene } from "./scenes/WelcomeScene";
const config = {
    type: Phaser.WEBGL,
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
    scene: [
        // LoginScene, 
        WelcomeScene,
        GameScene,
    ]
};
const Game = new Phaser.Game(config);
// Game.scene.start("WelcomeScene");
// Game.scene.start("WelcomeScene");


