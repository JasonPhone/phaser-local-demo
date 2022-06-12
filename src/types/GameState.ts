// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 1.0.34
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { PlayerInfo } from './PlayerInfo'

export class GameState extends Schema {
    @type("number") public roomstate!: number;
    @type("number") public activePlayerNumber!: number;
    @type({ set: PlayerInfo }) public players: SetSchema<PlayerInfo> = new SetSchema<PlayerInfo>();
}
