import Phaser from "phaser";

export default class HealthBar {
    private cur_health: number;
    private max_health: number;
    private shield_val: number;
    private bar: Phaser.GameObjects.Graphics;
    /**
     * cstr for HealthBar
     * @param scene the scene this healthbar would be in, same with player
     * @param x x of player
     * @param y y of player
     */
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.max_health = 100;
        this.cur_health = 100;
        this.shield_val = 0;
        this.draw(x, y);
        scene.add.existing(this.bar);
    }
    gain_health(v: number) {
        this.cur_health = Math.min(this.cur_health + v, this.max_health);
    }
    lose(v: number = 10) {
        if (v > this.shield_val) {
            v -= this.shield_val;
            this.shield_val = 0;
            this.cur_health = Math.max(0, this.cur_health - v);
        } else {
            this.shield_val -= v;
        }
    }
    gain_shield(v: number) {
        this.shield_val += v;
    }
    /**
     * draw the bar
     * @param x x of player
     * @param y y of player
     */
    draw(x: number, y: number) {
        // adjust position
        x -= 40;
        y += 35;

        this.bar.clear();
        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(x, y, 80, 16);
        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(x + 2, y + 2, 76, 12);
        if (this.cur_health < 30) // red
            this.bar.fillStyle(0xff0000);
        else
            this.bar.fillStyle(0x00ff00);
        var d = Math.floor(0.76 * this.cur_health);
        this.bar.fillRect(x + 2, y + 2, d, 12);
    }
    get health() { return this.cur_health; }
    get maximum() { return this.max_health; }
    get shield() { return this.shield_val; }
}
