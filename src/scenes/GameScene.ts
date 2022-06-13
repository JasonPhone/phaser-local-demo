import Phaser, { Physics, Scenes } from "phaser";
import { KeyInput, PlayerInfo, RoleType, CommandType, Command } from "../types/common";
import { GameState } from "../types/GameState";
import Player from "../obj/Player";
import Bullet from "../obj/Bullet";
import ServerSocket from "../obj/ServerSocket";

import pngPlayerADC from "../assets/adc_body.png";
import pngPlayerSUP from "../assets/sup_body.png";
import pngPlayerTNK from "../assets/tank_body.png";
import pngStar from "../assets/star.png";
import pngBomb from "../assets/bomb.png";
import jsonDefaultMap from "../assets/maps/map_small.json";
// import jsonMapTileSet from "../assets/maps/tileset_map.json";
import pngTileSetImg from "../assets/wall_bricks.png";
import pngDude from "../assets/dude.png"
import pngFlare from "../assets/particle/flares.png";
import jsonFlare from "../assets/particle/flares.json";

export class GameScene extends Phaser.Scene {
    private teams: Map<number, Phaser.Physics.Arcade.Group>;
    private player_one: Player;
    private players: Map<string, Player>;
    private one_info: PlayerInfo;
    private bullets: Phaser.Physics.Arcade.Group;
    private cursor_keys: Phaser.Types.Input.Keyboard.CursorKeys;
    private map_wall: Phaser.Tilemaps.TilemapLayer;
    private server: ServerSocket;
    private praticle_mngr: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private start: boolean = false;
    private start_time: number = 999999999999;
    private key_input: KeyInput;
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

    async create(info: PlayerInfo) {
        this.one_info = info;
        console.log("GameScene::create: got info name:", this.one_info.name, ", team:", this.one_info.team, ", role:", this.one_info.role);
        /****** server messages ******/
        this.server = new ServerSocket("ws://localhost:2567", "game-server");
        await this.server.connect();
        console.log("GameScene::create: server connected");
        /****** visual ******/
        const dmap = this.make.tilemap({ key: "map_default" });
        const tiles = dmap.addTilesetImage("tileset_map", "tileset", 30, 30, 1, 2);
        const layer_ground = dmap.createLayer("ground", tiles, 0, 0);
        this.map_wall = dmap.createLayer("wall", tiles, 0, 0);
        this.map_wall.setCollisionByProperty({ collides: true });
        this.cameras.main.setBounds(0, 0, dmap.widthInPixels, dmap.heightInPixels);
        this.cameras.main.roundPixels = true;

        this.cameras.main.zoom = 0.8;
        this.praticle_mngr = this.add.particles("flares");
        this.physics.world.fixedStep = false;  // or the health bar will glitch
        console.log("GameScene::create: vfx done");

        /****** logic ******/
        this.teams = new Map<number, Phaser.Physics.Arcade.Group>();
        this.players = new Map<string, Player>();

        this.cursor_keys = this.input.keyboard.createCursorKeys();
        this.bullets = this.physics.add.group();

        this.input.on("pointerdown", () => {
            this.send_msg(CommandType.PTREVENT, "LEFT", true);
            this.input.activePointer.updateWorldPoint(this.cameras.main);
            this.shoot_event(this.player_one, this.input.activePointer.worldX, this.input.activePointer.worldY);
        }, this);
        this.input.on("pointermove", () => {
            this.send_msg(CommandType.PTREVENT, "MOVE", true);
        }, this);
        console.log("GameScene::create: logic done");
        this.init_with_server();
        console.log("GameScene::create: init with server done");
        this.init_keys();
        console.log("GameScene::create: init keys done");
        // spawn player_one
        this.send_msg(CommandType.SPAWN);
        // UI scene
        this.scene.launch("UIScene", {player: this.player_one});
        this.scene.bringToTop("UISCene");
    }
    init_keys() {
        this.key_input = new KeyInput();
        // listeners
        this.key_input.key_left = this.input.keyboard.addKey("A");
        this.key_input.key_right = this.input.keyboard.addKey("D");
        this.key_input.key_up = this.input.keyboard.addKey("W");
        this.key_input.key_down = this.input.keyboard.addKey("S");
        this.key_input.key_space = this.input.keyboard.addKey("SPACE");
    }
    init_with_server() {
        let player_list = this.server.get_players();
        player_list.push(this.one_info);
        player_list.forEach(player_entry => {
            if (player_entry.name === this.one_info.name) {
                this.one_info.role = player_entry.role;
                this.one_info.team = player_entry.team;
            }
            const plr = this.add_player(400, 400, player_entry.name, player_entry.role, player_entry.team);
            this.players.set(player_entry.name, plr);
            console.log(player_entry.name, "role:", player_entry.role, "team:", player_entry.team);
        });
        // messages
        this.server.room.onMessage("start-game", (msg) => {
            console.log("game now start!");
            // this.start = true;
            this.start_time = this.time.now;
        });
        this.server.room.onMessage(CommandType.KEYEVENT, (msg: Command) => this.process_key_msg(msg));
        this.server.room.onMessage(CommandType.PTREVENT, (msg: Command) => this.process_ptr_msg(msg));
        this.server.room.onMessage(CommandType.KILL, (msg: Command) => this.process_kill_msg(msg));
        this.server.room.onMessage(CommandType.SPAWN, (msg: Command) => this.process_spawn_msg(msg));
        // state updates
        this.server.room.onStateChange.once(
            (state: GameState) => this.process_state_changed(state)
        );
        this.server.room.onStateChange(
            (state: GameState) => this.process_state_changed(state)
        );
    }
    process_state_changed(state: GameState) {
        const plrs = state.players;
        plrs.forEach((plr: PlayerInfo) => {
            if (!this.players.has(plr.name)) {
                console.log("GameScene::process_state_changed:", plr.name, plr.team, plr.role, "joined");
                this.add_player(400, 400, plr.name, plr.role, plr.team);
            }
        });
    }
    process_key_msg(msg: Command) {
        if (this.start === false) return;
        if (msg.playerIf.name === this.one_info.name) return;
        if (this.players.has(msg.playerIf.name) === false) return;
        console.log("keyevent", msg.playerIf.name, msg.key);
        const plr = this.players.get(msg.playerIf.name);
        let velo = new Phaser.Math.Vector2(plr.body.velocity.x, plr.body.velocity.y);
        velo.normalize();
        if (msg.key === "W") {
            plr.keys.up = msg.isDown;
        } else if (msg.key === "A") {
            plr.keys.left = msg.isDown;
        } else if (msg.key === "S") {
            plr.keys.down = msg.isDown;
        } else if (msg.key === "D") {
            plr.keys.right = msg.isDown;
        } else if (msg.key === "SPACE") {
            plr.keys.space = msg.isDown;
        } else {
            console.error("unkonwn key in keyevent", msg.key);
        }
        plr.set_velo(velo.x, velo.y);
    }
    process_spawn_msg(msg: Command) {
        if (this.start === false) return;
        if (msg.playerIf.name === this.one_info.name) return;
        if (this.players.has(msg.playerIf.name)) {
            console.log("player", msg.playerIf.name, "respawned");
            const plr = this.players.get(msg.playerIf.name);
            plr.setPosition(msg.playerPositionX, msg.playerPositionY);
            plr.rotate_to(msg.MousePositionX, msg.MousePositionY);
        } else {
            console.log("GameScene::process_spawn_msg: new player", msg.playerIf.name, "added");
            console.log(this);
            const plr = this.add_player(400, 400, msg.playerIf.name, msg.playerIf.role, msg.playerIf.team);
            this.players.set(msg.playerIf.name, plr);
        }
    }
    process_ptr_msg(msg: Command) {
        if (this.start === false) return;
        if (msg.playerIf.name === this.one_info.name) return;
        if (this.players.has(msg.playerIf.name) === false) return;
        // console.log("ptrevent", msg.playerIf.name, msg.key);
        const plr = this.players.get(msg.playerIf.name);
        if (msg.key === "LEFT") {
            // console.log("player", msg.playerIf.name, "shoot");
            this.shoot_event(plr, msg.MousePositionX, msg.MousePositionY);
        } else if (msg.key === "MOVE") {
            // console.log("player", msg.playerIf.name, "move");
            plr.rotate_to(msg.MousePositionX, msg.MousePositionY);
        } else {
            console.error("unkonwn key in ptrevent", msg.key);
        }
    }
    process_kill_msg(msg: Command) {
        if (this.start === false) return;
        if (this.players.has(msg.playerIf.name) === false) return;
        console.log(msg.playerIf.name, "died");
        const plr = this.players.get(msg.playerIf.name);
        plr.kill();
        this.players.delete(msg.playerIf.name);
    }
    update_keys() {
        this.input.activePointer.updateWorldPoint(this.cameras.main);
        // keys event
        // left
        if (this.key_input.key_left.isDown) {
            if (this.player_one.keys.left === false)
                this.send_msg(CommandType.KEYEVENT, "A", true);
            this.player_one.keys.left = true;
        } else {
            if (this.player_one.keys.left === true)
                this.send_msg(CommandType.KEYEVENT, "A", false);
            this.player_one.keys.left = false;
        }
        // right
        if (this.key_input.key_right.isDown) {
            if (this.player_one.keys.right === false)
                this.send_msg(CommandType.KEYEVENT, "D", true);
            this.player_one.keys.right = true;
        } else {
            if (this.player_one.keys.right === true)
                this.send_msg(CommandType.KEYEVENT, "D", false);
            this.player_one.keys.right = false;
        }
        // up
        if (this.key_input.key_up.isDown) {
            if (this.player_one.keys.up === false)
                this.send_msg(CommandType.KEYEVENT, "W", true);
            this.player_one.keys.up = true;
        } else {
            if (this.player_one.keys.up === true)
                this.send_msg(CommandType.KEYEVENT, "W", false);
            this.player_one.keys.up = false;
        }
        // down
        if (this.key_input.key_down.isDown) {
            if (this.player_one.keys.down === false)
                this.send_msg(CommandType.KEYEVENT, "S", true);
            this.player_one.keys.down = true;
        } else {
            if (this.player_one.keys.down === true)
                this.send_msg(CommandType.KEYEVENT, "S", false);
            this.player_one.keys.down = false;
        }
        // space(skill)
        if (this.key_input.key_space.isDown) {
            if (this.player_one.keys.space === false)
                this.send_msg(CommandType.KEYEVENT, "SPACE", true);
            this.player_one.keys.space = true;
        } else {
            if (this.player_one.keys.space === true)
                this.send_msg(CommandType.KEYEVENT, "SPACE", false);
            this.player_one.keys.space = false;
        }
    }
    update(time: number, delta: number) {
        if (time - this.start_time < 3000) return;
        else this.start = true;
        if (!this.player_one) return;
        if (this.player_one.alive === false) {
            // this player died 
            this.send_msg(CommandType.KILL);
            this.players.delete(this.one_info.name);
            this.cameras.main.stopFollow();
            this.start = false;
        }
        const st = new Set<number>();
        this.players.forEach((plr: Player) => {
            st.add(plr.info.team);
        });
        let team_count = st.size;
        if (team_count === 1) {
            this.scene.start("EndScene", { name: this.one_info.name, win: st.has(this.one_info.team) });
        }
        // movement and skill is done in each player's update()
        this.update_keys();
        // update the pointer position relative to the camera,
        // in case the pointer is not moving and we get old screen position
        const ptx = this.input.activePointer.worldX;
        const pty = this.input.activePointer.worldY;
        this.player_one.rotate_to(ptx, pty);
    }
    /**
     * add a player to the scene
     * @param name player's username
     * @param role player's role
     * @param team team number
     */
    add_player(
        x: number, y: number,
        name: string, role: RoleType, team: number) {
        if (team < 0 || team > 20) {
            console.error(`GameScene::add_player: invalid team id ${team}`);
        } else {
            if (team === 0) {
                x = 900;
                y = 300;
            } else if (team === 1) {
                x = 900;
                y = 1500;
            }
            let player: Player;
            // set texture
            switch (role) {
                case RoleType.ADC:
                    player = new Player(
                        { name: name, role: role, team: team },
                        { scene: this, x: x, y: y, texture: "playerADC" });
                    break;
                case RoleType.SUP:
                    player = new Player(
                        { name: name, role: role, team: team },
                        { scene: this, x: x, y: y, texture: "playerSUP" });
                    break;
                case RoleType.TNK:
                    player = new Player(
                        { name: name, role: role, team: team },
                        { scene: this, x: x, y: y, texture: "playerTNK" });
                    break;
                default:
                    player = new Player(
                        { name: name, role: role, team: team },
                        { scene: this, x: x, y: y, texture: "dude" });
            }
            // generate player particle
            player.create_particle(this.add.particles("flares"));
            // which team to add this player
            if (this.teams.has(team)) {
                const tm = this.teams.get(team);
                tm.add(player);
            } else {
                const tm = this.physics.add.group();
                tm.add(player);
                tm.runChildUpdate = true;
                this.teams.set(team, tm);
            }
            this.players.set(player.info.name, player);
            // console.log("player", player.info.name, "in team", team, "real team", player.info.team);
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
            return player;
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
                key: key,
                isDown: isDn,
                playerPositionX: this.player_one.x,
                playerPositionY: this.player_one.y,
                MousePositionX: this.input.activePointer.worldX,
                MousePositionY: this.input.activePointer.worldY
            });
        } else if (tp === CommandType.SPAWN) {
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
    shoot_event(shooter: Player, x: number, y: number) {
        if (this.start === false) return;
        // generate bullet
        const ptx = x, pty = y;
        const pos = shooter.get_orient(ptx, pty).scale(30);
        const bullet = shooter.shoot(shooter.x + pos.x, shooter.y + pos.y);
        if (!bullet) return;
        // send command
        this.bullets.add(bullet, true);
        let velo: Phaser.Math.Vector2;
        if (bullet.damage > 30) {
            bullet.setScale(1.5);
            velo = shooter.get_orient(ptx, pty).scale(400);
            bullet.setVelocity(velo.x, velo.y);
        } else {
            velo = shooter.get_orient(ptx, pty).scale(600);
            bullet.setVelocity(velo.x, velo.y);
        }
        bullet.create_particle(this.add.particles("flares"));
        // a particle emitter
        this.physics.add.collider(bullet, this.map_wall, (bullet: Bullet, layer_wall: any) => {
            // console.log("hitted wall");
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
            if (shooter.info.team != index) {
                // use overlap to avoid bullet pushing the hitted player
                this.physics.add.overlap(bullet, team, (bullet: Bullet, player: Player) => {
                    // console.log("hitted player", player.info.name);
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
