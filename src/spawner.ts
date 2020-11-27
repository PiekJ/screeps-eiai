import { HARVESTER_STATE_UNKNOWN } from "creeps/harvester/harvester";
import { SIGNER_STATE_UNKNOWN } from "creeps/signer/signer";
import { WORKER_STATE_UNKNOWN } from "creeps/worker/worker";
import { appendLog } from "utils/Logger";

const bodyPartBuildCosts = {
  [MOVE]: 50,
  [WORK]: 100,
  [CARRY]: 50
};

function totalSpawnerCapacity(spawn: StructureSpawn): { totalCapacity: number; totalUsedCapacity: number } {
  const extensions = spawn.room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_EXTENSION
  }) as StructureExtension[];

  const extensionTotalCapacity =
    extensions.length > 0
      ? extensions
          .map(extension => extension.store.getCapacity(RESOURCE_ENERGY))
          .reduce((totalCapacity, capacity) => totalCapacity + capacity)
      : 0;

  const extensionUsedCapacity =
    extensions.length > 0
      ? extensions
          .map(extension => extension.store.getUsedCapacity(RESOURCE_ENERGY))
          .reduce((usedCapacity, capacity) => usedCapacity + capacity)
      : 0;

  return {
    totalCapacity: spawn.store.getCapacity(RESOURCE_ENERGY) + extensionTotalCapacity,
    totalUsedCapacity: spawn.store.getUsedCapacity(RESOURCE_ENERGY) + extensionUsedCapacity
  };
}

export function isWorkerCreepNeeded(room: Room): boolean {
  return (
    _.filter(Game.creeps, creep => creep.memory.roomName === room.name && creep.memory.role === "worker").length < 4 // 6 before harvesters
  );
}

export function spawnWorkerCreep(spawn: StructureSpawn, minEnergyNeededToSpawn?: number): void {
  appendLog(spawn, "Do spawn (Worker)");

  if (spawn.spawning) {
    appendLog(spawn, "Already spawning");

    return;
  }

  const { totalCapacity, totalUsedCapacity } = totalSpawnerCapacity(spawn);

  if (!minEnergyNeededToSpawn) {
    minEnergyNeededToSpawn = totalCapacity;
  }

  if (totalUsedCapacity < Math.min(minEnergyNeededToSpawn, totalCapacity)) {
    appendLog(spawn, `Not enough energy available (${totalUsedCapacity}/${totalCapacity})`);

    return;
  }

  const baseWorkerBodyParts = [MOVE, MOVE, WORK, CARRY];

  let totalCapacityLeftForBodyParts =
    totalUsedCapacity -
    baseWorkerBodyParts.map(bodyPart => bodyPartBuildCosts[bodyPart]).reduce((totalCost, cost) => totalCost + cost);

  const carryBodyPartCosts = bodyPartBuildCosts[MOVE] + bodyPartBuildCosts[CARRY];
  const amountOfCarryBodyParts = Math.min(1, Math.floor(totalCapacityLeftForBodyParts / carryBodyPartCosts)); // worker has enough with 50 capacity (without harvesters).

  totalCapacityLeftForBodyParts -= amountOfCarryBodyParts * carryBodyPartCosts;

  const workBodyPartCosts = bodyPartBuildCosts[MOVE] + bodyPartBuildCosts[WORK];
  const amountOfWorkBodyParts = Math.min(3, Math.floor(totalCapacityLeftForBodyParts / workBodyPartCosts)); // more worker parts!!

  totalCapacityLeftForBodyParts -= amountOfWorkBodyParts * workBodyPartCosts;

  const amountOfMoveBodyParts = amountOfCarryBodyParts + amountOfWorkBodyParts;

  if (totalCapacityLeftForBodyParts < 0) {
    throw `ERROR: Not enough energy left to spawn worker creep! ${amountOfCarryBodyParts} ${amountOfWorkBodyParts} ${amountOfMoveBodyParts} ${totalCapacityLeftForBodyParts} ${totalCapacity}`;
  }

  const workerBodyParts = [
    ...baseWorkerBodyParts,
    ...new Array(amountOfMoveBodyParts).fill(MOVE),
    ...new Array(amountOfWorkBodyParts).fill(WORK),
    ...new Array(amountOfCarryBodyParts).fill(CARRY)
  ];

  var screepName = `worker-${Game.time}`;
  spawn.spawnCreep(workerBodyParts, screepName, {
    memory: { roomName: spawn.room.name, role: "worker", state: WORKER_STATE_UNKNOWN }
  });
}

export function isHarvesterCreepNeeded(room: Room): boolean {
  return !Object.keys(room.memory.energySourceToHarvester)
    .map(sourceId => room.memory.energySourceToHarvester[sourceId])
    .every(creepId => creepId !== null && Game.getObjectById(creepId));
}

export function spawnHarvesterCreep(spawn: StructureSpawn, minEnergyNeededToSpawn?: number): void {
  appendLog(spawn, "Do spawn (Harvester)");

  if (spawn.spawning) {
    appendLog(spawn, "Already spawning");

    return;
  }

  const { totalCapacity, totalUsedCapacity } = totalSpawnerCapacity(spawn);

  if (!minEnergyNeededToSpawn) {
    minEnergyNeededToSpawn = totalCapacity;
  }

  if (totalUsedCapacity < Math.min(minEnergyNeededToSpawn, totalCapacity)) {
    appendLog(spawn, `Not enough energy available (${totalUsedCapacity}/${totalCapacity})`);

    return;
  }

  const baseHarvesterBodyParts = [CARRY];

  let totalCapacityLeftForBodyParts =
    totalUsedCapacity -
    baseHarvesterBodyParts.map(bodyPart => bodyPartBuildCosts[bodyPart]).reduce((totalCost, cost) => totalCost + cost);

  const workBodyPartCosts = bodyPartBuildCosts[MOVE] / 2 + bodyPartBuildCosts[WORK];
  const amountOfWorkBodyParts = Math.min(5, Math.floor(totalCapacityLeftForBodyParts / workBodyPartCosts)); // more worker parts!!

  totalCapacityLeftForBodyParts -= amountOfWorkBodyParts * workBodyPartCosts;

  const amountOfMoveBodyParts = Math.max(1, Math.floor(amountOfWorkBodyParts / 2));

  if (totalCapacityLeftForBodyParts < 0) {
    throw `ERROR: Not enough energy left to harvester spawn creep! ${amountOfWorkBodyParts} ${amountOfMoveBodyParts} ${totalCapacityLeftForBodyParts} ${totalCapacity}`;
  }

  const harvesterBodyParts = [
    ...baseHarvesterBodyParts,
    ...new Array(amountOfMoveBodyParts).fill(MOVE),
    ...new Array(amountOfWorkBodyParts).fill(WORK)
  ];

  var screepName = `harvester-${Game.time}`;
  spawn.spawnCreep(harvesterBodyParts, screepName, {
    memory: { roomName: spawn.room.name, role: "harvester", state: HARVESTER_STATE_UNKNOWN }
  });
}
