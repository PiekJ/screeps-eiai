const logs = new Map<string, string[]>();

export function appendLog(object: RoomObject | string, log: string): void {
  let logGroupKey = null;

  if (object instanceof RoomObject) {
    if ("name" in object) {
      logGroupKey = object["name"];
    } else {
      logGroupKey = typeof object;
    }
  } else {
    logGroupKey = object;
  }

  if (logs.has(logGroupKey)) {
    logs.get(logGroupKey)?.push(log);
  } else {
    logs.set(logGroupKey, [log]);
  }
}

export function printLogs(): void {
  logs.forEach((logs, logGroupKey) => {
    console.log(logGroupKey, logs.join(" "));
  });
  logs.clear();
}
