/**
 * EventBus — Lightweight Pub/Sub Messaging Pattern
 */
export const eventBus = (() => {
  const listeners = {};
  return {
    on(event, handler) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    off(event, handler) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(h => h !== handler);
    },
    emit(event, payload) {
      if (!listeners[event]) return;
      listeners[event].forEach(handler => handler(payload));
    }
  };
})();
