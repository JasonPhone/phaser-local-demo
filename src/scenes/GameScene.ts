import Phaser, { Physics, Scenes } from "phaser";
import { KeyState, PlayerInfo, RoleType, CommandType, Command } from "../types/common";
import Player from "../obj/Player";
import Bullet from "../obj/Bullet";
import ServerSocket from "../obj/ServerSocket";

import pngPlayerADC from "../assets/adc_body.png";
import pngPlayerSUP from "../assets/sup_body.png";
import pngPlayerTNK from "../assets/tank_body.png";
import pngStar from "../assets/star.png";
import pngBomb from "../assets/bomb.png";
import jsonDefaultMap from "../assets/maps/map_default.json";
import jsonMapTileSet from "../assets/maps/tileset_map.json";
import pngTileSetImg from "../assets/wall_bricks.png";
import pngDude from "../assets/dude.png"
import pngFlare from "../assets/particle/flares.png";
import jsonFlare from "../assets/particle/flares.json";

export class GameScene extends Phaser.Scene {
    private teams: Phaser.Physics.Arcade.Group[];
    private player_one: Player;
    private one_info: PlayerInfo;
    private bullets: Phaser.Physics.Arcade.Group;
    private cursor_keys: Phaser.Types.Input.Keyboard.CursorKeys;
    private map_wall: Phaser.Tilemaps.TilemapLayer;
    private server: ServerSocket;
    private praticle_mngr: Phaser.GameObjects.Particles.ParticleEmitterManager;

    private input_payload = {
        left: false,
        right: false,
        up: false,
        down: false,
    };
    private keys: KeyState;
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
        this.load.atlas('flares', pngFlare, jsonFlare);
    }

    async create(data: PlayerInfo) {
        this.one_info = data;
        console.log(this.one_info);
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
        this.praticle_mngr = this.add.particles("flares");

        this.teams = new Array<Phaser.Physics.Arcade.Group>();

        this.cursor_keys = this.input.keyboard.createCursorKeys();
        this.bullets = this.physics.add.group();

        this.input.on("pointerdown", this.shoot_event, this);
        this.server.connect();
        this.init_with_server();
        this.init_keys();
    }
    init_keys() {
        this.keys = new KeyState();
        // no key is down
        this.keys.left = false;
        this.keys.right = false;
        this.keys.up = false;
        this.keys.down = false;
        this.keys.space = false;
        // listeners
        this.keys.key_left = this.input.keyboard.addKey("A");
        this.keys.key_right = this.input.keyboard.addKey("D");
        this.keys.key_up = this.input.keyboard.addKey("W");
        this.keys.key_down = this.input.keyboard.addKey("S");
        this.keys.key_space = this.input.keyboard.addKey("SPACE");
    }
    init_with_server() {
        let player_list = this.server.get_players();
        player_list.push(this.one_info);
        player_list.forEach(player_entry => {
            if (player_entry.name === this.one_info.name) {
                this.one_info.role = player_entry.role;
                this.one_info.team = player_entry.team;
            }
            this.add_player(400, 400, player_entry.name, player_entry.role, player_entry.team);
            console.log(player_entry.name, "role:", player_entry.role, "team:", player_entry.team);
        });
        console.log("playerone:", this.player_one.info.name, "role:", this.player_one.info.role, "team:", this.player_one.info.team);
    }

    update(time: number, delta: number) {
        if (!this.player_one || this.player_one.alive === false) return;
        if (this.player_one.health.health <= 0) {
            // this player died
            this.send_msg(CommandType.KILL);
            this.cameras.main.stopFollow();
            return;
        }
        this.input.activePointer.updateWorldPoint(this.cameras.main);
        // keys event
        // left
        if (this.keys.key_left.isDown) {
            if (this.keys.left === false)
                this.send_msg(CommandType.KEYEVENT, "A", true);
            this.keys.left = true;
        } else {
            if (this.keys.left === true)
                this.send_msg(CommandType.KEYEVENT, "A", false);
            this.keys.left = false;
        }
        // right
        if (this.keys.key_right.isDown) {
            if (this.keys.right === false)
                this.send_msg(CommandType.KEYEVENT, "D", true);
            this.keys.right = true;
        } else {
            if (this.keys.right === true)
                this.send_msg(CommandType.KEYEVENT, "D", false);
            this.keys.right = false;
        }
        // up
        if (this.keys.key_up.isDown) {
            if (this.keys.up === false)
                this.send_msg(CommandType.KEYEVENT, "W", true);
            this.keys.up = true;
        } else {
            if (this.keys.up === true)
                this.send_msg(CommandType.KEYEVENT, "W", false);
            this.keys.up = false;
        }
        // down
        if (this.keys.key_down.isDown) {
            if (this.keys.down === false)
                this.send_msg(CommandType.KEYEVENT, "S", true);
            this.keys.down = true;
        } else {
            if (this.keys.down === true)
                this.send_msg(CommandType.KEYEVENT, "S", false);
            this.keys.down = false;
        }
        // space(skill), does not need "up or down"
        if (this.keys.key_space.isDown) {
            this.keys.space = true;
        } else {
            this.keys.space = false;
        }
        // movement 
        let velo = new Phaser.Math.Vector2(0, 0);
        if (this.keys.left) {
            velo.x -= 1;
        }
        if (this.keys.right) {
            velo.x += 1;
        }
        if (this.keys.up) {
            velo.y -= 1;
        }
        if (this.keys.down) {
            velo.y += 1;
        }
        velo.normalize(); // all-direction same speed
        velo.scale(200);
        this.player_one.setVelocity(velo.x, velo.y);
        // update the pointer position relative to the camera,
        // in case the pointer is not moving and we get old screen position
        const ptx = this.input.activePointer.worldX, pty = this.input.activePointer.worldY;
        this.player_one.rotate_to(ptx, pty);
        // skill
        if (this.keys.space) {
            this.player_one.skill();
        }
        // ...
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
            console.log("player", player.info.name, "in team", team, "real team", player.info.team);
            player.spawn();
            player.setCircle(30);
            this.physics.add.collider(player, this.map_wall);
            if (player.info.name === this.one_info.name) {
                this.player_one = player;
                this.player_one.name_text.setColor("#00ff00");
                this.cameras.main.startFollow(this.player_one);
            } else if (player.info.team === this.one_info.team) {
                player.name_text.setColor("#9999ff");
            } else {
                player.name_text.setColor("#ff5555");
            }
        }
    }
    send_msg(tp: CommandType, key?: string, isDn?: boolean) {
        this.input.activePointer.updateWorldPoint(this.cameras.main);
        if (tp === CommandType.KEYEVENT) {
            if (key) {
                this.server.send_msg(tp, {
                    playerIf: this.one_info,
                    key: key,
                    isDown: isDn,
                    playerPositionX: this.player_one.x,
                    playerPositionY: this.player_one.y,
                    MousePositionX: this.input.activePointer.worldX,
                    MousePositionY: this.input.activePointer.worldY
                });
            } else {
                console.error("send key command without key");
            }
        } else if (tp === CommandType.PTREVENT) {
            this.server.send_msg(tp, {
                playerIf: this.one_info,
                key: "NULL",
                isDown: false,
                playerPositionX: this.player_one.x,
                playerPositionY: this.player_one.y,
                MousePositionX: this.input.activePointer.worldX,
                MousePositionY: this.input.activePointer.worldY
            });
        } else if (tp === CommandType.SPWAN) {
            this.server.send_msg(tp, {
                playerIf: this.one_info,
                key: "NULL",
                isDown: false,
                playerPositionX: this.player_one.x,
                playerPositionY: this.player_one.y,
                MousePositionX: this.input.activePointer.worldX,
                MousePositionY: this.input.activePointer.worldY
            });
        } else if (tp === CommandType.KILL) {
            this.server.send_msg(tp, {
                playerIf: this.one_info,
                key: "NULL",
                isDown: false,
                playerPositionX: this.player_one.x,
                playerPositionY: this.player_one.y,
                MousePositionX: this.input.activePointer.worldX,
                MousePositionY: this.input.activePointer.worldY
            });
        } else {
            console.error("unknown command type", tp);
        }
    }
    shoot_event(pointer: Phaser.Input.Pointer) {
        // generate bullet
        const ptx = this.input.activePointer.worldX, pty = this.input.activePointer.worldY;
        const velo = this.player_one.get_orient(ptx, pty).scale(800);
        const pos = this.player_one.get_orient(ptx, pty).scale(30);
        const bullet = this.player_one.shoot(this.player_one.x + pos.x, this.player_one.y + pos.y);
        // test shoot CD
        if (!bullet) return;
        // send command
        this.send_msg(CommandType.PTREVENT, "LEFT", true);
        this.bullets.add(bullet, true);
        bullet.setVelocity(velo.x, velo.y);
        bullet.create_particle(this.add.particles('flares'));
        // a particle emitter
        this.physics.add.collider(bullet, this.map_wall, (bullet: Bullet, layer_wall: any) => {
            console.log("hitted wall");
            // a explode vfx
            let emitter = this.praticle_mngr.createEmitter({
                frame: ["white", "red"],
                speed: { min: -800, max: 800 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.4, end: 0.1 },
                blendMode: 'SCREEN',
                lifespan: bullet.damage <= 10 ? 100 : 200,
            });
            emitter.explode(bullet.damage, bullet.x, bullet.y);
            bullet.destroy(true);
        });
        this.teams.forEach((team, index) => {
            if (this.player_one.info.team != index) {
                // use overlap to avoid bullet pushing the hitted player
                this.physics.add.overlap(bullet, team, (bullet: Bullet, player: Player) => {
                    console.log("hitted player", player.info.name);
                    // a explode vfx
                    let emitter = this.praticle_mngr.createEmitter({
                        frame: ["white", "red"],
                        speed: { min: -800, max: 800 },
                        angle: { min: 0, max: 360 },
                        scale: { start: 0.4, end: 0.1 },
                        blendMode: 'SCREEN',
                        lifespan: bullet.damage <= 10 ? 100 : 200,
                    });
                    emitter.explode(bullet.damage, bullet.x, bullet.y);
                    player.hitted(bullet);
                    bullet.destroy(true);
                });
            }
        });
    }

};
