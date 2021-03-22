import 'whatwg-fetch';


export interface AuthRequest extends Request {};
export interface AuthRequestOptions extends RequestInit {
  url: string;
};
export interface AuthResponse extends Response {};
export type AuthHttp = typeof fetch;
