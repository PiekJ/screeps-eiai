type HARVESTER_STATE_UNKNOWN = 0;
type HARVESTER_STATE_FIND_SOURCE = 1;
type HARVESTER_STATE_HARVEST = 2;
type HARVESTER_STATE_FIND_DUMP_ENERGY = 3;
type HARVESTER_STATE_DUMP_ENERGY = 4;

type HarvesterStateConstant =
  | HARVESTER_STATE_UNKNOWN
  | HARVESTER_STATE_FIND_SOURCE
  | HARVESTER_STATE_HARVEST
  | HARVESTER_STATE_FIND_DUMP_ENERGY
  | HARVESTER_STATE_DUMP_ENERGY;

interface HarvesterStateMemoryTypes {
  [key: number]: HarvestSourceStateMemory | ContainerDumpStateMemory;
  2: HarvestSourceStateMemory;
  4: ContainerDumpStateMemory;
}

interface HarvestSourceStateMemory {
  sourceId: Id<Source>;
}

interface ContainerDumpStateMemory {
  containerId: Id<StructureContainer>;
}
