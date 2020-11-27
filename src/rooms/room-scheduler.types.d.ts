type ROOM_TASK_UNKNOWN = "UNKNOWN";
type ROOM_TASK_TRANSFER = "TRANSFER";
type ROOM_TASK_REPAIR = "REPAIR";
type ROOM_TASK_BUILD = "BUILD";
type ROOM_TASK_CONTROLLER = "CONTROLLER";
type ROOM_TASK_PICKUP_RESOURCE = "PICKUP-RESOURCE";
type ROOM_TASK_RELOCATE_RESOURCE = "RELOCATE-SOURCE";

type RoomTaskConstant =
  | ROOM_TASK_UNKNOWN
  | ROOM_TASK_REPAIR
  | ROOM_TASK_BUILD
  | ROOM_TASK_TRANSFER
  | ROOM_TASK_CONTROLLER
  | ROOM_TASK_PICKUP_RESOURCE
  | ROOM_TASK_RELOCATE_RESOURCE;

type RoomTaskTarget = AnyStructure | ConstructionSite | Resource | Ruin | Tombstone;

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

interface CreepRoomTaskTrackerMap {
  [key: string]: CreepAssignedRoomTask[];
}

interface ExistingAssignedRoomTask {
  totalEnergyInProgress: number;
  initialEnergyNeeded: number;
}
