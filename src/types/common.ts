export enum RoleType {
    NULL, //  = "NULL",
    ADC, // = "ADC",
    SUP, // = "SUP",
    TNK, // = "TNK"
}
// export enum BuffType {
//     NULL,
//     RECOVER,
//     SHIELD
// }
// export class Buff {
//     public buff_tpye: BuffType = BuffType.NULL;
//     public base_val: number = 10;
//     constructor(tp: BuffType, val: number) {
//         this.buff_tpye = tp;
//         this.base_val = val;
//     }
// }

export class PlayerInfo {
    public name: string = "";
    public team: number = -1;
    public role: RoleType = RoleType.NULL;
}
export class Command {
    playerIf: PlayerInfo;
    key: string;
    isDown: boolean;
    playerPositionX: number;
    playerPositionY: number;
    MousePositionX: number;
    MousePositionY: number;
}
export enum CommandType {
    KEYEVENT = "keyevent",
    PTREVENT = "pointerevent",
    SPAWN = "spawn",
    KILL = "kill"
}

export class KeyInput {
    key_left: Phaser.Input.Keyboard.Key;
    key_right: Phaser.Input.Keyboard.Key;
    key_up: Phaser.Input.Keyboard.Key;
    key_down: Phaser.Input.Keyboard.Key;
    key_space: Phaser.Input.Keyboard.Key;
}
