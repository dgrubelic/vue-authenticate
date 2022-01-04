import { App } from '@vue/runtime-core';
import { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';

export interface CookieStorageOptions {
  domain?: string;
  path?: string;
  secure?: boolean;
}

export interface ProviderOptions {
  name?: string;
  url?: string;
  clientId?: string;
  authorizationEndpoint?: string;
  redirectUri?: string;
  requiredUrlParams?: string[];
  defaultUrlParams?: string[];
  optionalUrlParams?: string[];
  scope?: string[];
  scopePrefix?: string;
  scopeDelimiter?: string;
  state?: string;
  display?: string;
  oauthType?: string;
  responseType?: string;
  responseParams?: {
    code?: string;
    clientId?: string;
    redirectUri?: string;
  };
  popupOptions?: {
    width: number;
    height: number;
  };
}

export declare class VueAuthenticate {
  login(user: Object): Promise<AxiosResponse>;
  login(
    user: Object,
    requestOptions: AxiosRequestConfig
  ): Promise<AxiosResponse>;
  isAuthenticated(): boolean;
  getToken(): string;
  setToken(token: string | object): void;
  register(
    user: any,
    requestOptions?: AxiosRequestConfig
  ): Promise<AxiosResponse>;
  logout(requestOptions?: AxiosRequestConfig): Promise<AxiosResponse>;
  authenticate(
    provider: string,
    userData: any,
    requestOptions?: AxiosRequestConfig
  ): Promise<{}>;
  link(
    provider: string,
    userData?: any,
    requestOptions?: AxiosRequestConfig
  ): Promise<{}>;
}

export const VueAuthenticatePlugin: (app: App, options?: AuthenticateOptions) => void;

export interface AuthenticateOptions {
  baseUrl?: string;
  axios?: AxiosInstance;
  tokenName?: string;
  tokenPrefix?: string;
  tokenHeader?: string;
  tokenType?: string;
  loginUrl?: string;
  registerUrl?: string;
  logoutUrl?: string;
  storageType?: string;
  storageNamespace?: string;
  cookieStorage?: CookieStorageOptions;
  requestDataKey?: string;
  responseDataKey?: string;
  withCredentials?: boolean;
  providers: { [key: string]: ProviderOptions };
}

export default VueAuthenticatePlugin;

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: VueAuthenticate;
  }
}
