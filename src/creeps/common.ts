export function repairStructure(creep: Creep, structure: Structure): void {
  if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
    creep.moveTo(structure, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

export function buildStructure(creep: Creep, constructionSite: ConstructionSite): void {
  if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
    creep.moveTo(constructionSite, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

export function harvestStructure(creep: Creep, source: Source): void {
  if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
    creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}
