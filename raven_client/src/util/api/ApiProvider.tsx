import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AuthState } from "../../types/backend/auth";
import axios, { AxiosError } from "axios";
import { ApiContext, ApiRequestOptions, ApiResponse, data } from "./types";

export function ApiProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const [authState, setAuthState] = useState<AuthState | null>(null);
    const [error, setError] = useState<string | null>(null);

    const instance = useMemo(
        () =>
            axios.create({
                baseURL: `https://${window.location.host}/api/`,
                timeout: 5000,
            }),
        []
    );

    const request = useCallback(
        async <T = any,>(
            endpoint: string,
            options?: ApiRequestOptions
        ): Promise<ApiResponse<T>> => {
            try {
                const response = await instance.request({
                    url: endpoint,
                    method: options?.method ?? "get",
                    params: options?.params,
                    data:
                        options &&
                        (options.method === "patch" ||
                            options.method === "post" ||
                            options.method === "put")
                            ? options.body
                            : undefined,
                });
                return {
                    success: true,
                    data: response.data,
                };
            } catch (e: any) {
                const error: AxiosError = e;

                if (error.response) {
                    return {
                        success: false,
                        statusCode: error.response.status,
                        statusText: error.response.statusText,
                        data: error.response.data,
                    };
                } else if (error.request) {
                    return {
                        success: false,
                        statusCode: 0,
                        statusText: error.message,
                        data: error.request,
                    };
                } else {
                    return {
                        success: false,
                        statusCode: 0,
                        statusText: error.message,
                        data: error.cause,
                    };
                }
            }
        },
        [instance]
    );

    const reload = useCallback(async (): Promise<AuthState | null> => {
        const state = await request<AuthState>("/");
        if (state.success) {
            setAuthState(state.data);
            setError(null);
        } else {
            setAuthState(null);
            setError(state.statusText);
        }
        return data(state);
    }, [request, setError, setAuthState]);

    useEffect(() => {
        reload();
    }, [reload]);

    return (
        <ApiContext.Provider
            value={
                authState
                    ? { state: "ready", request, reload, auth: authState }
                    : error
                    ? { state: "error", reload, reason: error }
                    : { state: "loading" }
            }
        >
            {children}
        </ApiContext.Provider>
    );
}
