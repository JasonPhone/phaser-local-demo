export enum RoleType {
    NULL, //  = "NULL",
    ADC, // = "ADC",
    SUP, // = "SUP",
    TNK, // = "TNK"
}

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
