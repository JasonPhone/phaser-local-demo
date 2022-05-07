import Phaser, { Scenes } from "phaser";
import assetPlayer from "../assets/adc_body.png";
import assetStar from "../assets/star.png";
import assetBomb from "../assets/bomb.png"
// import Player from "~/dataobj/player";

export class HelloWorldScene extends Phaser.Scene {
    private current_player: Phaser.Physics.Arcade.Sprite;
    private bullets: Phaser.Physics.Arcade.Group;
    private stars: Phaser.Physics.Arcade.StaticGroup;
    private cursor_keys: Phaser.Types.Input.Keyboard.CursorKeys;
    private player_text: Phaser.GameObjects.Text;
    private pointer_text: Phaser.GameObjects.Text;
    private input_payload = {
        left: false,
        right: false,
        up: false,
        down: false,
    };
    constructor() {
        super("hello-world");
    }

    preload() {
        this.load.image("player", assetPlayer);
        this.load.image("star", assetStar);
        this.load.image("bomb", assetBomb);
    }

    async create() {
        this.cursor_keys = this.input.keyboard.createCursorKeys();
        await this.connect();
        this.stars = this.physics.add.staticGroup();
        this.bullets = this.physics.add.group();
        this.stars.create(100, 100, "star");
        this.current_player = this.physics.add.sprite(0, 0, "player");
        this.current_player.setCircle(30);
        this.cameras.main.startFollow(this.current_player);
        this.player_text = this.add.text(10, 10, "player");
        // this.pointer_text = this.add.text(10, 30, "pointer");
        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        });
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            // fire
            const bullet = this.physics.add.sprite(this.current_player.x, this.current_player.y, "bomb");
            const velo = this.get_orient().scale(1000);
            bullet.setVelocity(velo.x, velo.y);
            bullet.setActive(true);
            this.bullets.add(bullet, true);
            this.bullets.setActive(true);
            
        });
        this.physics.add.collider(this.current_player, this.stars);
        this.physics.add.collider(this.bullets, this.stars);
    }

    async connect() {

    }
    update(time: number, delta: number) {
        this.input_payload.left = this.cursor_keys.left.isDown;
        this.input_payload.right = this.cursor_keys.right.isDown;
        this.input_payload.up = this.cursor_keys.up.isDown;
        this.input_payload.down = this.cursor_keys.down.isDown;
        // TODO: send payload to server

        let velo = new Phaser.Math.Vector2(0, 0);
        if (this.input_payload.left) {
            velo.x -= 1;
        }
        if (this.input_payload.right) {
            velo.x += 1;
        }
        if (this.input_payload.up) {
            velo.y -= 1;
        }
        if (this.input_payload.down) {
            velo.y += 1;
        }
        velo.normalize(); // all-direction same speed
        velo.scale(200);
        this.current_player.setVelocity(velo.x, velo.y);

        // update the pointer position relative to the camera,
        // in case the pointer is not moving and we get old screen position
        this.input.activePointer.updateWorldPoint(this.cameras.main);
        const ori = this.get_orient();
        // const playerx = this.current_player.x;
        // const playery = this.current_player.y;
        // const pointerx = this.input.activePointer.worldX;
        // const pointery = this.input.activePointer.worldY;
        // calculate the angle
        const player_angle = Phaser.Math.Angle.Between(0, 0, ori.x, ori.y);
        // this.player_text.setText(`${playerx.toFixed(1), playery.toFixed(1)} to ${pointerx.toFixed(1), pointery.toFixed(1)}: ${player_angle.toFixed(1)}`);
        // rotation angle, but between angle has a difference of 90 deg, due to different start direction
        this.current_player.setRotation(player_angle + Phaser.Math.DegToRad(90));
    }
    get_orient(): Phaser.Math.Vector2 {
        const x = this.input.activePointer.worldX - this.current_player.x;
        const y = this.input.activePointer.worldY - this.current_player.y;
        return new Phaser.Math.Vector2(x, y).normalize();
    }
};
