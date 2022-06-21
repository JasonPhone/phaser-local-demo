import Phaser from "phaser"
import { GameScene } from "./scenes/GameScene";
import { LoginScene } from "./scenes/LoginScene";
import { WelcomeScene } from "./scenes/WelcomeScene";
import { EndScene } from "./scenes/EndScene";
import { UIScene } from "./scenes/UIScene";
const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: "gameContainer",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    scene: [
        LoginScene, 
        WelcomeScene,
        GameScene,
        UIScene,
        EndScene
    ]
};
const Game = new Phaser.Game(config);


