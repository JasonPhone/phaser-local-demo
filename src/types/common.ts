export class PlayerInfo {
    public name: string = "";
    public team: number = -1;
    public role: RoleType = RoleType.NULL;
}
export enum RoleType {
    NULL,
    ADC,
    SUP,
    TNK
}
export enum BuffType {
    NULL,
    RECOVER,
    SHIELD
}
export class Buff {
    public buff_tpye: BuffType = BuffType.NULL;
    public base_val: number = 10;
    constructor(tp: BuffType, val: number) {
        this.buff_tpye = tp;
        this.base_val = val;
    }
}

export class Command {
    playerId: string;
    key: string;
    isDown: boolean;
    playerPositionX: number;
    playerPositionY: number;
    MousePositionX: number;
    MousePositionY: number;
}
export enum CommandType {
    KEYEVENT= "keyevent",
    PTREVENT= "pointerevent",
    SPWAN = "spawn",
    KILL = "kill"
}

export class KeyState {
    left: boolean;
    key_left: Phaser.Input.Keyboard.Key;
    right: boolean;
    key_right: Phaser.Input.Keyboard.Key;
    up: boolean;
    key_up: Phaser.Input.Keyboard.Key;
    down: boolean;
    key_down: Phaser.Input.Keyboard.Key;
    space: boolean;
    key_space: Phaser.Input.Keyboard.Key;
}

