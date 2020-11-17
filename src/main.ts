import { isWorkerNeeded, spawnWorker } from "spawner";
import { ErrorMapper } from "utils/ErrorMapper";
import { runWorker } from "worker/worker";

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  if (isWorkerNeeded()) {
    spawnWorker(Game.spawns['MobSpawner']);
  }

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    if (creep && !creep.spawning) {
      if (creep.memory.role === 'worker') {
        runWorker(creep);
      }
    }
  }

  for (const creepName in Memory.creeps) {
    if (!(creepName in Game.creeps)) {
      delete Memory.creeps[creepName];
    }
  }
});
