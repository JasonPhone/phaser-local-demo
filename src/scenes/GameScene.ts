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
import Player from "../obj/Player";
import { PlayerInfo, RoleType } from "../types/common";
import Bullet from "../obj/Bullet";
import ServerSocket from "../obj/ServerSocket";

export class GameScene extends Phaser.Scene {
    private teams: Phaser.Physics.Arcade.Group[];
    private player_one: Player;
    private one_info: PlayerInfo;
    private bullets: Phaser.Physics.Arcade.Group;
    private cursor_keys: Phaser.Types.Input.Keyboard.CursorKeys;
    private map_wall: Phaser.Tilemaps.TilemapLayer;
    private server: ServerSocket;

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

    async create(data: PlayerInfo) {
        this.one_info = data;
        this.server = new ServerSocket("", "");

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
        this.bullets = this.physics.add.group();

        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            // fire
            const bullet = new Bullet(
                { damage: 10, source: this.player_one.name },
                { scene: this, x: this.player_one.x, y: this.player_one.y, texture: "bomb" }
            );
            this.bullets.add(bullet, true);
            const ptx = this.input.activePointer.worldX, pty = this.input.activePointer.worldY;
            const velo = this.player_one.get_orient(ptx, pty).scale(500);
            bullet.setVelocity(velo.x, velo.y);

            // this.physics.add.collider(this.stars, bullet);
            this.physics.add.collider(bullet, this.map_wall, (bullet: Bullet, layer_wall: any) => {
                console.log("hitted wall");
                bullet.destroy(true);
            });
            this.teams.forEach((team, index) => {
                if (this.player_one.team != index) {
                    // use overlap to avoid bullet pushing the hitted player
                    this.physics.add.overlap(bullet, team, (bullet: Bullet, player: Player) => {
                        console.log("hitted player");
                        player.hitted(bullet);
                        bullet.destroy(true);
                    });
                }
            });
            // this.bullets.setActive(true);
        });

        this.server.connect();
        this.init_with_server();
    }

    init_with_server() {
        let player_list = this.server.get_players();
        player_list.push(this.one_info);
        player_list.forEach(player => {
            this.one_info.role = player.role;
            this.one_info.team = player.team;
            this.add_player(100, 100, player.name, player.role, player.team);
        });
    }

    update(time: number, delta: number) {
        if (!this.player_one) return;
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
     */
    add_player(x: number, y: number, name: string, role: RoleType, team: number) {
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
            const player = new Player({ name: name, role: role, team: team }, { scene: this, x: x, y: y, texture: texture });
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
            if (player.name === this.one_info.name) {
                this.player_one = player;
                this.player_one.name_text.setColor("#00ff00");
                this.cameras.main.startFollow(this.player_one);
            } else if (player.team === this.one_info.team) {
                player.name_text.setColor("#9999ff");
            } else {
                player.name_text.setColor("#ff5555");
            }
        }
    }
};
