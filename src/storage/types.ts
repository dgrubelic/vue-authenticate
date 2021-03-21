export interface IStorage {
  namespace?: string;
  getItem: (key: string) => unknown;
  setItem: (key: string, value: unknown) => void;
  removeItem: (key: string) => void;
  _getStorageKey: (key: string) => string;
}

export interface ICookieStorageOptions {
  domain: string;
  expires: Date;
  path: string;
  secure: boolean;
}

export interface IStorageOptions {
  storageType?: string;
  storageNamespace?: string;
  cookieStorage?: ICookieStorageOptions;
}
