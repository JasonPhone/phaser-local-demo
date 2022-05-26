import Phaser from "phaser";
export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    public damage: number;
    public source: string;
    public trace: Phaser.GameObjects.Particles.ParticleEmitterManager;
    constructor(info: { damage: number, source: string }, data: { scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture }) {
        const { scene, x, y, texture } = data;
        super(scene, x, y, texture);
        this.damage = info.damage;
        this.source = info.source;
    }
    destroy(fromScene?: boolean): void {
        this.trace.destroy(fromScene);
        super.destroy(fromScene);
    }
};
