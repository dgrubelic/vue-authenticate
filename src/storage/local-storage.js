class LocalStorage {
  constructor(namespace) {
    this.namespace = namespace || null
  }

  setItem(key, value) {
    window.localStorage.setItem(this._getStorageKey(key), value)
  }

  getItem(key) {
    return window.localStorage.getItem(this._getStorageKey(key))
  }

  removeItem(key) {
    window.localStorage.removeItem(this._getStorageKey(key))
  }

  _getStorageKey(key) {
    if (this.namespace) {
      return [this.namespace, key].join('.')
    }
    return key;
  }
}

export default LocalStorage