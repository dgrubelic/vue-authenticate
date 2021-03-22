const fakeDocument = {
  createElement() { },
};

const fakeWindow = {
  atob() { },
  open() { },
  location: {},
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
