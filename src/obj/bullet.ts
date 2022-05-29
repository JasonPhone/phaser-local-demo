import Phaser from "phaser";
export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    public damage: number;
    public player: string;
    public team: number;
    public particle: Phaser.GameObjects.Particles.ParticleEmitterManager;
    constructor(info: { damage: number, player: string, team: number }, data: { scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture }) {
        const { scene, x, y, texture } = data;
        super(scene, x, y, texture);
        this.damage = info.damage;
        this.player = info.player;
        this.team = info.team;
    }
    destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
        this.particle.destroy(fromScene);
    }
    create_particle(mngr: Phaser.GameObjects.Particles.ParticleEmitterManager) {
        this.particle = mngr;
        const clr = this.damage <= 10 ? "white" : "red";
        this.particle.createEmitter({
            frame: ["white"],
            quantity: 20,
            speedX: { min: 20, max: 50 },
            speedY: { min: 20, max: 50 },
            lifespan: { min: 50, max: 150 },
            alpha: { start: 0.5, end: 0, ease: "Sine.easeIn" },
            scale: { start: 0.1, end: 0.002 },
            rotate: { min: -180, max: 180 },
            angle: { min: 30, max: 110 },
            blendMode: 'SCREEN',
            frequency: 15,
            follow: this
        });
    }
};
