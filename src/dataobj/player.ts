import Phaser from "phaser";
export default class Player extends Phaser.GameObjects.GameObject {
    update(...args: any[]): void {
        super.update();
        // actions needed to be performed during time
        console.log("hello");
    }
};
