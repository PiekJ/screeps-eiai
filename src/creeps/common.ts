export function repairStructure(creep: Creep, structure: Structure): boolean {
  if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
    creep.moveTo(structure, { visualizePathStyle: { stroke: "#ffaa00" } });

    return false;
  }

  return true;
}

export function buildStructure(creep: Creep, constructionSite: ConstructionSite): boolean {
  if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
    creep.moveTo(constructionSite, { visualizePathStyle: { stroke: "#ffaa00" } });

    return false;
  }

  return true;
}

export function harvestStructure(creep: Creep, source: Source): boolean {
  if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
    creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });

    return false;
  }

  return true;
}

export function signController(creep: Creep, controller: StructureController, text: string): boolean {
  if (creep.signController(controller, text) === ERR_NOT_IN_RANGE) {
    creep.moveTo(controller, { visualizePathStyle: { stroke: "#ff0000" } });

    return false;
  }

  return true;
}

export function recycleCreep(creep: Creep, spawner: StructureSpawn): boolean {
  if (spawner.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawner, { visualizePathStyle: { stroke: "#ffaa00" } });

    return false;
  }

  return true;
}
