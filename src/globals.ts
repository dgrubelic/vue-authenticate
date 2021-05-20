const fakeDocument = {
  createElement() { },
};

const fakeWindow = {
  atob: (): string => '',
  open: (): string => '',
  cordova: null,
  location: {
    hostname: '',
    origin: '',
  },
  localStorage: {
    setItem() { },
    getItem() { },
    removeItem() { },
  },
  sessionStorage: {
    setItem() { },
    getItem() { },
    removeItem() { },
  },
};

export const $document = (typeof document !== undefined)
  ? document
  : fakeDocument;

export const $window = (typeof window !== undefined)
  ? window
  : fakeWindow;
