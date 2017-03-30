import LocalStorage from './storage/local-storage.js'
import MemoryStorage from './storage/memory-storage.js'
import SessionStorage from './storage/session-storage.js'

export default function StorageFactory(options) {
  switch (options.storageType) {
    case 'localStorage':
      try {
        window.localStorage.setItem('testKey', 'test')
        window.localStorage.removeItem('testKey')
        return new LocalStorage(options.storageNamespace)
      } catch(e) {}

    case 'sessionStorage':
      try {
        window.sessionStorage.setItem('testKey', 'test')
        window.sessionStorage.removeItem('testKey')
        return new SessionStorage(options.storageNamespace)
      } catch(e) {}

    case 'memoryStorage': 
    default:
      return new MemoryStorage(options.storageNamespace)
      break;
  }
}