export class PlayerInfo {
    public name: string = "";
    public team: number = -1;
    public role: RoleType = RoleType.NULL;
}
export class HealthBar {
    private current: number = 100;
    private max_health: number = 100;
    private shield: number = 0;
    constructor() {

    }
    gain(v: number) {

    }
    lose(v: number) {

    }   
    buff(v: number) {

    }
}
export enum RoleType {
    NULL,
    ADC,
    SUP,
    TANK
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
