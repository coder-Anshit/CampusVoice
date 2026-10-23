const controllers = new Map();

export function createRequestSignal(key) {
  controllers.get(key)?.abort();
  const controller = new AbortController();
  controllers.set(key, controller);
  return controller.signal;
}

export function releaseRequestSignal(key, signal) {
  if (controllers.get(key)?.signal === signal) controllers.delete(key);
}

export function cancelRequest(key) {
  controllers.get(key)?.abort();
  controllers.delete(key);
}

export function cancelAllRequests() {
  controllers.forEach((controller) => controller.abort());
  controllers.clear();
}
