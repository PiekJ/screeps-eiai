import { buildStructure, harvestStructure, repairStructure, transferStructure, withdrawStructure } from "creeps/common";
import { RoomSourceManager } from "rooms/room-resources";
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
export const WORKER_STATE_RETRIEVE_WITHDRAW_LOCATION: WORKER_STATE_RETRIEVE_WITHDRAW_LOCATION = 8;
export const WORKER_STATE_WITHDRAW: WORKER_STATE_WITHDRAW = 9;

function getStateMemory<K extends WorkerStateConstant>(creep: Creep, state: K): WorkerStateMemoryTypes[K] {
  return creep.memory.data;
}

function setState<K extends WorkerStateConstant>(creep: Creep, state: K, data?: WorkerStateMemoryTypes[K]) {
  creep.memory.state = state;
  creep.memory.data = data;
}

export function performCreepWorkerTick(creep: Creep): void {
  if (!creep.memory.state) {
    setState(creep, WORKER_STATE_UNKNOWN);
  }

  switch (creep.memory.state) {
    case WORKER_STATE_UNKNOWN:
      appendLog(creep, "UNKNOWN");
      setState(creep, WORKER_STATE_RETRIEVE_WITHDRAW_LOCATION);
      performCreepWorkerTick(creep);
      break;

    case WORKER_STATE_START_HARVEST:
      appendLog(creep, "START-HARVEST");

      const sources = creep.room.find(FIND_SOURCES_ACTIVE);

      setState(creep, WORKER_STATE_HARVEST, { sourceId: sources[0].id });
      performCreepWorkerTick(creep);
      break;

    case WORKER_STATE_HARVEST:
      appendLog(creep, "HARVEST");

      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, WORKER_STATE_RETRIEVE_TASK);
        performCreepWorkerTick(creep);
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
          performCreepWorkerTick(creep);
          break;

        case ROOM_TASK_REPAIR:
          setState(creep, WORKER_STATE_REPAIR, {
            structureId: roomTask.target as Id<Structure>,
            roomTaskId: roomTask.id
          });
          performCreepWorkerTick(creep);
          break;

        case ROOM_TASK_BUILD:
          setState(creep, WORKER_STATE_BUILD, {
            constructionSiteId: roomTask.target as Id<ConstructionSite>,
            roomTaskId: roomTask.id
          });
          performCreepWorkerTick(creep);
          break;
      }
      break;

    case WORKER_STATE_TRANSFER:
      appendLog(creep, "TRANSFER");

      const transferStateMemory = getStateMemory(creep, WORKER_STATE_TRANSFER);

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: transferStateMemory.roomTaskId });
        performCreepWorkerTick(creep);
        break;
      }

      const transferToStructure = Game.getObjectById(transferStateMemory.structureId)!;

      if (transferStructure(creep, transferToStructure) === ERR_FULL) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: transferStateMemory.roomTaskId });
        performCreepWorkerTick(creep);
      }
      break;

    case WORKER_STATE_BUILD:
      appendLog(creep, "BUILD");

      const buildStateMemory = getStateMemory(creep, WORKER_STATE_BUILD);

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: buildStateMemory.roomTaskId });
        performCreepWorkerTick(creep);
        break;
      }

      const constructionSiteToBuild = Game.getObjectById(buildStateMemory.constructionSiteId);

      if (constructionSiteToBuild) {
        buildStructure(creep, constructionSiteToBuild);
      } else {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: buildStateMemory.roomTaskId });
        performCreepWorkerTick(creep);
      }
      break;

    case WORKER_STATE_REPAIR:
      appendLog(creep, "REPAIR");

      const repairStateMemory = getStateMemory(creep, WORKER_STATE_REPAIR);

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: repairStateMemory.roomTaskId });
        performCreepWorkerTick(creep);
        break;
      }

      const structureToRepair = Game.getObjectById(repairStateMemory.structureId)!;

      if (structureToRepair.hits >= structureToRepair.hitsMax) {
        setState(creep, WORKER_STATE_COMPLETE_TASK, { roomTaskId: repairStateMemory.roomTaskId });
        performCreepWorkerTick(creep);
        break;
      }

      repairStructure(creep, structureToRepair);
      break;

    case WORKER_STATE_COMPLETE_TASK:
      appendLog(creep, "COMPLETE-TASK");

      const completeTaskStateMemory = getStateMemory(creep, WORKER_STATE_COMPLETE_TASK);

      RoomTaskScheduler.forRoom(creep.room).markRoomTaskComplete(creep, completeTaskStateMemory.roomTaskId);

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        setState(creep, WORKER_STATE_RETRIEVE_WITHDRAW_LOCATION);
      } else {
        setState(creep, WORKER_STATE_RETRIEVE_TASK);
      }

      performCreepWorkerTick(creep);
      break;

    case WORKER_STATE_RETRIEVE_WITHDRAW_LOCATION:
      appendLog(creep, "RETRIEVE-WITHDRAW-LOCATION");

      const container = RoomSourceManager.forRoom(creep.room).locateContainerForWorker();

      if (container) {
        setState(creep, WORKER_STATE_WITHDRAW, {
          containerId: container.id
        });
        performCreepWorkerTick(creep);
        break;
      }

      setState(creep, WORKER_STATE_START_HARVEST);
      performCreepWorkerTick(creep);
      break;

    case WORKER_STATE_WITHDRAW:
      appendLog(creep, "WITHDRAW");

      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        setState(creep, WORKER_STATE_RETRIEVE_TASK);
        performCreepWorkerTick(creep);
        break;
      }

      const withdrawStateMemory = getStateMemory(creep, WORKER_STATE_WITHDRAW);

      const structureToWithdraw = Game.getObjectById(withdrawStateMemory.containerId);

      if (structureToWithdraw) {
        withdrawStructure(creep, structureToWithdraw);
        break;
      }

      setState(creep, WORKER_STATE_START_HARVEST);
      performCreepWorkerTick(creep);
      break;
  }
}
