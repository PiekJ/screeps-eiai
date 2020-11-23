/*
Room RCL:
1: Spawn as many 1w,2m,1c workers. Fill Spanwer. Construct roads to link all sources with Spawn and Controller. Place containers next to sources
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

  switch (room.memory.currentPlanRcl) {
    case 0:
      constructRoadsBetweenKeyPoints(room, mainSpawn);
      room.memory.currentPlanRcl += 0.5;
      break;
    case 0.5:
      constructContainersNextToSources(room);
      room.memory.currentPlanRcl += 0.5;
      break;
  }
}

function constructContainersNextToSources(room: Room): void {
  room
    .find(FIND_SOURCES_ACTIVE)
    .map(source =>
      scanMatrixForRoomPositions(
        room.name,
        room.lookAtArea(source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1),
        lookAtResults =>
          lookAtResults.some(
            x =>
              x.type === LOOK_CONSTRUCTION_SITES ||
              (x.type === LOOK_STRUCTURES && x.structure?.structureType === STRUCTURE_ROAD)
          )
      )
    )
    .reduce((acc, x) => acc.concat(x), [])
    .map(roomPosition =>
      scanMatrixForRoomPositions(
        room.name,
        room.lookAtArea(roomPosition.y - 1, roomPosition.x - 1, roomPosition.y + 1, roomPosition.x + 1),
        lookAtResults => lookAtResults.every(x => x.type === LOOK_TERRAIN && x.terrain !== "wall")
      )
    )
    .reduce((acc, x) => [...acc, _.sample(x)], [])
    .forEach(roomPosition => roomPosition.createConstructionSite(STRUCTURE_CONTAINER));
}

function scanMatrixForRoomPositions(
  roomName: string,
  matrix: LookAtResultMatrix,
  callback: (e: LookAtResult[]) => boolean
): RoomPosition[] {
  const roomPositionResult: RoomPosition[] = [];

  for (const y in matrix) {
    for (const x in matrix[y]) {
      const lookAtResults = matrix[y][x];

      if (callback(lookAtResults)) {
        roomPositionResult.push(new RoomPosition(+x, +y, roomName));
      }
    }
  }

  return roomPositionResult;
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
    .map(x => new RoomPosition(x.x, x.y, room.name))
    .forEach(x => x.createConstructionSite(STRUCTURE_ROAD));
}
