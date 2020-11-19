import { isWorkerNeeded, spawnWorker, spawnWorkerOrg } from "spawner";
import { ErrorMapper } from "utils/ErrorMapper";
import { runWorker } from "worker/worker";

/*
Room RCL:
1: Spawn as many 1w,2m,1c workers. Fill Spanwer. Construct roads to link all sources with Spawn and Controller
2: Construct 5x extensions. Spawn worker with xw,xw,1c.
3:
4:
5: Construct links, to get rid move cost when harvesting energy.
*/

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
