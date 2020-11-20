import { planRoom } from "room-structure-planner";
import { isWorkerNeeded, spawnWorker, spawnWorkerOrg } from "spawner";
import { ErrorMapper } from "utils/ErrorMapper";
import { appendLog, printLogs } from "utils/Logger";
import { runWorker } from "worker/worker";

/*
Per-room task based system that creeps can pick-up, so creeps don't do the same thing twice.
Nice side effect: creeps wont go to a task that's already been finished. Thus walking pointless distance/waseting ticks.
Transfer task: should subtract carry capacity of creep from total needed (multiple creeps can work on a single task). Makes sure not too many creeps will work on it.
*/

export const loop = ErrorMapper.wrapLoop(() => {
  const mobSpawner = Game.spawns['MobSpawner'];

  console.log(`Current game tick is ${Game.time}`);

  if (isWorkerNeeded()) {
    spawnWorker(mobSpawner);
  }

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];

    appendLog(creep, `(${creep.ticksToLive}, ${creep.hits}/${creep.hitsMax})`);

    if (creep && !creep.spawning) {
      if (creep.memory.role === 'worker') {
        runWorker(creep);
      }
    }
  }

  planRoom(mobSpawner.room, mobSpawner);

  printLogs();

  for (const creepName in Memory.creeps) {
    if (!(creepName in Game.creeps)) {
      delete Memory.creeps[creepName];
    }
  }
});
