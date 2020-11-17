export const WORKER_STATE_UNKNOWN: WORKER_STATE_UNKNOWN = 0;
export const WORKER_STATE_START_HARVEST: WORKER_STATE_START_HARVEST = 1;
export const WORKER_STATE_HARVEST: WORKER_STATE_HARVEST = 2;
export const WORKER_STATE_START_PROCESS_ENERGY: WORKER_STATE_START_PROCESS_ENERGY = 3;
export const WORKER_STATE_TRANSFER: WORKER_STATE_TRANSFER = 4;
export const WORKER_STATE_BUILD: WORKER_STATE_BUILD = 5;

type WORKER_STATE_UNKNOWN = 0;
type WORKER_STATE_START_HARVEST = 1;
type WORKER_STATE_HARVEST = 2;
type WORKER_STATE_START_PROCESS_ENERGY = 3;
type WORKER_STATE_TRANSFER = 4;
type WORKER_STATE_BUILD = 5;

type WorkerStateConstant =
    | WORKER_STATE_UNKNOWN
    | WORKER_STATE_START_HARVEST
    | WORKER_STATE_HARVEST
    | WORKER_STATE_START_PROCESS_ENERGY
    | WORKER_STATE_TRANSFER
    | WORKER_STATE_BUILD;

interface StateMemoryTypes {
    [key: number]:
        | HarvestStateMemory
        | TransferStateMemory
        | BuildStateMemory;
    [WORKER_STATE_HARVEST]: HarvestStateMemory;
    [WORKER_STATE_TRANSFER]: TransferStateMemory;
    [WORKER_STATE_BUILD]: BuildStateMemory;
}

interface HarvestStateMemory {
    sourceId: Id<Source>;
}

interface TransferStateMemory {
    structureId: Id<Structure>;
}

interface BuildStateMemory {
    constructionSiteId: Id<ConstructionSite>;
}

export function getStateMemory<K extends WorkerStateConstant>(creep: Creep, state: K): StateMemoryTypes[K] {
    return creep.memory.data;
}

export function setState<K extends WorkerStateConstant>(creep: Creep, state: K, data?: StateMemoryTypes[K]) {
    creep.memory.state = state;
    creep.memory.data = data;
}
