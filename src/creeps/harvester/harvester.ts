import { buildStructure, harvestStructure, transferStructure } from "creeps/common";
import { RoomSourceManager } from "rooms/room-resources";
import { appendLog } from "utils/Logger";

export const HARVESTER_STATE_UNKNOWN: HARVESTER_STATE_UNKNOWN = 0;
export const HARVESTER_STATE_FIND_SOURCE: HARVESTER_STATE_FIND_SOURCE = 1;
export const HARVESTER_STATE_HARVEST: HARVESTER_STATE_HARVEST = 2;
export const HARVESTER_STATE_FIND_DUMP_ENERGY: HARVESTER_STATE_FIND_DUMP_ENERGY = 3;
export const HARVESTER_STATE_DUMP_ENERGY: HARVESTER_STATE_DUMP_ENERGY = 4;
export const HARVESTER_STATE_FIND_CONSTRUCTION_SITE: HARVESTER_STATE_FIND_CONSTRUCTION_SITE = 5;
export const HARVESTER_STATE_BUILD_CONSTRUCTION_SITE: HARVESTER_STATE_BUILD_CONSTRUCTION_SITE = 6;

function getStateMemory<K extends HarvesterStateConstant>(creep: Creep, state: K): HarvesterStateMemoryTypes[K] {
  return creep.memory.data;
}

function setState<K extends HarvesterStateConstant>(creep: Creep, state: K, data?: HarvesterStateMemoryTypes[K]) {
  creep.memory.state = state;
  creep.memory.data = data;
}

export function performCreepHarvesterTick(creep: Creep): void {
  if (!creep.memory.state) {
    setState(creep, HARVESTER_STATE_UNKNOWN);
  }

  switch (creep.memory.state) {
    case HARVESTER_STATE_UNKNOWN:
      appendLog(creep, "UNKNOWN");
      setState(creep, HARVESTER_STATE_FIND_SOURCE);
      performCreepHarvesterTick(creep);
      break;
    case HARVESTER_STATE_FIND_SOURCE:
      appendLog(creep, "FIND-SOURCE");

      const assignedSource = RoomSourceManager.forRoom(creep.room).assignHarvesterToSource(creep);

      setState(creep, HARVESTER_STATE_HARVEST, { sourceId: assignedSource.id });
      performCreepHarvesterTick(creep);
      break;
    case HARVESTER_STATE_HARVEST:
      appendLog(creep, "HARVEST");

      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, HARVESTER_STATE_FIND_DUMP_ENERGY);
        break;
      }

      const harvestSourceStateMemory = getStateMemory(creep, HARVESTER_STATE_HARVEST);

      const sourceToHarvest = Game.getObjectById(harvestSourceStateMemory.sourceId)!;

      harvestStructure(creep, sourceToHarvest);
      break;
    case HARVESTER_STATE_FIND_DUMP_ENERGY:
      appendLog(creep, "FIND-DUMP-ENERGY");

      const container = RoomSourceManager.forRoom(creep.room).locateContainerForHarvester(creep);

      if (container) {
        setState(creep, HARVESTER_STATE_DUMP_ENERGY, {
          containerId: container.id
        });
        performCreepHarvesterTick(creep);
        break;
      }

      setState(creep, HARVESTER_STATE_FIND_CONSTRUCTION_SITE);
      performCreepHarvesterTick(creep);
      break;
    case HARVESTER_STATE_DUMP_ENERGY:
      {
        appendLog(creep, "DUMP-ENERGY");

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          setState(creep, HARVESTER_STATE_FIND_SOURCE);
          performCreepHarvesterTick(creep);
          break;
        }

        const dumpEnergyStateMemory = getStateMemory(creep, HARVESTER_STATE_DUMP_ENERGY);

        const dumpToContainer = Game.getObjectById(dumpEnergyStateMemory.containerId)!;

        if (transferStructure(creep, dumpToContainer) === ERR_FULL) {
          creep.say("💤 idle");
        }
      }
      break;
    case HARVESTER_STATE_FIND_CONSTRUCTION_SITE:
      appendLog(creep, "FIND-CONSTRUCTION-SITE");

      const closestConstructionSites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);

      if (closestConstructionSites.length === 0) {
        setState(creep, HARVESTER_STATE_UNKNOWN);
      } else {
        setState(creep, HARVESTER_STATE_BUILD_CONSTRUCTION_SITE, {
          constructionSiteId: closestConstructionSites[0].id
        });
      }
      performCreepHarvesterTick(creep);
      break;
    case HARVESTER_STATE_BUILD_CONSTRUCTION_SITE:
      appendLog(creep, "BUILD-CONSTRUCTION-SITE");

      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, HARVESTER_STATE_FIND_SOURCE);
        performCreepHarvesterTick(creep);
        break;
      }

      const buildStateMemory = getStateMemory(creep, HARVESTER_STATE_BUILD_CONSTRUCTION_SITE);

      const constructionSiteToBuild = Game.getObjectById(buildStateMemory.constructionSiteId);

      if (constructionSiteToBuild) {
        buildStructure(creep, constructionSiteToBuild);
      } else {
        setState(creep, HARVESTER_STATE_UNKNOWN);
      }
      break;
  }
}
