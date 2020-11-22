/*
Room RCL:
1: Spawn as many 1w,2m,1c workers. Fill Spanwer. Construct roads to link all sources with Spawn and Controller
2: Construct 5x extensions. Spawn worker with xw,xw,1c.
3:
4:
5: Construct links, to get rid move cost when harvesting energy.
*/

export function planRoom(room: Room, mainSpawn: StructureSpawn): void {
  const roomController = room.controller!;

  if (!room.memory.currentPlanRcl) {
    room.memory.currentPlanRcl = 0;
  }

  if (roomController.level <= room.memory.currentPlanRcl) {
    return;
  }

  room.memory.currentPlanRcl++;

  switch (roomController.level) {
    case 1:
      constructRoadsBetweenKeyPoints(room, mainSpawn);
      break;
  }
}

function constructRoadsBetweenKeyPoints(room: Room, mainSpawn: StructureSpawn): void {
  [...room.find(FIND_SOURCES_ACTIVE), room.controller!]
    .map(source =>
      room.findPath(mainSpawn.pos, source.pos, {
        ignoreCreeps: true,
        swampCost: 100
      })
    )
    .reduce((acc, x) => acc.concat(x), []) // Screeps is running on NodeJS 10, which does not support flatMap.
    .filter(x => room.lookAt(x.x, x.y).every(x => x.type === LOOK_TERRAIN))
    .forEach(pathStep => room.createConstructionSite(pathStep.x, pathStep.y, STRUCTURE_ROAD));
}
