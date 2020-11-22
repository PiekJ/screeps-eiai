export function isStructureNeedingEnergy(structure: AnyStructure): boolean {
  return (
    (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  );
}

export function isStructureNeedingRepair(structure: AnyStructure): boolean {
  return structure.structureType === STRUCTURE_ROAD && structure.hits / structure.hitsMax < 0.5;
}

export function calculateRepairCost(structure: AnyStructure): number {
  return Math.ceil((structure.hitsMax - structure.hits) / 100);
}

export function calculateBuildCost(constructionSite: ConstructionSite): number {
  return constructionSite.progressTotal - constructionSite.progress;
}

export function calculateTransferCost(structure: AnyStructure): number {
  if ("store" in structure) {
    return (structure.store as StoreDefinition).getFreeCapacity(RESOURCE_ENERGY);
  }

  return 0;
}
