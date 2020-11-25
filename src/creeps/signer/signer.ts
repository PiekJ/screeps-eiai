import { recycleCreep, signController } from "creeps/common";
import { performCreepWorkerTick } from "creeps/worker/worker";
import { appendLog } from "utils/Logger";

export const SIGNER_STATE_UNKNOWN: SIGNER_STATE_UNKNOWN = 0;
export const SIGNER_STATE_CHECK_FLAGS: SIGNER_STATE_CHECK_FLAGS = 1;
export const SIGNER_STATE_SIGN: SIGNER_STATE_SIGN = 2;
export const SIGNER_STATE_FIND_SPAWNER_RECYCLE: SIGNER_STATE_FIND_SPAWNER_RECYCLE = 3;
export const SIGNER_STATE_RECYCLE: SIGNER_STATE_RECYCLE = 4;

function getStateMemory<K extends SignerStateConstant>(creep: Creep, state: K): SignerStateMemoryTypes[K] {
  return creep.memory.data;
}

function setState<K extends SignerStateConstant>(creep: Creep, state: K, data?: SignerStateMemoryTypes[K]) {
  creep.memory.state = state;
  creep.memory.data = data;
}

export function performCreepSignerTick(creep: Creep): void {
  if (!creep.memory.state) {
    setState(creep, SIGNER_STATE_UNKNOWN);
  }

  switch (creep.memory.state) {
    case SIGNER_STATE_UNKNOWN:
      appendLog(creep, "UNKNOWN");
      setState(creep, SIGNER_STATE_CHECK_FLAGS);
      performCreepSignerTick(creep);
      break;

    case SIGNER_STATE_CHECK_FLAGS:
      appendLog(creep, "CHECK-FLAGS");

      for (const flagName in Game.flags) {
        const flag = Game.flags[flagName];

        if (flag.color === COLOR_WHITE) {
          setState(creep, SIGNER_STATE_SIGN, {
            controllerId: flag.room?.controller?.id!,
            text: flagName
          });
          performCreepSignerTick(creep);
          break;
        }
      }

      setState(creep, SIGNER_STATE_FIND_SPAWNER_RECYCLE);
      performCreepSignerTick(creep);
      break;

    case SIGNER_STATE_SIGN:
      appendLog(creep, "SIGN");

      const signStateMemory = getStateMemory(creep, SIGNER_STATE_SIGN);

      const controller = Game.getObjectById(signStateMemory.controllerId)!;

      if (signController(creep, controller, signStateMemory.text)) {
        setState(creep, SIGNER_STATE_FIND_SPAWNER_RECYCLE);
      }
      break;

    case SIGNER_STATE_FIND_SPAWNER_RECYCLE:
      appendLog(creep, "FIND-SPAWNER-RECYCLE");

      setState(creep, SIGNER_STATE_RECYCLE, {
        spawnerId: Game.spawns["MobSpawner"].id
      });
      break;

    case SIGNER_STATE_RECYCLE:
      appendLog(creep, "RECYCLE");

      const recycleStateMemory = getStateMemory(creep, SIGNER_STATE_RECYCLE);

      const spawner = Game.getObjectById(recycleStateMemory.spawnerId)!;

      recycleCreep(creep, spawner);
      break;
  }
}
