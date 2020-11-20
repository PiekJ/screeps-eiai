const logs = new Map<string, string[]>();

export function appendLog(roomObject: RoomObject, log: string) {
  let logGroupKey = null;

  if ('name' in roomObject) {
    logGroupKey = roomObject['name'];
  }
  else {
    logGroupKey = typeof roomObject;
  }

  if (logs.has(logGroupKey)) {
    logs.get(logGroupKey)?.push(log);
  }
  else {
    logs.set(logGroupKey, [log]);
  }
}

export function printLogs() {
  logs.forEach((logs, logGroupKey) => {
    console.log(logGroupKey, logs);
  });
  logs.clear();
}
