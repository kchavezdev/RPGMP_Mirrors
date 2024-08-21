namespace KCDev {
    export namespace Mirrors {
        export interface ICharacterDefault {
            isWallEnabled: boolean
            isFloorEnabled: boolean
        }
        export enum WallReflectMode {
            PERSPECTIVE = 1,
            EVENT = 2
        }
        export class PluginParameters {
            static zValue: number = -1
            static wallReflectType: WallReflectMode = WallReflectMode.PERSPECTIVE
            static wallReflectVar: number = 0
            static actorDefault: ICharacterDefault = {isWallEnabled: true, isFloorEnabled: true}
            static eventDefault: ICharacterDefault = {isWallEnabled: false, isFloorEnabled: false}
            static isPerspectiveYsortEnabled: boolean = false
        }
    }
}

