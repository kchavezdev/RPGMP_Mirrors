/*:
 * @author K. Chavez 
 * @url https://github.com/kchavezdev/RPGMP_Mirrors
 * @target MV MZ
 * @orderAfter GALV_DiagonalMovementMZ
 * @orderAfter GALV_CharacterFramesMZ
 * @orderAfter GALV_EventSpawnerMZ
 * @orderAfter QMovement
 *
 * @plugindesc [v2.0.0]Add reflections to events and actors.
 *
 * @help
 * KC_Mirrors
 * 
 * @param regionsParent
 * @text Regions
 * 
 * @param wallRegions
 * @parent regionsParent
 * @text Wall Region IDs
 * @desc A wall reflection sprite will be drawn on tiles with any of these region IDs.
 * @type number[]
 * @default []
 * 
 * @param noReflectRegionsFloor
 * @parent regionsParent
 * @text Floor Exclusion regions
 * @desc Characters on tiles with these region IDs will not have floor reflections.
 * @type number[]
 * @default []
 * 
 * @param noReflectRegionsWall
 * @parent regionsParent
 * @text Wall Exclusion regions
 * @desc Characters on tiles with these region IDs will not have wall reflections.
 * @type number[]
 * @default []
 * 
 */
