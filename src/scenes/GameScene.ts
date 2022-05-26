import Phaser, { Physics, Scenes } from "phaser";
import pngPlayerADC from "../assets/adc_body.png";
import pngPlayerSUP from "../assets/sup_body.png";
import pngPlayerTNK from "../assets/tank_body.png";
import pngStar from "../assets/star.png";
import pngBomb from "../assets/bomb.png";
import jsonDefaultMap from "../assets/maps/map_default.json";
import jsonMapTileSet from "../assets/maps/tileset_map.json";
import pngTileSetImg from "../assets/wall_bricks.png";
import pngDude from "../assets/dude.png"
import Player from "../obj/player";
import { RoleType } from "../types/common";
import Bullet from "../obj/bullet";

export class GameScene extends Phaser.Scene {
    private teams: Phaser.Physics.Arcade.Group[];
    private player_one: Player;
    private bullets: Phaser.Physics.Arcade.Group;
    private stars: Phaser.Physics.Arcade.StaticGroup;
    private cursor_keys: Phaser.Types.Input.Keyboard.CursorKeys;
    private player_text: Phaser.GameObjects.Text;
    private pointer_text: Phaser.GameObjects.Text;
    private map_wall: Phaser.Tilemaps.TilemapLayer;

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
        super({
            key: "GameScene"
        });
    }

    preload() {
        this.load.image("playerADC", pngPlayerADC);
        this.load.image("playerSUP", pngPlayerSUP);
        this.load.image("playerTNK", pngPlayerTNK);
        this.load.image("star", pngStar);
        this.load.image("bomb", pngBomb);
        this.load.image("dude", pngDude);
        this.load.tilemapTiledJSON("map_default", jsonDefaultMap);
        this.load.image("tileset", pngTileSetImg);
    }

    async create() {
        this.physics.world.fixedStep = false;  // or the health bar will glitch
        const dmap = this.make.tilemap({ key: "map_default" });
        const tiles = dmap.addTilesetImage("tileset_map", "tileset", 30, 30, 1, 2);
        const layer_ground = dmap.createLayer("ground", tiles, 0, 0);
        this.map_wall = dmap.createLayer("wall", tiles, 0, 0);
        this.cameras.main.setBounds(0, 0, dmap.widthInPixels, dmap.heightInPixels);
        this.cameras.main.roundPixels = true;
        this.map_wall.setCollisionByProperty({ collides: true });

        this.cameras.main.zoom = 0.8;

        this.teams = new Array<Phaser.Physics.Arcade.Group>();

        this.cursor_keys = this.input.keyboard.createCursorKeys();
        await this.connect();
        this.stars = this.physics.add.staticGroup();
        this.bullets = this.physics.add.group();
        this.stars.create(500, 500, "star");

        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            // fire
            const bullet = this.physics.add.sprite(this.player_one.x, this.player_one.y, "bomb");
            const ptx = this.input.activePointer.worldX, pty = this.input.activePointer.worldY;
            const velo = this.player_one.get_orient(ptx, pty).scale(500);
            bullet.setVelocity(velo.x, velo.y);
            bullet.setActive(true);
            bullet.setBounce(1);
            // this.physics.add.collider(this.stars, bullet);
            this.physics.add.collider(bullet, this.map_wall, (bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, layer_wall: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
                console.log("hitted wall");
                bullet.destroy(true);
            });
            this.teams.forEach((team, index) => {
                if (this.player_one.team != index) {
                    // use overlap to avoid bullet pushing the hitted player
                    this.physics.add.overlap(bullet, team, (bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, player: Player) => {
                        console.log("hitted player");
                        player.hitted(new Bullet(this, player.x, player.y, "bomb")); 
                        bullet.destroy(true);
                        // player.setVelocity(0, 0);
                    });
                }
            });
            // this.bullets.add(bullet, true);
            // this.bullets.setActive(true);
        });

        this.add_player("jason", RoleType.ADC, 0, true);
        this.add_player("test", RoleType.TNK, 1, false);
    }

    async connect() {

    }
    update(time: number, delta: number) {
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

        // update the pointer position relative to the camera,
        // in case the pointer is not moving and we get old screen position
        this.input.activePointer.updateWorldPoint(this.cameras.main);
        const ptx = this.input.activePointer.worldX, pty = this.input.activePointer.worldY;
        this.player_one.rotate_to(ptx, pty);
    }
    /**
     * add a player to the scene
     * @param name player's username
     * @param role player's role
     * @param team team number
     * @param is_local whether this player is the (only one) local player
     */
    add_player(name: string, role: RoleType, team: number, is_local: boolean) {
        if (team < 0 || team > 20) {
            console.error(`GameScene::add_player: invalid team id ${team}`);
        } else {
            // set texture
            let texture = "dude";
            switch (role) {
                case RoleType.ADC:
                    texture = "playerADC";
                    break;
                case RoleType.SUP:
                    texture = "playerSUP";
                    break;
                case RoleType.TNK:
                    texture = "playerTNK";
                    break;
                default:
                    texture = "dude";
            }
            // generate player
            const player = new Player({ name: name, role: role, team: team }, { scene: this, x: 400, y: 400, texture: texture });
            // which team to add this player
            while (this.teams.length <= team) {
                const tm = this.physics.add.group();
                tm.runChildUpdate = true;
                this.teams.push(tm);
            }
            this.teams[team].add(player);
            player.spawn();
            player.setCircle(30);
            this.physics.add.collider(player, this.map_wall);
            if (is_local) {
                this.player_one = player;
                this.cameras.main.startFollow(this.player_one);
            }
        }
    }
};
