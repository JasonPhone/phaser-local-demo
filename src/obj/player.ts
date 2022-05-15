import Phaser from "phaser";
import { Buff, HealthBar, RoleType } from "../types/common";

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
    public role: RoleType;
    public team: number;
    public health: HealthBar;
    public buff_list: Buff[];
    public skill_CD: number;
    public shoot_CD: number;
    /**
     * behaviour:
     *  constructor
     *  update()
     *  void shoot(Vector2)
     *  void skill(Vector2, Player?)
     *  void spawn(Vector2)
     *  void kill()
     */
    shoot(dir: Phaser.Math.Vector2) {
        // return a NormalBullet instance
        if (this.shoot_CD > 0) return;
        console.log("shoot a bullet");
        this.shoot_CD = 0.5;
    }
    skill(pos: Phaser.Math.Vector2, target: Player) {
        if (this.skill_CD > 0) return;
        console.log("use a skill");
        this.skill_CD = 10;
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
    }
    kill() {
        this.removeFromDisplayList();
        this.removeFromUpdateList();
        this.setPosition(-100, -100);  // away from all collides
    }
    constructor(info: { name: string, role: RoleType, team: number }, data: { scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture }) {
        const { scene, x, y, texture } = data;
        super(scene, x, y, texture);
        // this.scene is set in super()
        const { name, role, team } = info;
        this.name = name;
        this.role = role;
        this.team = team;
        this.init_property();
    }
    init_property() {
        this.health = new HealthBar();
        this.buff_list = new Array<Buff>();
        this.buff_list.length = 0;
        this.skill_CD = 0;
        this.shoot_CD = 0;
        this.setCircle(30);  // collision
    }
    // NOTE: update should be explicitly called in scene update
    update(time: number, delta: number): void {
        // actions needed to be performed during time
        this.shoot_CD = Math.max(this.shoot_CD - delta, 0);
        this.skill_CD = Math.max(this.skill_CD - delta, 0);

        // update the pointer position relative to the camera,
        // in case the pointer is not moving and we get old screen position
        this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main);
        const ori = this.get_orient();
        // calculate the angle
        const player_angle = Phaser.Math.Angle.Between(0, 0, ori.x, ori.y);
        // rotation angle, but between angle has a difference of 90 deg, due to different start direction
        this.setRotation(player_angle + Phaser.Math.DegToRad(90));
    }

    get_orient(): Phaser.Math.Vector2 {
        const x = this.scene.input.activePointer.worldX - this.x;
        const y = this.scene.input.activePointer.worldY - this.y;
        return new Phaser.Math.Vector2(x, y).normalize();
    }
};
