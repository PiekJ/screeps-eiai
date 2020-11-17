import { WORKER_STATE_UNKNOWN, setState, WORKER_STATE_HARVEST, WORKER_STATE_START_HARVEST, WORKER_STATE_START_PROCESS_ENERGY, getStateMemory, WORKER_STATE_TRANSFER } from "./worker-state";

export function runWorker(creep: Creep) {
    if (!creep.memory.state) {
        setState(creep, WORKER_STATE_UNKNOWN);
    }

    switch (creep.memory.state) {
        case WORKER_STATE_UNKNOWN:
            console.log(creep.name, 'STATE: UNKNOWN');

            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                setState(creep, WORKER_STATE_START_HARVEST);
            }
            break;

        case WORKER_STATE_START_HARVEST:
            console.log(creep.name, 'STATE: START HARVEST');

            let sources = creep.room.find(FIND_SOURCES_ACTIVE);

            setState(creep, WORKER_STATE_HARVEST, { sourceId:  sources[0].id });
            break;

        case WORKER_STATE_HARVEST:
            console.log(creep.name, 'STATE: HARVEST');

            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                setState(creep, WORKER_STATE_START_PROCESS_ENERGY);
                break;
            }

            let harvestStateMemory = getStateMemory(creep, WORKER_STATE_HARVEST);

            let source = Game.getObjectById(harvestStateMemory.sourceId)!;

            if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            break;

        case WORKER_STATE_TRANSFER:
            console.log(creep.name, 'STATE: TRANSFER');

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                setState(creep, WORKER_STATE_START_HARVEST);
                break;
            }

            let transferStateMemory = getStateMemory(creep, WORKER_STATE_TRANSFER);

            let structure = Game.getObjectById(transferStateMemory.structureId)!;

            switch (creep.transfer(structure, RESOURCE_ENERGY)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffaa00'}});
                    break;

                case ERR_FULL:
                    setState(creep, WORKER_STATE_START_PROCESS_ENERGY);
                    break;
            }
            break;

        case WORKER_STATE_START_PROCESS_ENERGY:
            console.log(creep.name, 'STATE: START PROCESS ENERGY');

            let possibleTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if (possibleTargets.length > 0) {
                setState(creep, WORKER_STATE_TRANSFER, { structureId: possibleTargets[0].id });
            }
            else {
                setState(creep, WORKER_STATE_TRANSFER, { structureId: creep.room.controller!.id });
            }
            break;
    }
}
