type SIGNER_STATE_UNKNOWN = 0;
type SIGNER_STATE_CHECK_FLAGS = 1;
type SIGNER_STATE_SIGN = 2;
type SIGNER_STATE_FIND_SPAWNER_RECYCLE = 3;
type SIGNER_STATE_RECYCLE = 4;

type SignerStateConstant =
  | WORKER_STATE_UNKNOWN
  | SIGNER_STATE_CHECK_FLAGS
  | SIGNER_STATE_SIGN
  | SIGNER_STATE_FIND_SPAWNER_RECYCLE
  | SIGNER_STATE_RECYCLE;

interface SignerStateMemoryTypes {
  [key: number]: SignStateMemory | RecycleStateMemory;
  2: SignStateMemory;
  4: RecycleStateMemory;
}

interface SignStateMemory {
  controllerId: Id<StructureController>;
  text: string;
}

interface RecycleStateMemory {
  spawnerId: Id<StructureSpawn>;
}
