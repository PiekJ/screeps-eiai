import { WORKER_STATE_UNKNOWN } from "worker/worker-state";

export function isWorkerNeeded() {
  return _.filter(Game.creeps, creep => creep.memory.role === 'worker').length < 5;
}

export function spawnWorker(spawn: StructureSpawn) {
  var screepName = `worker-${Game.time}`;
  spawn.spawnCreep([WORK, CARRY, MOVE], screepName, {memory: {role: 'worker', state: WORKER_STATE_UNKNOWN}});
}
