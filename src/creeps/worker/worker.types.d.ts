type WORKER_STATE_UNKNOWN = 0;
type WORKER_STATE_START_HARVEST = 1;
type WORKER_STATE_HARVEST = 2;
type WORKER_STATE_RETRIEVE_TASK = 3;
type WORKER_STATE_TRANSFER = 4;
type WORKER_STATE_BUILD = 5;
type WORKER_STATE_REPAIR = 6;
type WORKER_STATE_COMPLETE_TASK = 7;
type WORKER_STATE_RETRIEVE_WITHDRAW_LOCATION = 8;
type WORKER_STATE_WITHDRAW = 9;

type WorkerStateConstant =
  | WORKER_STATE_UNKNOWN
  | WORKER_STATE_START_HARVEST
  | WORKER_STATE_HARVEST
  | WORKER_STATE_RETRIEVE_TASK
  | WORKER_STATE_TRANSFER
  | WORKER_STATE_BUILD
  | WORKER_STATE_REPAIR
  | WORKER_STATE_COMPLETE_TASK
  | WORKER_STATE_RETRIEVE_WITHDRAW_LOCATION
  | WORKER_STATE_WITHDRAW;

interface WorkerStateMemoryTypes {
  [key: number]:
    | HarvestStateMemory
    | TransferStateMemory
    | BuildStateMemory
    | RepairStateMemory
    | CompleteTaskStateMemory
    | WithdrawStateMemory;
  2: HarvestStateMemory;
  4: TransferStateMemory;
  5: BuildStateMemory;
  6: RepairStateMemory;
  7: CompleteTaskStateMemory;
  9: WithdrawStateMemory;
}

interface HarvestStateMemory {
  sourceId: Id<Source>;
}

interface TransferStateMemory {
  structureId: Id<Structure>;
  roomTaskId: string;
}

interface BuildStateMemory {
  constructionSiteId: Id<ConstructionSite>;
  roomTaskId: string;
}

interface RepairStateMemory {
  structureId: Id<Structure>;
  roomTaskId: string;
}

interface CompleteTaskStateMemory {
  roomTaskId: string;
}

interface WithdrawStateMemory {
  containerId: Id<StructureContainer>;
}
