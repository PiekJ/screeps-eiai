export class RoomSourceManager {
  private static roomSourceManagerInstances: Map<string, RoomSourceManager>;

  private static harvesterToContainerCache: Map<string, HarvesterToContainerMap>;

  private get harvesterToContainer(): HarvesterToContainerMap {
    if (RoomSourceManager.harvesterToContainerCache.has(this.room.name)) {
      return RoomSourceManager.harvesterToContainerCache.get(this.room.name)!;
    }

    const cache = {};

    RoomSourceManager.harvesterToContainerCache.set(this.room.name, cache);

    return cache;
  }

  private get energySourceToHarvester(): EnergySourceToHarvesterMap {
    return this.room.memory.energySourceToHarvester;
  }

  private set energySourceToHarvester(value: EnergySourceToHarvesterMap) {
    this.room.memory.energySourceToHarvester = value;
  }

  private constructor(private room: Room) {
    if (!this.energySourceToHarvester) {
      this.energySourceToHarvester = room
        .find(FIND_SOURCES_ACTIVE)
        .map(source => source.id)
        .reduce((result, sourceId) => ({ ...result, [sourceId]: null }), {});
    }
  }

  public performTick() {
    // not sure what to do here :thinking:
  }

  public assignHarvesterToSource(creep: Creep): Source {
    const sourceIdForCreep = Object.keys(this.energySourceToHarvester).find(
      sourceId => this.energySourceToHarvester[sourceId] === creep.id
    ) as Id<Source> | undefined;

    if (sourceIdForCreep) {
      return Game.getObjectById(sourceIdForCreep)!;
    }

    const possibleSourceId = Object.keys(this.energySourceToHarvester).find(sourceId => {
      const creepId = this.energySourceToHarvester[sourceId];

      return creepId === null || !Game.getObjectById(creepId);
    }) as Id<Source> | undefined;

    if (possibleSourceId) {
      this.energySourceToHarvester[possibleSourceId] = creep.id;

      return Game.getObjectById(possibleSourceId)!;
    }

    throw `Unable to assign source to harvester: ${creep.name}`;
  }

  public locateContainerForHarvester(creep: Creep): StructureContainer | undefined {
    const containerFromCache = this.harvesterToContainer[creep.id];
    if (containerFromCache) {
      const result = Game.getObjectById(containerFromCache);

      if (result) {
        return result;
      }
    }

    const closestContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_CONTAINER
    }) as StructureContainer | null;

    if (closestContainer === null || Object.values(this.harvesterToContainer).includes(closestContainer.id)) {
      return undefined;
    }

    this.harvesterToContainer[creep.id] = closestContainer.id;

    return closestContainer;
  }

  public locateContainerForWorker(): StructureContainer | undefined {
    const possibleContainers = this.room.find(FIND_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_CONTAINER
    }) as StructureContainer[];

    if (possibleContainers.length === 0) {
      return undefined;
    }

    possibleContainers.sort(
      (a, b) => b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY)
    );

    return possibleContainers[0];
  }

  public static initialize(): void {
    this.roomSourceManagerInstances = new Map<string, RoomSourceManager>();
    this.harvesterToContainerCache = new Map<string, HarvesterToContainerMap>();
  }

  public static forRoom(room: Room): RoomSourceManager {
    if (this.roomSourceManagerInstances.has(room.name)) {
      return this.roomSourceManagerInstances.get(room.name)!;
    }

    const roomSourceManager = new RoomSourceManager(room);

    this.roomSourceManagerInstances.set(room.name, roomSourceManager);

    return roomSourceManager;
  }
}
