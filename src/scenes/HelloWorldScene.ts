import Phaser, { Scenes } from "phaser";
import assetPlayer from "../assets/adc_body.png";
import assetStar from "../assets/star.png";
import assetBomb from "../assets/bomb.png";
import assetDefaultMap from "../assets/maps/map_default.json";
import assetMapTileSet from "../assets/maps/tileset_map.json";
import assetTileSetImg from "../assets/wall_bricks.png";
// import Player from "~/dataobj/player";

export class HelloWorldScene extends Phaser.Scene {
    private player_one: Phaser.Physics.Arcade.Sprite;
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
        this.load.tilemapTiledJSON("map_default", assetDefaultMap);
        this.load.image("tileset", assetTileSetImg);
    }

    async create() {
        const dmap = this.make.tilemap({ key: "map_default" });
        const tiles = dmap.addTilesetImage("tileset_map", "tileset");
        const layer_ground = dmap.createLayer("ground", tiles, 0, 0);
        const layer_wall = dmap.createLayer("wall", tiles, 0, 0);
        this.cameras.main.setBounds(0, 0, dmap.widthInPixels, dmap.heightInPixels);
        layer_wall.setCollision(1);

        this.cursor_keys = this.input.keyboard.createCursorKeys();
        await this.connect();
        this.stars = this.physics.add.staticGroup();
        this.bullets = this.physics.add.group();
        this.stars.create(300, 300, "star");
        this.player_one = this.physics.add.sprite(350, 350, "player");
        this.player_one.setCircle(30);
        this.cameras.main.startFollow(this.player_one);
        this.player_text = this.add.text(10, 10, "player");
        // this.pointer_text = this.add.text(10, 30, "pointer");
        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        });
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            // fire
            const bullet = this.physics.add.sprite(this.player_one.x, this.player_one.y, "bomb");
            const velo = this.get_orient().scale(1500);
            bullet.setVelocity(velo.x, velo.y);
            bullet.setActive(true);
            bullet.setBounce(1);
            
            // this.physics.add.collider(this.stars, bullet);
            this.physics.add.collider(bullet, layer_wall, (bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, layer_wall: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
                bullet.disableBody(true, true);
            });
            // this.bullets.add(bullet, true);
            // this.bullets.setActive(true);

        });
        this.physics.add.collider(this.player_one, this.stars);
        this.physics.add.collider(this.bullets, this.stars);
        this.physics.add.collider(this.player_one, layer_wall);
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
        this.player_one.setVelocity(velo.x, velo.y);

        // update the pointer position relative to the camera,
        // in case the pointer is not moving and we get old screen position
        this.input.activePointer.updateWorldPoint(this.cameras.main);
        const ori = this.get_orient();
        // calculate the angle
        const player_angle = Phaser.Math.Angle.Between(0, 0, ori.x, ori.y);
        // this.player_text.setText(`${playerx.toFixed(1), playery.toFixed(1)} to ${pointerx.toFixed(1), pointery.toFixed(1)}: ${player_angle.toFixed(1)}`);
        // rotation angle, but between angle has a difference of 90 deg, due to different start direction
        this.player_one.setRotation(player_angle + Phaser.Math.DegToRad(90));
    }
    get_orient(): Phaser.Math.Vector2 {
        const x = this.input.activePointer.worldX - this.player_one.x;
        const y = this.input.activePointer.worldY - this.player_one.y;
        return new Phaser.Math.Vector2(x, y).normalize();
    }
};
