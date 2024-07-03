import {
    data,
    ApiContext,
    ApiContextType,
    ApiError,
    ApiReloadFunction,
    ApiRequestFunction,
    ApiRequestOptions,
    ApiResponse,
    ApiSuccess,
} from "./types";
import { ApiProvider } from "./ApiProvider";
import { useCallback, useContext } from "react";
import { AuthState } from "../../types/backend/auth";

export { data, ApiProvider, ApiContext };
export type {
    ApiContextType,
    ApiError,
    ApiReloadFunction,
    ApiRequestFunction,
    ApiRequestOptions,
    ApiResponse,
    ApiSuccess,
};

export function useApiContext(): ApiContextType {
    return useContext(ApiContext);
}

export function useApiState(): "loading" | "ready" | "error" {
    return useApiContext().state;
}

export function useApiRequest(): ApiRequestFunction {
    const context = useApiContext();
    const dummyRequest = useCallback(
        async () => ({
            success: false,
            statusCode: 0,
            statusText: "API not active.",
            data: null,
        }),
        []
    );
    if (context.state === "ready") {
        return context.request;
    } else {
        return dummyRequest;
    }
}

export function useApiReload(): ApiReloadFunction {
    const context = useApiContext();
    const dummyReload = useCallback(async () => null, []);
    return context.state === "loading" ? dummyReload : context.reload;
}

export function useAuthState(): AuthState | null {
    const context = useApiContext();
    return context.state === "ready" ? context.auth : null;
}
