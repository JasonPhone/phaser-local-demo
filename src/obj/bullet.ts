import Phaser from "phaser";
export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    public damage: number;
    public source: string;
    constructor(info: { damage: number, source: string }, data: { scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture }) {
        const { scene, x, y, texture } = data;
        super(scene, x, y, texture);
        this.damage = info.damage;
        this.source = info.source;
    }
};
