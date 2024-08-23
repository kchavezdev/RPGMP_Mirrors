import { $gameMap, Bitmap, Game_CharacterBase, Game_Vehicle, ImageManager, Sprite, Sprite_Character } from "rmmz-types"

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
        sprite: Sprite_Character_Reflection
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
    export class Sprite_Character_Reflection extends Sprite_Character {
        public update(): void {
            // intentionally stubbed
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
        isReflectionMatchingIndex: (reflection: $.IReflectionSprite) => boolean
        isReflectionMatching: (reflection: $.IReflectionSprite) => boolean
        createReflectionSprites: () => void
        updateReflectionSprites: () => void
        updateReflectionFloor: () => void
        updateReflectionFrame: (reflection: $.IReflectionSprite) => void
        updateReflectionWall: () => void
        updateReflectionBitmap: (spriteReflect: $.IReflectionSprite, charReflect: $.ICharacterGraphic) => void
        updateReflectionCommon: (spriteReflect: $.IReflectionSprite, charReflect: $.ICharacterReflectionProperties) => void
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
            visible: true,
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
            sprite: new $.Sprite_Character_Reflection(this._character)
        },
        wall: {
            name: '',
            index: -1,
            sprite: new $.Sprite_Character_Reflection(this._character)
        }
    }
    for (const prop in this._reflections) {
        const sprite = this._reflections[prop].sprite as Sprite;
        sprite.z = $.PluginParameters.zValue;
        this.parent.addChild(sprite);
    }
};

Sprite_Character.prototype.isReflectionMatchingBitmap = function (reflection) {
    return reflection.name === '';
};

Sprite_Character.prototype.isReflectionMatchingIndex = function (reflection) {
    return reflection.index < 0;
};

Sprite_Character.prototype.isReflectionMatching = function (this: Sprite_Character, reflection) {
    return this.isReflectionMatchingBitmap(reflection) && this.isReflectionMatchingIndex(reflection);
};

Sprite_Character.prototype.updateReflectionBitmap = function (this: Sprite_Character, spriteReflect, charReflect) {
    if (spriteReflect.name !== charReflect.name) {
        spriteReflect.name = charReflect.name;
        spriteReflect.sprite._characterName = charReflect.name || this._character.characterName();
        spriteReflect.sprite._isBigCharacter = ImageManager.isBigCharacter(spriteReflect.sprite._characterName);
        spriteReflect.sprite._characterName = spriteReflect.name || this._character.characterName();

        if (!this.isReflectionMatchingBitmap(spriteReflect)) {
            spriteReflect.sprite.bitmap = ImageManager.loadCharacter(spriteReflect.name);
        }
    }

    if (spriteReflect.index !== charReflect.index) {
        spriteReflect.index = charReflect.index;
        spriteReflect.sprite._characterIndex = charReflect.index < 1 ? this._characterIndex : charReflect.index;
    }

    if (this.isReflectionMatchingBitmap(spriteReflect) && spriteReflect.sprite.bitmap !== this.bitmap) {
        spriteReflect.sprite.bitmap = this.bitmap;
    }

    if (this._character !== spriteReflect.sprite._character) {
        spriteReflect.sprite.setCharacter(this._character);
    }
};

/** Need this to avoid unecessarily calling certain setter functions. */
function setPropIfNonMatching<T>(obj1: T, obj2: T, propertyName: keyof T) {
    if (obj1[propertyName] !== obj2[propertyName]) {
        obj1[propertyName] = obj2[propertyName];
    }
};

Sprite_Character.prototype.updateReflectionCommon = function (this: Sprite_Character, spriteReflect, charReflect) {
    const reflectSprite = spriteReflect.sprite;

    reflectSprite.visible = charReflect.visible && this.visible;

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

    // anchor is 0,0 if we set it every update
    setPropIfNonMatching(reflectSprite.anchor, this.anchor, 'x');
    setPropIfNonMatching(reflectSprite.anchor, this.anchor, 'y');
};

Sprite_Character.prototype.updateReflectionFrame = function (this: Sprite_Character, reflection, flipDirection = false) {
    const character = this._character;
    const sprite = reflection.sprite;

    // store these values
    const tempCharIndex = character._characterIndex;
    const tempCharName = character._characterName;
    const tempCharDir = character._direction;

    // load in reflection parameters
    character._characterName = sprite._characterName;
    character._characterIndex = sprite._characterIndex;
    if (flipDirection) character._direction = character.reverseDir(tempCharDir);

    // set the frame
    const pw = sprite.patternWidth();
    const ph = sprite.patternHeight();
    const sx = (sprite.characterBlockX() + sprite.characterPatternX()) * pw;
    const sy = (sprite.characterBlockY() + sprite.characterPatternY()) * ph;
    sprite.setFrame(sx, sy, pw, ph);

    // restore character properties
    sprite._character._characterIndex = tempCharIndex;
    sprite._character._characterName = tempCharName;
    sprite._character._direction = tempCharDir;
};

Sprite_Character.prototype.updateReflectionFloor = function (this: Sprite_Character) {
    const reflection = this._reflections.floor;
    reflection.sprite.rotation += Math.PI;
    reflection.sprite.scale.x *= -1;

    // if the reflection matches, we can skip recalculating the frame
    if (this.isReflectionMatching(reflection)) {
        reflection.sprite.setFrame(this._frame.x, this._frame.y, this._frame.height, this._frame.width);
    }
    else {
        this.updateReflectionFrame(reflection);
    }
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
    this.updateReflectionFloor();
};

Sprite_Character.prototype.update = function (this: Sprite_Character) {
    $.Aliases.Sprite_Character_prototype_update.apply(this, arguments);
    this.updateReflectionSprites();
};
