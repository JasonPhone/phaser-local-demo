import Phaser from "phaser";

export default class HealthBar {
    private cur_health: number;
    private max_health: number;
    private cur_shield: number;
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
        this.cur_shield = 0;
        this.draw(x, y);
        scene.add.existing(this.bar);
    }
    gain_health(v: number) {
        this.cur_health = Math.min(this.cur_health + v, this.max_health);
    }
    lose(v: number = 10) {
        if (v > this.cur_shield) {
            v -= this.cur_shield;
            this.cur_shield = 0;
            this.cur_health = Math.max(0, this.cur_health - v);
        } else {
            this.cur_shield -= v;
        }
    }
    gain_shield(v: number) {
        this.cur_shield += v;
    }
    /**
     * draw the bar
     * @param x x of player
     * @param y y of player
     */
    draw(x: number, y: number) {
        // adjust position
        x -= 40;
        y += 30;

        this.bar.clear();
        // black background 
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(x, y, 80, 8);
        // health and shield
        if (this.cur_health < 30) // red
            this.bar.fillStyle(0xff0000);
        else
            this.bar.fillStyle(0x00ff00);
        let health_len = 0, shield_len = 0;
        if (this.cur_health + this.cur_shield <= 100) {
            health_len = Math.floor(0.76 * this.cur_health);
            shield_len = Math.floor(0.76 * this.cur_shield);
        } else {
            health_len = Math.floor(76 * (this.cur_health) / (this.cur_health + this.cur_shield));
            shield_len = Math.floor(76 * (this.cur_shield) / (this.cur_health + this.cur_shield));
        }
        this.bar.fillRect(x + 2, y + 2, health_len, 4);
        this.bar.fillStyle(0x555555);
        this.bar.fillRect(x + 2 + health_len, y + 2, shield_len, 4);

    }
    get health() { return this.cur_health; }
    get maximum() { return this.max_health; }
    get shield() { return this.cur_shield; }
}
