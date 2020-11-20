/*
Room RCL:
1: Spawn as many 1w,2m,1c workers. Fill Spanwer. Construct roads to link all sources with Spawn and Controller
2: Construct 5x extensions. Spawn worker with xw,xw,1c.
3:
4:
5: Construct links, to get rid move cost when harvesting energy.
*/

export function planRoom(room: Room, mainSpawn: StructureSpawn) {
    const roomController = room.controller!;

    // place construction sites depending on RCL level.

    // constructRoadsBetweenKeyPoints(room, mainSpawn);
}

function constructRoadsBetweenKeyPoints(room: Room, mainSpawn: StructureSpawn) {
    [...room.find(FIND_SOURCES_ACTIVE), room.controller!]
        .map(source => room.findPath(mainSpawn.pos, source.pos, {
            ignoreCreeps: true,
            swampCost: 100
        }))
        .reduce((acc, x) => acc.concat(x), []) // Screeps is running on NodeJS 10, which does not support flatMap.
        .filter(x => room.lookAt(x.x, x.y).length === 0)
        .forEach(pathStep => room.createConstructionSite(pathStep.x, pathStep.y, STRUCTURE_ROAD));
}
