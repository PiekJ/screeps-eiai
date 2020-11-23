import { planRoom } from "rooms/room-structure-planner";
import { isWorkerNeeded, spawnSigner, spawnWorker } from "spawner";
import { ErrorMapper } from "utils/ErrorMapper";
import { appendLog, printLogs } from "utils/Logger";
import { runCreepWorker } from "creeps/worker/worker";

/*
  Spawner upgrade:
  Harverster:
  3k energy van één source in 300 ticks
  Worker parts: 5 (5 * 2 * 300 = 3k)
  Move parts: 2,5 (5 WORK / 2 -> want roads)
  Carry parts: 1 (of 2)

  Worker:
  Use less workers
  Grap energy from nearest storage

  Room planning:
  Place storage container near each source (until links are avalable, replace them)

*/

import { RoomTaskScheduler } from "rooms/room-scheduler";
import { runCreepSigner } from "creeps/signer/signer";

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  RoomTaskScheduler.initialize();

  const mobSpawner = Game.spawns["MobSpawner"];
  const roomTaskScheduler = RoomTaskScheduler.forRoom(mobSpawner.room);

  roomTaskScheduler.runScheduler();

  // planRoom(mobSpawner.room, mobSpawner);

  if (isWorkerNeeded()) {
    spawnWorker(mobSpawner);
  }

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];

    appendLog(creep, `(${creep.ticksToLive})`);

    if (creep && !creep.spawning) {
      if (creep.memory.role === "worker") {
        runCreepWorker(creep);
      } else if (creep.memory.role === "signer") {
        runCreepSigner(creep);
      }
    }
  }

  RoomTaskScheduler.printAllRoomTasks();

  printLogs();

  for (const creepName in Memory.creeps) {
    if (!(creepName in Game.creeps)) {
      delete Memory.creeps[creepName];
    }
  }
});
