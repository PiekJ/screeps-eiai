export function isStructureNeedingEnergy(structure: AnyStructure): boolean {
  return (
    (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  );
}

export function isStructureNeedingRepair(structure: AnyStructure): boolean {
  return (
    ((structure.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER) &&
      structure.hits / structure.hitsMax < 0.5) ||
    (structure.structureType === STRUCTURE_RAMPART && structure.hits < 50_000)
  );
}

export function isDroppedResourceWorthPickingUp(resource: Resource): boolean {
  return resource.resourceType === RESOURCE_ENERGY && resource.amount > Math.ceil(resource.amount / 1000) * 50;
}

export function calculateRepairCost(structure: AnyStructure): number {
  let hitsToRepair = structure.hitsMax - structure.hits;

  if (structure.structureType === STRUCTURE_RAMPART) {
    // match with "is repair needed".
    hitsToRepair = Math.min(50_000 - structure.hits, hitsToRepair);
  }

  return Math.ceil(hitsToRepair / 100);
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

export function calculateRelocateCost(structure: Ruin | Tombstone): number {
  if ("store" in structure) {
    return (structure.store as StoreDefinition).getFreeCapacity(RESOURCE_ENERGY);
  }

  return 0;
}

export function calculatePickupCost(resource: Resource): number {
  return resource.amount;
}
