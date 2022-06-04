import Phaser from "phaser";
import Bullet from "./Bullet";
import { Buff, BuffType, PlayerInfo, RoleType } from "../types/common";
import HealthBar from "./HealthBar";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    /**
     * property:
     *  position and velocity are inherited
     *  player_info(name, team) need for constructor
     *  player_type
     *  player_health
     *  buff_list
     *  skill_CD
     *  shoot_CD
     */
    public info: PlayerInfo;
    public health: HealthBar;
    public buff_health: number = 0;
    public buff_shield: number = 0;
    public skill_CD: number;
    public shoot_CD: number;
    public alive: boolean = false;
    public name_text: Phaser.GameObjects.Text;
    /**
     * behaviour:
     *  constructor
     *  update()
     *  void shoot(Vector2)
     *  void skill(Vector2, Player?)
     *  void spawn(Vector2)
     *  void kill()
     */
    shoot(posx: number, posy: number) {
        if (this.shoot_CD > 0) return null;
        this.shoot_CD = 0.25 * 1000;
        const blt = new Bullet({damage: 20, player: this.info.name, team: this.info.team}, 
            {scene: this.scene, x: posx, y: posy, texture: "bomb"});
        return blt;
    }
    skill(shoot?: Function) {
        if (this.skill_CD > 0) return;
        console.log("use a skill");
        this.skill_CD = 10 * 1000;
        // https://phaser.io/examples/v3/view/physics/arcade/get-bodies-within-circle
        if (this.info.role === RoleType.TNK) {
            this.health.gain_shield(20);
        } else if (this.info.role === RoleType.SUP) {
            // a circle where teammates can gain health
        } else if (this.info.role === RoleType.ADC) {
            // shoot a huge bullet
        }

    }
    hitted(bullet: Bullet) {
        this.health.lose(bullet.damage);
    }
    rotate_to(x: number, y: number) {
        const ori = this.get_orient(x, y);
        // calculate the angle
        const player_angle = Phaser.Math.Angle.Between(0, 0, ori.x, ori.y);
        // rotation angle, but between angle has a difference of 90 deg, due to different start direction
        this.setRotation(player_angle + Phaser.Math.DegToRad(90));
    }
    /**
     * place this player into the scene and physics simulation 
     * @param pos the position to spawn this player
     */
    spawn(pos?: Phaser.Math.Vector2) {
        this.addToDisplayList();
        this.addToUpdateList();
        this.scene.add.existing(this); // add to display
        this.scene.physics.add.existing(this); // add this gameobject into simulation
        if (pos) {
            this.setPosition(pos.x, pos.y);
        }
        this.alive = true;
    }
    kill() {
        this.removeFromDisplayList();
        this.removeFromUpdateList();
        this.setPosition(-100, -100);  // away from all collides
        this.alive = false;
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
        this.shoot_CD = 0;
        this.name_text = this.scene.add.text(this.x - 40, this.y + 40, this.name.substring(0, 8));
        this.name_text.setFontFamily('Arial').setFontSize(20).setColor("#ffffff").setPadding({ left: 5, right: 5 }).setBackgroundColor("#333333");
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
        // if (time - this.tm > 2000) {
        //     this.tm = time;
        //     const x = Math.random() * 400 - 200;
        //     const y = Math.random() * 400 - 200;
        //     this.setVelocity(x, y);
        // }
        /***** logic *****/
        this.skill_CD = Math.max(this.skill_CD - delta, 0);
        this.shoot_CD = Math.max(this.shoot_CD - delta, 0);
        let recover_buff = 1 - Math.pow(0.5, this.buff_health);
        recover_buff *= 10 * delta / 1000; // 10 point health per second 
        let shield_buff = 1 - Math.pow(0.5, this.buff_shield);
        shield_buff *= 10; // 10 point for first shield
        this.health.gain_shield(shield_buff);
        this.buff_shield = 0; // clear at once

        if (this.health.health <= 0) this.kill();
        /***** render *****/
        this.health.draw(this.x, this.y);
        this.name_text.setPosition(this.x - 40, this.y + 40);

    }

    get_orient(x: number, y: number): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(x - this.x, y - this.y).normalize();
    }
};
