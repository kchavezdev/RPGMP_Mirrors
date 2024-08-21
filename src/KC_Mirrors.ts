import * as rmmz from 'rmmz-types';

import { Game_CharacterBase } from "rmmz-types"

declare module 'rmmz-types' {
    interface Game_CharacterBase {
        _reflectionProperties: { wall: $.IReflectionProperties, floor: $.IReflectionProperties }
    }
}

// ensure namespace object is in global scope
declare global {
    var KCDev: any
}
window.KCDev = window.KCDev || {};

namespace KCDev {
    export namespace Mirrors {
        export interface IReflectionProperties {
            /** File name of the character graphic. */
            name?: string
            /** Index of the character graphic. Starts at 0. */
            index?: number
            /** Opacity of the graphic, ranges from 0-255 */
            opacity?: number
            /** Offset in pixels of this reflection. */
            offset: { x: number, y: number }
            /** Angle offset of this reflection in degrees. */
            angle: number
        }
        export interface ICharacterDefault {
            isWallEnabled: boolean
            isFloorEnabled: boolean
        }
        export enum WallReflectMode {
            PERSPECTIVE = 1,
            EVENT = 2
        }
        export abstract class PluginParameters {
            static zValue: number = -1
            static wallReflectType: WallReflectMode = WallReflectMode.PERSPECTIVE
            static wallReflectVar: number = 0
            static actorDefault: ICharacterDefault = { isWallEnabled: true, isFloorEnabled: true }
            static eventDefault: ICharacterDefault = { isWallEnabled: false, isFloorEnabled: false }
            static isPerspectiveYsortEnabled: boolean = false
        }
        export abstract class Aliases {
            static Game_CharacterBase_prototype_update = Game_CharacterBase.prototype.update
        }
    }
}

import $ = KCDev.Mirrors;

Game_CharacterBase.prototype.update = function (this: Game_CharacterBase) {
    $.Aliases.Game_CharacterBase_prototype_update.apply(this, arguments);
};
