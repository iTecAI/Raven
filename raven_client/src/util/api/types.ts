import { createContext } from "react";
import { AuthState } from "../../types/backend/auth";

export type ApiSuccess<T = any> = {
    success: true;
    data: T;
};

export type ApiError = {
    success: false;
    statusCode: number;
    statusText: string;
    data: any;
};

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export function data<T, TError = null>(
    response: ApiResponse<T>,
    onFailure?: TError
): T | TError {
    if (response.success) {
        return response.data;
    } else {
        return onFailure === undefined ? (null as any) : onFailure;
    }
}

export type ApiRequestOptions = (
    | {
          method: "get" | "delete" | undefined;
      }
    | {
          method: "post" | "put" | "patch";
          body?: any;
      }
) & {
    params?: { [key: string]: any };
};

export type ApiRequestFunction<T = any> = (
    endpoint: string,
    options?: ApiRequestOptions
) => Promise<ApiResponse<T>>;

export type ApiReloadFunction = () => Promise<AuthState | null>;

export type ApiContextType =
    | {
          state: "loading";
      }
    | {
          state: "ready";
          request: ApiRequestFunction;
          reload: ApiReloadFunction;
          auth: AuthState;
      }
    | {
          state: "error";
          reason: string;
          reload: ApiReloadFunction;
      };

export const ApiContext = createContext<ApiContextType>({
    state: "error",
    reason: "Context not initialized.",
    reload: async () => null,
});
