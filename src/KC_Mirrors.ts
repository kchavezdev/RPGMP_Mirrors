import { $gameMap, Game_CharacterBase } from "rmmz-types"

declare module 'rmmz-types' {
    interface Game_CharacterBase {
        _reflectionProperties: { wall: $.IReflectionProperties, floor: $.IReflectionProperties }
    }
}

// ensure namespace object is in global scope
declare global {
    var KCDev: any
    var Imported: any
}
window.KCDev = window.KCDev || {};
Imported = Imported || {};
Imported.KC_Mirrors = true;

namespace KCDev {
    export namespace Mirrors {
        export interface IReflectionProperties {
            /** Opacity of the graphic, ranges from 0-255 */
            opacity?: number
            /** Offset in pixels of this reflection. */
            offset: {x: number, y: number}
            /** Angle offset of this reflection in degrees. */
            angle: number,
            /** Whether this reflection is visible. */
            visible: boolean
        }
        export interface ICharacterReflectionProperties extends IReflectionProperties {
            /** File name of the character graphic. */
            name?: string
            /** Index of the character graphic. Starts at 0. */
            index?: number
            /** Whether the reflection sprite needs to be refreshed */
            needsRefresh: boolean
        }
        export interface ICharacterDefault {
            isWallEnabled: boolean
            isFloorEnabled: boolean
        }
        export enum WallReflectMode {
            PERSPECTIVE = 1,
            EVENT = 2
        }
        export var PluginParameters = {
            zValue: -1,
            wallReflectType: WallReflectMode.PERSPECTIVE,
            wallReflectVar: 0,
            actorDefault: { isWallEnabled: true, isFloorEnabled: true } as ICharacterDefault,
            eventDefault: { isWallEnabled: false, isFloorEnabled: false } as ICharacterDefault,
            isPerspectiveYsortEnabled: false
        }

        /**
         * Provides speedy lookups for wall regions by pre-emptively computing
         * the closest wall region for every tile on the map.
         */
        export class WallReflectionHelper {

            private _xCoordsToWallYCoords: Map<number,number[]>

            /** Regions that wall reflections will appear on. */
            private _regions: Set<number>

            /** ID of the map the current cache was built for. */
            private _mapId: number
            
            public constructor(wallReflectRegions: number[]) {
                this.initialize(wallReflectRegions);
            }

            public initialize(wallReflectRegions: number[]) {
                this._xCoordsToWallYCoords = new Map();
                this._regions = new Set(wallReflectRegions);
                this._mapId = -1;
            }

            public rebuildCache() {
                this._xCoordsToWallYCoords.clear();

                this._mapId = $gameMap.mapId();

                /**
                 * Building the map this was ensures that each row is
                 * sorted starting from the southernmost tiles to the
                 * northernmost tiles. This lets us skip searching
                 * the whole array during lookups.
                 */
                for (let i = $gameMap.width() - 1; i >= 0; i--) {
                    for (let j = $gameMap.height() - 1; j >= 0; j--) {
                        const regionId = $gameMap.regionId(i, j);

                        if (this._regions.has(regionId)) {
                            const yArr = this._xCoordsToWallYCoords.get(i) || [];

                            yArr.push(j);

                            this._xCoordsToWallYCoords.set(i, yArr);
                        }
                    }
                }
            }

            /**
             * Returns the y coordinate of the closest wall reflection tile
             * to the north of the passed in x and y coordinates.
             * 
             * Returns -1 if there is no wall reflection for this x and y.
             */
            public getWallY(x: number, y: number) {
                if ($gameMap.mapId() !== this._mapId) {
                    this.rebuildCache();
                }

                x = Math.floor(x);
                y = Math.floor(y);

                const column = this._xCoordsToWallYCoords.get(x);

                /* last element is always the northernmost, so if y is above
                 * even that, then none of the candidates are valid
                 */
                if (column && y >= column[column.length - 1]) {
                    const wallY = column.find(wallYCandidate => wallYCandidate <= y);
                    if (wallY !== undefined) return wallY;
                }

                return -1;
            }


        }
        export var Aliases = {
            Game_CharacterBase_prototype_update: Game_CharacterBase.prototype.update
        }
    }
}

import $ = KCDev.Mirrors;

Game_CharacterBase.prototype.update = function (this: Game_CharacterBase) {
    $.Aliases.Game_CharacterBase_prototype_update.apply(this, arguments);
};
