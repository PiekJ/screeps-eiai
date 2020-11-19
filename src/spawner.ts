import { WORKER_STATE_UNKNOWN } from "worker/worker-state";

export function spawnWorkerOrg(spawn: StructureSpawn) {
  var screepName = `worker-${Game.time}`;
  spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], screepName, {memory: {role: 'worker', state: WORKER_STATE_UNKNOWN}});
}

const bodyPartBuildCosts = {
  [MOVE]: 50,
  [WORK]: 100,
  [CARRY]: 50
};

export function isWorkerNeeded() {
  return _.filter(Game.creeps, creep => creep.memory.role === 'worker').length < 6;
}

export function spawnWorker(spawn: StructureSpawn) {
  console.log('SHOULD SPAWN');

  const extensions = spawn.room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_EXTENSION
  }) as StructureExtension[];

  const extensionTotalCapacity = extensions.length > 0
    ? extensions
        .map(extension => extension.store.getCapacity(RESOURCE_ENERGY))
        .reduce((totalCapacity, capacity) => totalCapacity + capacity)
    : 0;

  const extensionUsedCapacity = extensions.length > 0
    ? extensions
        .map(extension => extension.store.getUsedCapacity(RESOURCE_ENERGY))
        .reduce((usedCapacity, capacity) => usedCapacity + capacity)
    : 0;

  const totalCapacity = spawn.store.getCapacity(RESOURCE_ENERGY) + extensionTotalCapacity;

  if (spawn.store.getUsedCapacity(RESOURCE_ENERGY) + extensionUsedCapacity < totalCapacity) {
    return;
  }

  const baseWorkerBodyParts = [MOVE, MOVE, WORK, CARRY];

  let totalCapacityLeftForBodyParts = totalCapacity - baseWorkerBodyParts
    .map(bodyPart => bodyPartBuildCosts[bodyPart])
    .reduce((totalCost, cost) => totalCost + cost);

  const carryBodyPartCosts = bodyPartBuildCosts[MOVE] + bodyPartBuildCosts[CARRY];
  const amountOfCarryBodyParts = Math.min(0, Math.floor(totalCapacityLeftForBodyParts / carryBodyPartCosts)); // worker has enough with 50 capacity.

  totalCapacityLeftForBodyParts -= amountOfCarryBodyParts * carryBodyPartCosts;

  const workBodyPartCosts = bodyPartBuildCosts[MOVE] + bodyPartBuildCosts[WORK];
  const amountOfWorkBodyParts = Math.floor(totalCapacityLeftForBodyParts / workBodyPartCosts); // more worker parts!!

  totalCapacityLeftForBodyParts -=  amountOfWorkBodyParts * workBodyPartCosts;

  const amountOfMoveBodyParts = amountOfCarryBodyParts + amountOfWorkBodyParts;

  if (totalCapacityLeftForBodyParts < 0)
  {
    console.log(
      'ERROR: Not enough energy left to spawn creep!',
      amountOfCarryBodyParts,
      amountOfWorkBodyParts,
      amountOfMoveBodyParts,
      totalCapacityLeftForBodyParts,
      totalCapacity);

    return;
  }

  const workerBodyParts = [
    ...baseWorkerBodyParts,
    ...new Array(amountOfMoveBodyParts).fill(MOVE),
    ...new Array(amountOfWorkBodyParts).fill(WORK),
    ...new Array(amountOfCarryBodyParts).fill(CARRY)];

  var screepName = `worker-${Game.time}`;
  spawn.spawnCreep(workerBodyParts, screepName, {memory: {role: 'worker', state: WORKER_STATE_UNKNOWN}});
}
