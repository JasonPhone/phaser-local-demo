import Phaser from "phaser";
import Bullet from "./Bullet";
import { Buff, BuffType, PlayerInfo, RoleType } from "../types/common";
import HealthBar from "./HealthBar";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public info: PlayerInfo;
    public health: HealthBar;
    public buff_health: number = 0;
    public buff_shield: number = 0;
    public skill_CD: number;
    public shoot_CD: number;
    public alive: boolean = false;
    public name_text: Phaser.GameObjects.Text;
    protected spd: number = 200;
    protected atk: number = 20;
    protected def: number = 0;
    /**
     * player shoot a bullet
     * @param posx position to shoot at
     * @param posy position to shoot at
     * @param damage damage of the bullet
     * @returns a bullet class
     */
    shoot(posx: number, posy: number, damage: number = 20) {
        if (this.shoot_CD > 0) return null;
        this.shoot_CD = 0.25 * 1000;
        const blt = new Bullet({ damage: this.atk, player: this.info.name, team: this.info.team },
            { scene: this.scene, x: posx, y: posy, texture: "bomb" });
        return blt;
    }
    skill(ptr: Phaser.Input.Pointer) {
        console.log("use a skill");
    }
    hitted(bullet: Bullet) {
        let dmg = Math.max(0, bullet.damage - this.def);
        this.health.lose(dmg);
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
/*
“产品经理”

- 定位：攻击型
- 攻击力较高，防御力较低，移动速度较高
- 技能：“需求分析”，立即射出一发两倍伤害的子弹。
*/
export class PlayerADC extends Player {
    constructor(info: { name: string, role: RoleType, team: number }, data: { scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture }) {
        super(info, data);
        // this.scene is set in super()
        this.info = info;
        this.init_property();
        this.atk = 25;
        this.def = -5;
        this.spd = 250;
    }
    skill(ptr: Phaser.Input.Pointer) {
        if (this.skill_CD > 0) return;
        this.skill_CD = 10 * 1000;
        // shoot a huge bullet
        let ori = this.get_orient(ptr.worldX, ptr.worldY);
        return this.shoot(ori.x, ori.y, this.atk * 2);
    }
}
/*
“程序员”
- 定位：治疗型
- 攻击力较低，防御力较低，移动速度较高
- 技能：“代码领域”，
    以释放技能时角色所在的位置为圆心，生成一个圆形区域，区域内所有同阵营的玩家每秒恢复一定血量。
    领域叠加时，后叠加领域的治疗效果为前一个的一半。
*/
export class PlayerSUP extends Player {
    
    constructor(info: { name: string, role: RoleType, team: number }, data: { scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture }) {
        super(info, data);
        // TODO preload images here, see https://www.youtube.com/watch?v=fdXcD9X4NrQ&t=2311s
        // load.image("playerADC", pngPlayerADC);
        console.log("SUP cstr");
        // this.scene is set in super()
        this.info = info;
        this.init_property();
        this.atk = 15;
        this.def = -5;
        this.spd = 250;
    }
    skill(ptr: Phaser.Input.Pointer) {
        if (this.skill_CD > 0) return;
        this.skill_CD = 10 * 1000;
        // https://phaser.io/examples/v3/view/physics/arcade/get-bodies-within-circle
        // a circle where teammates can gain health
    }
}
/*
“项目经理”

- 定位：防御型
- 攻击力较低，防御力较高，移动速度较低
- 技能：“团队攻坚”，立刻获得一个护盾，可以抵挡一定量的伤害。
    护盾叠加时，后叠加护盾可以抵挡的伤害为前一个的一半。
*/
export class PlayerTNK extends Player {

    constructor(info: { name: string, role: RoleType, team: number }, data: { scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture }) {
        super(info, data);
        // this.scene is set in super()
        this.info = info;
        this.init_property();
        this.atk = 15;
        this.def = 5;
        this.spd = 200;
    }
    skill(ptr: Phaser.Input.Pointer) {
        if (this.skill_CD > 0) return;
        this.skill_CD = 10 * 1000;
        // get a shield
        // count the layers
        let cnt = Math.floor((this.health.shield + 19) / 20);
        
        // one more layer, half less shield
        let shield_val = Math.pow(0.5, cnt) * 20;
        // increase the shield by integer
        this.health.gain_shield(Math.floor(shield_val));
    }
}
