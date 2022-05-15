// export class PlayerInfo {
//     public name: string = "";
//     public team: number = -1;
//     public role: RoleType = RoleType.NULL;
// }
export class HealthBar {
    private cur_health: number = 100;
    private max_health: number = 100;
    private shield_val: number = 0;
    constructor() {

    }
    gain(v: number) {
        this.cur_health = Math.min(this.cur_health + v, this.max_health);
    }
    lose(v: number) {
        if (v > this.shield_val) {
            v -= this.shield_val;
            this.shield_val = 0;
            this.cur_health = Math.max(0, this.cur_health - v);
        } else {
            this.shield_val -= v;
        }
    }
    buff(v: number) {
        this.shield_val += v;
    }
    get health() { return this.cur_health; }
    get maximum() { return this.max_health; }
    get shield() { return this.shield_val; }
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
