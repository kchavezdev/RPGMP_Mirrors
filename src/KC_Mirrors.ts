import { $gameMap, Game_CharacterBase, Game_Vehicle, ImageManager, Sprite, Sprite_Character } from "rmmz-types"

// ensure namespace object is in global scope
declare global {
    var Imported: any
}

window.Imported = window.Imported || {};
window.Imported.KC_Mirrors = true;

export namespace Mirrors {
    export interface ICharacterGraphic {
        /** File name of the character graphic. */
        name: string
        /** Index of the character graphic. Starts at 0. */
        index: number
    }
    export interface IReflectionProperties {
        /** Opacity of the graphic, ranges from 0-255 */
        opacity: number
        /** Offset in pixels of this reflection. */
        offset: { x: number, y: number }
        /** Rotation offset of this reflection in radians. */
        rotation: number,
        /** Whether this reflection is visible. */
        visible: boolean
    }
    export interface IReflectionSprite extends ICharacterGraphic {
        sprite: Sprite
    }
    export type ICharacterReflectionProperties = ICharacterGraphic & IReflectionProperties
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

        private _xCoordsToWallYCoords: Map<number, number[]>

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
        Game_CharacterBase_prototype_update: Game_CharacterBase.prototype.update,
        Game_CharacterBase_prototype_initMembers: Game_CharacterBase.prototype.initMembers,
        Sprite_Character_prototype_update: Sprite_Character.prototype.update
    }
}

import $ = Mirrors;

declare module 'rmmz-types' {

    // @ts-expect-error: Game_Actor incorrectly extends Game_Battler
    interface Game_Actor {
        _reflectionProperties: { wall: $.ICharacterReflectionProperties, floor: $.ICharacterReflectionProperties }
        initReflectionProperties: () => void
    }

    interface Game_CharacterBase {
        _reflectionProperties: { wall: $.ICharacterReflectionProperties, floor: $.ICharacterReflectionProperties }
        initReflectionProperties: () => void
    }

    interface Sprite_Character {
        _reflections: {
            floor: $.IReflectionSprite,
            wall: $.IReflectionSprite
        }
        isReflectionMatchingBitmap: (reflection: $.IReflectionSprite) => boolean
        createReflectionSprites: () => void
        updateReflectionSprites: () => void
        updateReflectionFloor: () => void
        updateReflectionWall: () => void
        updateReflectionBitmap: (spriteReflect: $.IReflectionSprite, charReflect: $.ICharacterGraphic) => void
        updateReflectionCommon: (spriteReflect: $.IReflectionSprite, charReflect: $.ICharacterReflectionProperties) => void,
        refreshReflectionIfNeeded: (spriteReflect: $.ICharacterGraphic, charReflect: $.ICharacterReflectionProperties) => void
    }
}

Game_CharacterBase.prototype.update = function (this: Game_CharacterBase) {
    $.Aliases.Game_CharacterBase_prototype_update.apply(this, arguments);
};

Game_CharacterBase.prototype.initReflectionProperties = function (this: Game_CharacterBase) {
    this._reflectionProperties = {
        wall: {
            name: '',
            index: -1,
            opacity: -1,
            offset: { x: 0, y: 0 },
            rotation: 0,
            visible: false,
        },
        floor: {
            name: '',
            index: -1,
            opacity: -1,
            offset: { x: 0, y: 0 },
            rotation: 0,
            visible: false,
        }
    };
};

Game_CharacterBase.prototype.initMembers = function (this: Game_CharacterBase) {
    $.Aliases.Game_CharacterBase_prototype_initMembers.apply(this, arguments);
    this.initReflectionProperties();
};

Sprite_Character.prototype.createReflectionSprites = function (this: Sprite_Character) {
    this._reflections = {
        floor: {
            name: '',
            index: -1,
            sprite: new Sprite(this.bitmap)
        },
        wall: {
            name: '',
            index: -1,
            sprite: new Sprite(this.bitmap)
        }
    }
    this._reflections.floor.sprite.z = -1;
    this._reflections.wall.sprite.z = -1;
};

Sprite_Character.prototype.isReflectionMatchingBitmap = function (reflection) {
    return reflection.name === '';
};

Sprite_Character.prototype.updateReflectionBitmap = function (spriteReflect, charReflect) {
    if (spriteReflect.name !== charReflect.name || spriteReflect.index !== charReflect.index) {
        spriteReflect.name = charReflect.name;
        spriteReflect.index = charReflect.index;

        if (!this.isReflectionMatchingBitmap(spriteReflect)) {
            spriteReflect.sprite.bitmap = ImageManager.loadCharacter(spriteReflect.name);
        }
    }

    if (this.isReflectionMatchingBitmap(spriteReflect) && spriteReflect.sprite.bitmap !== this.bitmap) {
        spriteReflect.sprite.bitmap = this.bitmap;
    }
};

Sprite_Character.prototype.updateReflectionCommon = function (this: Sprite_Character, spriteReflect, charReflect) {
    const reflectSprite = spriteReflect.sprite;

    reflectSprite.visible = charReflect.visible;
    
    if (!reflectSprite.visible) return; // don't update sprite at all if it's not visible

    this.updateReflectionBitmap(spriteReflect, charReflect);

    reflectSprite.opacity = charReflect.opacity < 0 ? this._character.opacity() : charReflect.opacity;
    reflectSprite.rotation = this.rotation + charReflect.rotation;
    reflectSprite.x = this.x + charReflect.offset.x;
    reflectSprite.y = this.y + charReflect.offset.y;
    reflectSprite._blendColor = this._blendColor;
    reflectSprite._blendMode = this._blendMode;
    reflectSprite.scale.x = this.scale.x;
    reflectSprite.scale.y = this.scale.y;
};

Sprite_Character.prototype.updateReflectionSprites = function (this: Sprite_Character) {
    // immediately return if this sprite doesn't have a parent
    // this is needed for compatibility with Galv_EventSpawner
    if (!this.parent) return;

    if (!this._reflections) {
        this.createReflectionSprites();
    }

    this.updateReflectionCommon(this._reflections.floor, this._character._reflectionProperties.floor);
    this.updateReflectionCommon(this._reflections.wall, this._character._reflectionProperties.wall);

};

Sprite_Character.prototype.update = function (this: Sprite_Character) {
    $.Aliases.Sprite_Character_prototype_update.apply(this, arguments);
    this.updateReflectionSprites();
};
