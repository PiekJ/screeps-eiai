import { planRoom } from "rooms/room-structure-planner";
import { isWorkerNeeded, spawnWorker, spawnWorkerOrg } from "spawner";
import { ErrorMapper } from "utils/ErrorMapper";
import { appendLog, printLogs } from "utils/Logger";
import { runCreepWorker } from "creeps/worker/worker";
import { RoomTaskScheduler } from "rooms/room-scheduler";

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  RoomTaskScheduler.initialize();

  const mobSpawner = Game.spawns["MobSpawner"];
  const roomTaskScheduler = RoomTaskScheduler.forRoom(mobSpawner.room);

  roomTaskScheduler.runScheduler();

  planRoom(mobSpawner.room, mobSpawner);

  if (isWorkerNeeded()) {
    spawnWorker(mobSpawner);
  }

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];

    appendLog(creep, `(${creep.ticksToLive})`);

    if (creep && !creep.spawning) {
      if (creep.memory.role === "worker") {
        runCreepWorker(creep);
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
