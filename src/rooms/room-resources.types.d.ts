interface EnergySourceToHarvesterMap {
  [key: string]: Id<Creep> | null;
}

interface HarvesterToEnergySourceMap {
  [key: string]: Id<Source>;
}

interface HarvesterToContainerMap {
  [key: string]: Id<StructureContainer>;
}
