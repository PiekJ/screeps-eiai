import { planRoom } from "room-structure-planner";
import { isWorkerNeeded, spawnWorker, spawnWorkerOrg } from "spawner";
import { ErrorMapper } from "utils/ErrorMapper";
import { runWorker } from "worker/worker";

const mobSpawner = Game.spawns['MobSpawner'];

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  if (isWorkerNeeded()) {
    spawnWorker(mobSpawner);
  }

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    if (creep && !creep.spawning) {
      if (creep.memory.role === 'worker') {
        runWorker(creep);
      }
    }
  }

  planRoom(mobSpawner.room, mobSpawner);

  for (const creepName in Memory.creeps) {
    if (!(creepName in Game.creeps)) {
      delete Memory.creeps[creepName];
    }
  }
});
