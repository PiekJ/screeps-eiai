type ROOM_TASK_UNKNOWN = "UNKNOWN";
type ROOM_TASK_TRANSFER = "TRANSFER";
type ROOM_TASK_REPAIR = "REPAIR";
type ROOM_TASK_BUILD = "BUILD";
type ROOM_TASK_CONTROLLER = "CONTROLLER";

type RoomTaskConstant =
  | ROOM_TASK_UNKNOWN
  | ROOM_TASK_REPAIR
  | ROOM_TASK_BUILD
  | ROOM_TASK_TRANSFER
  | ROOM_TASK_CONTROLLER;

type RoomTaskTarget = AnyStructure | ConstructionSite;

interface RoomTask {
  id: string;
  roomTaskType: RoomTaskConstant;
  target: Id<RoomTaskTarget>;
  energyNeeded: number;
}

interface CreepAssignedRoomTask {
  creepId: Id<Creep>;
  initialEnergyNeeded: number;
  usedEnergyCapacity: number;
}
