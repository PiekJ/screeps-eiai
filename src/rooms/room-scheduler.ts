import {
  calculateBuildCost,
  calculateRepairCost,
  calculateTransferCost,
  isStructureNeedingEnergy,
  isStructureNeedingRepair
} from "structures/common";
import { appendLog } from "utils/Logger";

export const ROOM_TASK_UNKNOWN: ROOM_TASK_UNKNOWN = "UNKNOWN";
export const ROOM_TASK_TRANSFER: ROOM_TASK_TRANSFER = "TRANSFER";
export const ROOM_TASK_REPAIR: ROOM_TASK_REPAIR = "REPAIR";
export const ROOM_TASK_BUILD: ROOM_TASK_BUILD = "BUILD";
export const ROOM_TASK_CONTROLLER: ROOM_TASK_CONTROLLER = "CONTROLLER";

const ROOM_TASK_ORDER = {
  [ROOM_TASK_UNKNOWN]: 3,
  [ROOM_TASK_TRANSFER]: 1,
  [ROOM_TASK_REPAIR]: 2,
  [ROOM_TASK_BUILD]: 3,
  [ROOM_TASK_CONTROLLER]: 0
};

function roomTaskOrderCallback(a: RoomTask, b: RoomTask): number {
  return ROOM_TASK_ORDER[a.roomTaskType] - ROOM_TASK_ORDER[b.roomTaskType];
}

function toRoomTask(roomTaskType: RoomTaskConstant, target: RoomTaskTarget, energyNeeded: number): RoomTask {
  return {
    id: `roomTaskKey(${roomTaskType},${target.id})`,
    roomTaskType,
    target: target.id,
    energyNeeded
  };
}

export class RoomTaskScheduler {
  private static roomTaskSchedulerInstances: Map<string, RoomTaskScheduler>;

  private priorityQueue: RoomTask[];

  private get creepRoomTaskTracker(): CreepRoomTaskTrackerMap {
    return this.room.memory.creepRoomTaskTracker;
  }

  private set creepRoomTaskTracker(value: CreepRoomTaskTrackerMap) {
    this.room.memory.creepRoomTaskTracker = value;
  }

  private constructor(private room: Room) {
    this.priorityQueue = [];

    if (!this.creepRoomTaskTracker) {
      this.creepRoomTaskTracker = {};
    }
  }

  public performTick(): void {
    const existingAssignedRoomTaskMap = this.fetchExistingAssignedRoomTasks();

    const structuresInRoom = this.room.find(FIND_STRUCTURES);

    for (const structure of structuresInRoom) {
      if (isStructureNeedingEnergy(structure)) {
        this.tryPushRoomTask(
          existingAssignedRoomTaskMap,
          toRoomTask(ROOM_TASK_TRANSFER, structure, calculateTransferCost(structure))
        );
      }

      if (isStructureNeedingRepair(structure)) {
        this.tryPushRoomTask(
          existingAssignedRoomTaskMap,
          toRoomTask(ROOM_TASK_REPAIR, structure, calculateRepairCost(structure))
        );
      }
    }

    const constructionSitesInRoom = this.room.find(FIND_MY_CONSTRUCTION_SITES);

    for (const constructionSite of constructionSitesInRoom) {
      this.tryPushRoomTask(
        existingAssignedRoomTaskMap,
        toRoomTask(ROOM_TASK_BUILD, constructionSite, calculateBuildCost(constructionSite))
      );
    }

    if (this.room.controller!.ticksToDowngrade <= 500) {
      this.tryPushRoomTask(existingAssignedRoomTaskMap, toRoomTask(ROOM_TASK_CONTROLLER, this.room.controller!, 50));
    }

    this.priorityQueue.sort(roomTaskOrderCallback);
  }

  public retrieveRoomTask(creep: Creep): RoomTask {
    const roomTask = this.priorityQueue.shift();

    if (roomTask) {
      this.assignCreepToRoomTask(creep, roomTask);

      const newRoomTask = { ...roomTask };

      newRoomTask.energyNeeded -= creep.store.getUsedCapacity(RESOURCE_ENERGY);

      if (newRoomTask.energyNeeded > 0) {
        this.priorityQueue.unshift(newRoomTask);
      }

      return roomTask;
    }

    return {
      id: "TASK-ALWAYS-AVAILABLE",
      roomTaskType: ROOM_TASK_TRANSFER,
      target: this.room.controller!.id,
      energyNeeded: creep.store.getUsedCapacity(RESOURCE_ENERGY)
    };
  }

  public markRoomTaskComplete(creep: Creep, roomTaskId: string, forceComplete?: boolean): void {
    const creepsAssignedRoomTask = this.creepRoomTaskTracker[roomTaskId];
    if (!creepsAssignedRoomTask) {
      return;
    }

    if (forceComplete && this.priorityQueue[0]?.id === roomTaskId) {
      // when force complete, check if task is not in queue.
      this.priorityQueue.shift();
    }

    if (creepsAssignedRoomTask.length === 1) {
      delete this.creepRoomTaskTracker[roomTaskId];
    } else if (creepsAssignedRoomTask.length > 1) {
      // other creeps are still working on the task.
      this.creepRoomTaskTracker[roomTaskId] = creepsAssignedRoomTask.filter(x => x.creepId !== creep.id);
    }
  }

  public static initialize(): void {
    this.roomTaskSchedulerInstances = new Map<string, RoomTaskScheduler>();
  }

  public static forRoom(room: Room): RoomTaskScheduler {
    if (this.roomTaskSchedulerInstances.has(room.name)) {
      return this.roomTaskSchedulerInstances.get(room.name)!;
    }

    const roomTaskScheduler = new RoomTaskScheduler(room);

    this.roomTaskSchedulerInstances.set(room.name, roomTaskScheduler);

    return roomTaskScheduler;
  }

  public static printAllRoomTasks(): void {
    for (const entires of this.roomTaskSchedulerInstances) {
      entires[1].priorityQueue.forEach(roomTask =>
        appendLog(
          `RoomTaskScheduler-${entires[0]}`,
          `(${roomTask.roomTaskType}, ${roomTask.target}, ${roomTask.energyNeeded})`
        )
      );
    }
  }

  private assignCreepToRoomTask(creep: Creep, roomTask: RoomTask): void {
    const creepsAssignedRoomTask = this.creepRoomTaskTracker[roomTask.id];

    const creepAssignedTask = {
      creepId: creep.id,
      initialEnergyNeeded: roomTask.energyNeeded,
      usedEnergyCapacity: creep.store.getUsedCapacity(RESOURCE_ENERGY)
    };

    if (creepsAssignedRoomTask) {
      creepsAssignedRoomTask.push(creepAssignedTask);

      return;
    }

    this.creepRoomTaskTracker[roomTask.id] = [creepAssignedTask];
  }

  private tryPushRoomTask(
    existingAssignedRoomTaskMap: Map<string, ExistingAssignedRoomTask>,
    roomTask: RoomTask
  ): void {
    if (existingAssignedRoomTaskMap.has(roomTask.id)) {
      const existingRoomTaskInfo = existingAssignedRoomTaskMap.get(roomTask.id)!;

      roomTask.energyNeeded -=
        existingRoomTaskInfo.totalEnergyInProgress - (existingRoomTaskInfo.initialEnergyNeeded - roomTask.energyNeeded);
    }

    if (roomTask.energyNeeded > 0) {
      this.priorityQueue.push(roomTask);
    }
  }

  private fetchExistingAssignedRoomTasks(): Map<string, ExistingAssignedRoomTask> {
    const existingAssignedRoomTaskMap = new Map<string, ExistingAssignedRoomTask>();

    for (const roomTaskId in this.creepRoomTaskTracker) {
      const creepsAssignedRoomTask = this.creepRoomTaskTracker[roomTaskId].filter(
        x => Game.getObjectById(x.creepId) !== null
      );
      this.creepRoomTaskTracker[roomTaskId] = creepsAssignedRoomTask;

      if (creepsAssignedRoomTask.length === 0) {
        // delete existing task, creep seems to dead.
        delete this.creepRoomTaskTracker[roomTaskId];

        continue;
      }

      let initialEnergyNeeded = 0;
      let totalEnergyInProgress = 0;

      for (const existingRoomTaskInfo of creepsAssignedRoomTask) {
        if (existingRoomTaskInfo.initialEnergyNeeded > initialEnergyNeeded) {
          initialEnergyNeeded = existingRoomTaskInfo.initialEnergyNeeded;
        }

        totalEnergyInProgress += existingRoomTaskInfo.usedEnergyCapacity;
      }

      existingAssignedRoomTaskMap.set(roomTaskId, { totalEnergyInProgress, initialEnergyNeeded });
    }

    return existingAssignedRoomTaskMap;
  }
}
