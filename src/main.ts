import { planRoom } from "rooms/room-structure-planner";
import { isHarvesterCreepNeeded, isWorkerCreepNeeded, spawnHarvesterCreep, spawnWorkerCreep } from "spawner";
import { ErrorMapper } from "utils/ErrorMapper";
import { appendLog, printLogs } from "utils/Logger";
import { performCreepWorkerTick } from "creeps/worker/worker";

/*
  Spawner upgrade:
  Harverster:
  3k energy van één source in 300 ticks
  Worker parts: 5 (5 * 2 * 300 = 3k)
  Move parts: 2,5 (5 WORK / 2 -> want roads)
  Carry parts: 1 (of 2)
  cost: 5 * 100 + 2,5 * 50 + 50 = 675

  Worker:
  Use less workers
  Grap energy from nearest storage

  Room planning:
  Place storage container near each source (until links are avalable, replace them)


  Room creep manager
  Depending on controller level keep certain creep population
  1: low level workers - construct basic infrastructer (roads, extensions and containers)
  2: (and level 1 completed) spawn harvester for each source. Few high level workers (same as harvester, but being able with more worker parts?)
  ...
  4: construct storage - spawn transporters to bring energy from containers to storage ()
  5: construct links to replace containers
*/

import { RoomTaskScheduler } from "rooms/room-scheduler";
import { performCreepSignerTick } from "creeps/signer/signer";
import { result } from "lodash";
import { RoomSourceManager } from "rooms/room-resources";
import { performCreepHarvesterTick } from "creeps/harvester/harvester";

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  RoomTaskScheduler.initialize();
  RoomSourceManager.initialize();

  const mobSpawner = Game.spawns["MobSpawner"];

  const roomTaskScheduler = RoomTaskScheduler.forRoom(mobSpawner.room);
  const roomSourceManager = RoomSourceManager.forRoom(mobSpawner.room);

  roomTaskScheduler.performTick();
  roomSourceManager.performTick();

  // planRoom(mobSpawner.room, mobSpawner);

  if (isHarvesterCreepNeeded(mobSpawner.room)) {
    spawnHarvesterCreep(mobSpawner);
  }

  if (isWorkerCreepNeeded(mobSpawner.room)) {
    spawnWorkerCreep(mobSpawner);
  }

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];

    appendLog(creep, `(${creep.ticksToLive})`);

    if (creep && !creep.spawning) {
      switch (creep.memory.role) {
        case "worker":
          performCreepWorkerTick(creep);
          break;
        case "harvester":
          performCreepHarvesterTick(creep);
          break;
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
