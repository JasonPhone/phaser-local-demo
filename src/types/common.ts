// export class PlayerInfo {
//     public name: string = "";
//     public team: number = -1;
//     public role: RoleType = RoleType.NULL;
// }
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
