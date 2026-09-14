const store = new Map();

function createMMKV() {
  return {
    set: (key, value) => store.set(key, value),
    getString: (key) => store.get(key),
    getBoolean: (key) => store.get(key),
    getNumber: (key) => store.get(key),
    remove: (key) => store.delete(key),
    contains: (key) => store.has(key),
    getAllKeys: () => Array.from(store.keys()),
    clearAll: () => store.clear(),
  };
}

module.exports = { createMMKV };
