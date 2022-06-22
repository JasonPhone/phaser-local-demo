import Phaser from "phaser";
import Bullet from "./Bullet";
import { PlayerInfo, RoleType } from "../types/common";
import HealthBar from "./HealthBar";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public info: PlayerInfo;
    public health: HealthBar;
    public buff_health: number = 0;
    public skill_CD: number = 0;
    public shoot_CD: number = 0;
    public alive: boolean = false;
    public name_text: Phaser.GameObjects.Text;
    protected spd: number = 200;
    protected atk: number = 20;
    protected def: number = 0;
    private skilled: boolean = false;
    private particle_mngr: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private particle_emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    public keys = { // for updating velocity
        right: false,
        left: false,
        up: false,
        down: false,
        space: false,
    }
    /**
     * player shoot a bullet
     * @param posx position to shoot at
     * @param posy position to shoot at
     * @param damage damage of the bullet
     * @returns a bullet class
     */
    shoot(posx: number, posy: number, damage: number = 20) {
        if (this.shoot_CD > 0) return undefined;
        this.shoot_CD = 0.25 * 1000;
        const blt = new Bullet({ damage: this.atk, player: this.info.name, team: this.info.team },
            { scene: this.scene, x: posx, y: posy, texture: "bomb" });
        return blt;
    }
    skill() {
        if (this.skill_CD > 0) return;
        this.skill_CD = 10 * 1000;
        this.scene.events.emit("skill", {player: this.info});
        switch (this.info.role) {
            case RoleType.ADC:
                /*
                “产品经理”
                - 技能：“需求分析”，一段时间内攻击力翻倍。
                */
                this.atk *= 2;
                this.skilled = true;
                // console.log("adc use a skill");
                this.particle_emitter.start();
                break;
            case RoleType.SUP:
                /*
                “程序员”
                - 技能：“代码领域”，一段时间内自身恢复一定血量
                */
                this.skilled = true;
                // console.log("sup use a skill");
                this.particle_emitter.start();
                break;
            case RoleType.TNK:
                /*
                “项目经理”
                - 技能：“团队攻坚”，立刻获得一个护盾，可以抵挡一定量的伤害。
                */
                this.health.gain_shield(20);
                this.skilled = true;
                // console.log("tnk use a skill");
                break;
        }
    }
    hitted(bullet: Bullet) {
        let dmg = Math.max(0, bullet.damage - this.def);
        this.health.lose(dmg);
        if (this.health.health <= 0) {
            this.setPosition(-100, -100);
            this.scene.events.emit("kill", { killer: bullet.player, victim: this.info.name});
        }
    }
    rotate_to(x: number, y: number) {
        const ori = this.get_orient(x, y);
        // calculate the angle
        const player_angle = Phaser.Math.Angle.Between(0, 0, ori.x, ori.y);
        // rotation angle, but between angle has a difference of 90 deg, due to different start direction
        this.setRotation(player_angle + Phaser.Math.DegToRad(90));
    }
    setVelocity(x: number, y?: number): this {
        let velo = new Phaser.Math.Vector2(x, y).normalize().scale(this.spd);
        super.setVelocity(velo.x, velo.y);
        return this;
    }
    /**
     * place this player into the scene and physics simulation 
     * @param pos the position to spawn this player
     */
    spawn(pos?: Phaser.Math.Vector2) {
        this.scene.add.existing(this); // add to display
        this.scene.physics.add.existing(this); // add this gameobject into simulation
        if (pos) {
            this.setPosition(pos.x, pos.y);
        }
        this.alive = true;
        this.health.health = 100;
        this.health.shield = 0;
    }
    kill() {
        this.setPosition(-100, -100);  // away from all collides
        this.alive = false;
        this.skill_CD = 0;
        this.shoot_CD = 0;
        this.health.health = 0;
        this.health.shield = 0;
        this.health.draw(this.x, this.y);
        this.name_text.setPosition(this.x - 40, this.y + 40);
    }
    create_particle(mngr: Phaser.GameObjects.Particles.ParticleEmitterManager) {
        this.particle_mngr = mngr;
        let clr = "";
        if (this.info.role === RoleType.ADC) clr = "red";
        else if (this.info.role === RoleType.SUP) clr = "green";
        this.particle_emitter = this.particle_mngr.createEmitter({
            frame: [clr],
            quantity: 9,
            speedX: { min: 20, max: 50 },
            speedY: { min: 20, max: 50 },
            lifespan: 200,
            alpha: { start: 0.4, end: 0, ease: "Sine.easeIn" },
            scale: { start: 1.0, end: 0.7 },
            angle: { min: 0, max: 360 },
            blendMode: "SCREEN",
            frequency: 30,
            follow: this
        }).stop();
    }
    constructor(info: { name: string, role: RoleType, team: number }, data: { scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture }) {
        const { scene, x, y, texture } = data;
        super(scene, x, y, texture);
        // this.scene is set in super()
        this.info = info;
        this.init_property();
    }
    init_property() {
        this.health = new HealthBar(this.scene, this.x, this.y);
        this.skill_CD = 0;
        // console.log("Player::init_property: name", this.info.name);
        this.name_text = this.scene.add.text(this.x - 40, this.y + 40, this.info.name.substring(0, 8));
        this.name_text.setFontFamily('Arial').setFontSize(20).setColor("#ffffff").setPadding({ left: 5, right: 5 }).setBackgroundColor("#333333");
        switch (this.info.role) {
            case RoleType.ADC:
                /*
                “产品经理”
                - 定位：攻击型
                - 攻击力较高，防御力较低，移动速度较高
                */
                this.atk += 5;
                this.def -= 5;
                this.spd += 40;
                break;
            case RoleType.SUP:
                /*
                “程序员”
                - 定位：治疗型
                - 攻击力较低，防御力较低，移动速度较高
                */
                this.def -= 5;
                this.spd += 40;
                break;
            case RoleType.TNK:
                /*
                “项目经理”
                - 定位：防御型
                - 攻击力较低，防御力较高，移动速度较低
                */
                this.def += 5;
                break;
        }
    }
    set_velo(x: number, y: number) {
        const velo = new Phaser.Math.Vector2(x, y);
        velo.normalize();
        velo.scale(this.spd);
        this.setVelocity(velo.x, velo.y);
    }
    /**
     * actions needed to be performed during time
     * NOTE: update should be explicitly called in scene update
     * or this class should be added to a dynamic group with 
     * runChildUpdate = true
     * @param time 
     * @param delta 
     */
    update(time: number, delta: number): void {
        /***** logic *****/
        this.skill_CD = Math.max(this.skill_CD - delta, 0);
        this.shoot_CD = Math.max(this.shoot_CD - delta, 0);
        if (this.alive === false) {
            return;
        }
        // ADC skill reset
        if (this.info.role === RoleType.ADC && this.skill_CD <= 6 * 1000 && this.skilled) {
            this.atk /= 2;
            this.skilled = false;
            this.particle_emitter.stop();
        }
        // SUP skill
        if (this.info.role === RoleType.SUP && this.skilled) {
            if (this.skill_CD <= 6 * 1000) {
                this.skilled = false;
                this.particle_emitter.stop();
            } else {
                this.health.gain_health(10 * delta / 1000);
            }
        }
        // TNK skill reset
        if (this.info.role === RoleType.TNK && this.skilled && this.skill_CD <= 6 * 1000) {
            this.skilled = false;
            this.health.gain_shield(-this.health.shield);
        }
        // move and skill
        let velo = new Phaser.Math.Vector2(0, 0);
        if (this.keys.up) velo.y = -1;
        if (this.keys.down) velo.y = 1;
        if (this.keys.left) velo.x = -1;
        if (this.keys.right) velo.x = 1;
        this.set_velo(velo.x, velo.y);
        if (this.keys.space) {
            this.skill(); this.keys.space = false;
        }

        /***** render *****/
        this.health.draw(this.x, this.y);
        this.name_text.setPosition(this.x - 40, this.y + 40);
    }

    get_orient(x: number, y: number): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(x - this.x, y - this.y).normalize();
    }
};
