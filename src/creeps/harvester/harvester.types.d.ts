type HARVESTER_STATE_UNKNOWN = 0;
type HARVESTER_STATE_FIND_SOURCE = 1;
type HARVESTER_STATE_HARVEST = 2;
type HARVESTER_STATE_FIND_DUMP_ENERGY = 3;
type HARVESTER_STATE_DUMP_ENERGY = 4;
type HARVESTER_STATE_FIND_CONSTRUCTION_SITE = 5;
type HARVESTER_STATE_BUILD_CONSTRUCTION_SITE = 6;

type HarvesterStateConstant =
  | HARVESTER_STATE_UNKNOWN
  | HARVESTER_STATE_FIND_SOURCE
  | HARVESTER_STATE_HARVEST
  | HARVESTER_STATE_FIND_DUMP_ENERGY
  | HARVESTER_STATE_DUMP_ENERGY
  | HARVESTER_STATE_FIND_CONSTRUCTION_SITE
  | HARVESTER_STATE_BUILD_CONSTRUCTION_SITE;

interface HarvesterStateMemoryTypes {
  [key: number]: HarvestSourceStateMemory | ContainerDumpStateMemory | ContainerConstructionSiteStateMemory;
  2: HarvestSourceStateMemory;
  4: ContainerDumpStateMemory;
  6: ContainerConstructionSiteStateMemory;
}

interface HarvestSourceStateMemory {
  sourceId: Id<Source>;
}

interface ContainerDumpStateMemory {
  containerId: Id<StructureContainer>;
}

interface ContainerConstructionSiteStateMemory {
  constructionSiteId: Id<ConstructionSite>;
}
