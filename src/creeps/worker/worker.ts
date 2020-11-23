import { buildStructure, harvestStructure, repairStructure } from "creeps/common";
import {
  RoomTaskScheduler,
  ROOM_TASK_BUILD,
  ROOM_TASK_CONTROLLER,
  ROOM_TASK_REPAIR,
  ROOM_TASK_TRANSFER
} from "rooms/room-scheduler";
import { appendLog } from "utils/Logger";

export const WORKER_STATE_UNKNOWN: WORKER_STATE_UNKNOWN = 0;
export const WORKER_STATE_START_HARVEST: WORKER_STATE_START_HARVEST = 1;
export const WORKER_STATE_HARVEST: WORKER_STATE_HARVEST = 2;
export const WORKER_STATE_RETRIEVE_TASK: WORKER_STATE_RETRIEVE_TASK = 3;
export const WORKER_STATE_TRANSFER: WORKER_STATE_TRANSFER = 4;
export const WORKER_STATE_BUILD: WORKER_STATE_BUILD = 5;
export const WORKER_STATE_REPAIR: WORKER_STATE_REPAIR = 6;
export const WORKER_STATE_COMPLETE_TASK: WORKER_STATE_COMPLETE_TASK = 7;

function getStateMemory<K extends WorkerStateConstant>(creep: Creep, state: K): WorkerStateMemoryTypes[K] {
  return creep.memory.data;
}

function setState<K extends WorkerStateConstant>(creep: Creep, state: K, data?: WorkerStateMemoryTypes[K]) {
  creep.memory.state = state;
  creep.memory.data = data;
}

export function runCreepWorker(creep: Creep): void {
  if (!creep.memory.state) {
    setState(creep, WORKER_STATE_UNKNOWN);
  }

  switch (creep.memory.state) {
    case WORKER_STATE_UNKNOWN:
      appendLog(creep, "UNKNOWN");
      setState(creep, WORKER_STATE_START_HARVEST);
      runCreepWorker(creep);
      break;

    case WORKER_STATE_START_HARVEST:
      appendLog(creep, "START-HARVEST");

      const sources = creep.room.find(FIND_SOURCES_ACTIVE);

      setState(creep, WORKER_STATE_HARVEST, { sourceId: sources[0].id });
      runCreepWorker(creep);
      break;

    case WORKER_STATE_HARVEST:
      appendLog(creep, "HARVEST");

      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, WORKER_STATE_RETRIEVE_TASK);
        runCreepWorker(creep);
        break;
      }

      const harvestStateMemory = getStateMemory(creep, WORKER_STATE_HARVEST);

      const source = Game.getObjectById(harvestStateMemory.sourceId)!;

      harvestStructure(creep, source);
      break;

    case WORKER_STATE_RETRIEVE_TASK:
      appendLog(creep, "RETRIEVE-TASK");

      const roomTask = RoomTaskScheduler.forRoom(creep.room).retrieveRoomTask(creep);

      switch (roomTask.roomTaskType) {
        case ROOM_TASK_CONTROLLER:
        case ROOM_TASK_TRANSFER:
          setState(creep, WORKER_STATE_TRANSFER, {
            structureId: roomTask.target as Id<Structure>,
            roomTaskId: roomTask.id
          });
          runCreepWorker(creep);
          break;

        case ROOM_TASK_REPAIR:
          setState(creep, WORKER_STATE_REPAIR, {
            structureId: roomTask.target as Id<Structure>,
            roomTaskId: roomTask.id
          });
          runCreepWorker(creep);
          break;

        case ROOM_TASK_BUILD:
          setState(creep, WORKER_STATE_BUILD, {
            constructionSiteId: roomTask.target as Id<ConstructionSite>,
            roomTaskId: roomTask.id
          });
          runCreepWorker(creep);
          break;
      }
      break;

    case WORKER_STATE_TRANSFER:
      appendLog(creep, "TRANSFER");

      const transferStateMemory = getStateMemory(creep, WORKER_STATE_TRANSFER);

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: transferStateMemory.roomTaskId });
        runCreepWorker(creep);
        break;
      }

      const transferToStructure = Game.getObjectById(transferStateMemory.structureId)!;

      switch (creep.transfer(transferToStructure, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(transferToStructure, { visualizePathStyle: { stroke: "#ffaa00" } });
          break;

        case ERR_FULL:
          setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: transferStateMemory.roomTaskId });
          runCreepWorker(creep);
          break;
      }
      break;

    case WORKER_STATE_BUILD:
      appendLog(creep, "BUILD");

      const buildStateMemory = getStateMemory(creep, WORKER_STATE_BUILD);

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: buildStateMemory.roomTaskId });
        runCreepWorker(creep);
        break;
      }

      const constructionSiteToBuild = Game.getObjectById(buildStateMemory.constructionSiteId);

      if (constructionSiteToBuild) {
        buildStructure(creep, constructionSiteToBuild);
      } else {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: buildStateMemory.roomTaskId });
        runCreepWorker(creep);
      }
      break;

    case WORKER_STATE_REPAIR:
      appendLog(creep, "REPAIR");

      const repairStateMemory = getStateMemory(creep, WORKER_STATE_REPAIR);

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: repairStateMemory.roomTaskId });
        runCreepWorker(creep);
        break;
      }

      const structureToRepair = Game.getObjectById(repairStateMemory.structureId)!;

      if (structureToRepair.hits >= structureToRepair.hitsMax) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: repairStateMemory.roomTaskId });
        runCreepWorker(creep);
        break;
      }

      repairStructure(creep, structureToRepair);
      break;

    case WORKER_STATE_COMPLETE_TASK:
      appendLog(creep, "COMPLETE-TASK");

      const completeTaskStateMemory = getStateMemory(creep, WORKER_STATE_COMPLETE_TASK);

      RoomTaskScheduler.forRoom(creep.room).markRoomTaskComplete(creep, completeTaskStateMemory.roomTaskId);

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        setState(creep, WORKER_STATE_START_HARVEST);
      } else {
        setState(creep, WORKER_STATE_RETRIEVE_TASK);
      }

      runCreepWorker(creep);
      break;
  }
}
