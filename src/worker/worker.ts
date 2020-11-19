import { WORKER_STATE_UNKNOWN, setState, WORKER_STATE_HARVEST, WORKER_STATE_START_HARVEST, WORKER_STATE_START_PROCESS_ENERGY, getStateMemory, WORKER_STATE_TRANSFER, WORKER_STATE_BUILD, WORKER_STATE_REPAIR } from "./worker-state";

export function runWorker(creep: Creep) {
    if (!creep.memory.state) {
        setState(creep, WORKER_STATE_UNKNOWN);
    }

    switch (creep.memory.state) {
        case WORKER_STATE_UNKNOWN:
            console.log(creep.name, 'STATE: UNKNOWN');

            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                setState(creep, WORKER_STATE_START_HARVEST);
                runWorker(creep);
            }
            break;

        case WORKER_STATE_START_HARVEST:
            console.log(creep.name, 'STATE: START HARVEST');

            const sources = creep.room.find(FIND_SOURCES_ACTIVE);

            setState(creep, WORKER_STATE_HARVEST, { sourceId:  sources[0].id });
            runWorker(creep);
            break;

        case WORKER_STATE_HARVEST:
            console.log(creep.name, 'STATE: HARVEST');

            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                setState(creep, WORKER_STATE_START_PROCESS_ENERGY);
                runWorker(creep);
                break;
            }

            const harvestStateMemory = getStateMemory(creep, WORKER_STATE_HARVEST);

            const source = Game.getObjectById(harvestStateMemory.sourceId)!;

            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            break;

        case WORKER_STATE_TRANSFER:
            console.log(creep.name, 'STATE: TRANSFER');

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                setState(creep, WORKER_STATE_START_HARVEST);
                runWorker(creep);
                break;
            }

            const transferStateMemory = getStateMemory(creep, WORKER_STATE_TRANSFER);

            const transferToStructure = Game.getObjectById(transferStateMemory.structureId)!;

            switch (creep.transfer(transferToStructure, RESOURCE_ENERGY)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(transferToStructure, {visualizePathStyle: {stroke: '#ffaa00'}});
                    break;

                case ERR_FULL:
                    setState(creep, WORKER_STATE_START_PROCESS_ENERGY);
                    runWorker(creep);
                    break;
            }
            break;

        case WORKER_STATE_BUILD:
            console.log(creep.name, 'STATE: BUILD');

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                setState(creep, WORKER_STATE_START_HARVEST);
                runWorker(creep);
                break;
            }

            const buildStateMemory = getStateMemory(creep, WORKER_STATE_BUILD);

            const constructionSiteToBuild = Game.getObjectById(buildStateMemory.constructionSiteId);

            if (constructionSiteToBuild) {
                if (creep.build(constructionSiteToBuild!) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSiteToBuild!, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else {
                setState(creep, WORKER_STATE_START_PROCESS_ENERGY);
                runWorker(creep);
            }
            break;

        case WORKER_STATE_REPAIR:
            console.log(creep.name, 'STATE: REPAIR');

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                setState(creep, WORKER_STATE_START_HARVEST);
                runWorker(creep);
                break;
            }

            const repairStateMemory = getStateMemory(creep, WORKER_STATE_REPAIR);

            const structureToRepair = Game.getObjectById(repairStateMemory.structureId)!;

            if (structureToRepair.hits >= structureToRepair.hitsMax) {
                setState(creep, WORKER_STATE_START_PROCESS_ENERGY);
                runWorker(creep);
                break;
            }

            if (creep.repair(structureToRepair) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structureToRepair, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            break;

        case WORKER_STATE_START_PROCESS_ENERGY:
            console.log(creep.name, 'STATE: START PROCESS ENERGY');

            const possibleStructuresToTransfer = creep.room.find(FIND_MY_STRUCTURES, {
                filter: structure => (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (possibleStructuresToTransfer.length > 0) {
                setState(creep, WORKER_STATE_TRANSFER, { structureId: possibleStructuresToTransfer[0].id });
                runWorker(creep);
                break;
            }

            const possibleStructuresToRepair = creep.room.find(FIND_STRUCTURES, {
                filter: structure => structure.structureType === STRUCTURE_ROAD && structure.hits / structure.hitsMax < 0.5
            });

            if (possibleStructuresToRepair.length > 0) {
                setState(creep, WORKER_STATE_REPAIR, { structureId: possibleStructuresToRepair[0].id });
                runWorker(creep);
                break;
            }

            const possibleConstructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

            if (possibleConstructionSites.length > 0) {
                setState(creep, WORKER_STATE_BUILD, { constructionSiteId: possibleConstructionSites[0].id });
            }
            else {
                setState(creep, WORKER_STATE_TRANSFER, { structureId: creep.room.controller!.id });
            }
            runWorker(creep);
            break;
    }
}
