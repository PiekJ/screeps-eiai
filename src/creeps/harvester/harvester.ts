import { harvestStructure, transferStructure } from "creeps/common";
import { RoomSourceManager } from "rooms/room-resources";
import { appendLog } from "utils/Logger";

export const HARVESTER_STATE_UNKNOWN: HARVESTER_STATE_UNKNOWN = 0;
export const HARVESTER_STATE_FIND_SOURCE: HARVESTER_STATE_FIND_SOURCE = 1;
export const HARVESTER_STATE_HARVEST: HARVESTER_STATE_HARVEST = 2;
export const HARVESTER_STATE_FIND_DUMP_ENERGY: HARVESTER_STATE_FIND_DUMP_ENERGY = 3;
export const HARVESTER_STATE_DUMP_ENERGY: HARVESTER_STATE_DUMP_ENERGY = 4;

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

      const harvestSourceStateMemory = getStateMemory(creep, HARVESTER_STATE_HARVEST);

      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
        setState(creep, HARVESTER_STATE_FIND_DUMP_ENERGY);
        break;
      }

      const sourceToHarvest = Game.getObjectById(harvestSourceStateMemory.sourceId)!;

      harvestStructure(creep, sourceToHarvest);
      break;
    case HARVESTER_STATE_FIND_DUMP_ENERGY:
      appendLog(creep, "FIND-DUMP-ENERGY");

      const container = RoomSourceManager.forRoom(creep.room).locateContainerForHarvester(creep)!;

      setState(creep, HARVESTER_STATE_DUMP_ENERGY, {
        containerId: container.id
      });
      performCreepHarvesterTick(creep);
      break;
    case HARVESTER_STATE_DUMP_ENERGY:
      {
        appendLog(creep, "DUMP-ENERGY");

        const dumpEnergyStateMemory = getStateMemory(creep, HARVESTER_STATE_DUMP_ENERGY);

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          setState(creep, HARVESTER_STATE_FIND_SOURCE);
          performCreepHarvesterTick(creep);
          break;
        }

        const dumpToContainer = Game.getObjectById(dumpEnergyStateMemory.containerId)!;

        if (transferStructure(creep, dumpToContainer) === ERR_FULL) {
          creep.say("💤 idle");
        }
      }
      break;
  }
}
