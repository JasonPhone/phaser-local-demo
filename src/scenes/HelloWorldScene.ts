import Phaser, { Scenes } from "phaser";
import pngPlayer from "../assets/adc_body.png";
import pngStar from "../assets/star.png";
import pngBomb from "../assets/bomb.png";
import jsonDefaultMap from "../assets/maps/map_default.json";
import jsonMapTileSet from "../assets/maps/tileset_map.json";
import pngTileSetImg from "../assets/wall_bricks.png";
import pngDude from "../assets/dude.png"
import Player from "../obj/player";
import { RoleType } from "../types/common";

export class HelloWorldScene extends Phaser.Scene {
    private player_one: Player;
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
    // TODO: just like this, but init in create()
    // private keys = {
    //     left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    //     right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    //     up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    //     down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    //     space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    // }
    constructor() {
        super("hello-world");
    }

    preload() {
        this.load.image("player", pngPlayer);
        this.load.image("star", pngStar);
        this.load.image("bomb", pngBomb);
        this.load.image("dude", pngDude);
        this.load.tilemapTiledJSON("map_default", jsonDefaultMap);
        this.load.image("tileset", pngTileSetImg);
    }

    async create() {
        const texture = this.textures.get("player");
        const dmap = this.make.tilemap({ key: "map_default" });
        const tiles = dmap.addTilesetImage("tileset_map", "tileset");
        const layer_ground = dmap.createLayer("ground", tiles, 0, 0);
        const layer_wall = dmap.createLayer("wall", tiles, 0, 0);
        this.cameras.main.setBounds(0, 0, dmap.widthInPixels, dmap.heightInPixels);
        layer_wall.setCollisionByProperty({ collides: true });


        this.cursor_keys = this.input.keyboard.createCursorKeys();
        await this.connect();
        this.stars = this.physics.add.staticGroup();
        this.bullets = this.physics.add.group();
        this.stars.create(300, 300, "star");
        // add player_one
        this.player_one = new Player({ name: "jason", team: 0, role: RoleType.ADC },
            { scene: this, x: 400, y: 400, texture: "player" });
        this.player_one.spawn();
        this.player_one.setCircle(30);  // collision
        this.cameras.main.startFollow(this.player_one);
        // this.player_text = this.add.text(10, 10, "player");

        // a test player
        // const test_player = new Player({ name: "jason", team: 0, role: RoleType.ADC }, { scene: this, x: 500, y: 500, texture: "dude" });
        // test_player.spawn(new Phaser.Math.Vector2(600, 600));
        // this.input.keyboard.on("keydown-K", () => {
        //     console.log("killed");
        //     test_player.kill();
        // });
        // this.input.keyboard.on("keydown-R", () => {
        //     console.log("respawn");
        //     test_player.spawn();
        // });

        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            // fire
            const bullet = this.physics.add.sprite(this.player_one.x, this.player_one.y, "bomb");
            const velo = this.player_one.get_orient().scale(500);
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
        this.player_one.update(time, delta);
        // this.input.keyboard.checkDown(this.keys.down);
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

    }
};
