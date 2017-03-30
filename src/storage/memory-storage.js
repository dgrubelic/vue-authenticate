class MemoryStorage {
  constructor(namespace) {
    this.namespace = namespace || null
    this._storage = {}
  }

  setItem(key, value) {
    this._storage[this._getStorageKey(key)] = value
  }

  getItem(key) {
    return this._storage[this._getStorageKey(key)]
  }

  removeItem(key) {
    delete this._storage[this._getStorageKey(key)]
  }

  _getStorageKey(key) {
    if (this.namespace) {
      return [this.namespace, key].join('.')
    }
    return key;
  }
}

export default MemoryStorage