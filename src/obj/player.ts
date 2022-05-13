import Phaser from "phaser";
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(data: {scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture}) {
        const {scene, x, y, texture} = data;
        super(scene, x, y, texture);
        // this.scene is set in super()
        this.scene.add.existing(this); // add this gameobject into simulation
        this.scene.physics.add.existing(this); // add to display
    }
    update(...args: any[]): void {
        super.update();
        // actions needed to be performed during time
        console.log("hello");
    }
};
