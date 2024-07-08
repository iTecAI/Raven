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
import { useCallback, useContext, useEffect, useState } from "react";
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
import {
    ApiMethods,
    AuthMixin,
    BaseApi,
    ScopeMixin,
    ResourceMixin,
    PluginMixin,
} from "./methods";
export { AuthMixin, ScopeMixin, ResourceMixin, PluginMixin };
import { UnionToIntersection, ValuesType } from "utility-types";
import { useCustomCompareMemo } from "use-custom-compare";
import { difference, eq, uniqueId } from "lodash";

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

export function useApi<TMixins extends ApiMethods<any, any>[]>(
    ...mixins: TMixins
): {
    state: ApiContextType["state"];
    auth: AuthState | null;
    methods: typeof BaseApi &
        UnionToIntersection<ReturnType<ValuesType<TMixins>>["prototype"]>;
} {
    const context = useApiContext();
    const constructedMethods = useCustomCompareMemo(
        () => {
            return new (mixins.reduce((prev, cur) => cur(prev), BaseApi))(
                context,
                uniqueId()
            );
        },
        [context, mixins],
        ([prevContext, prevMixins], [nextContext, nextMixins]) => {
            const prevNames = prevMixins.map((v) => v.name);
            const nextNames = nextMixins.map((v) => v.name);
            if (difference(prevNames, nextNames).length > 0) {
                return false;
            }

            if (prevContext.state === nextContext.state) {
                switch (nextContext.state) {
                    case "error":
                        return true;
                    case "loading":
                        return true;
                    case "ready":
                        if (prevContext.state === "ready") {
                            if (
                                nextContext.auth.user?.id !==
                                prevContext.auth.user?.id
                            ) {
                                return false;
                            }

                            if (
                                nextContext.auth.session.id !==
                                    prevContext.auth.session.id ||
                                nextContext.auth.session.user_id !==
                                    prevContext.auth.session.user_id
                            ) {
                                return false;
                            }

                            if (!eq(nextContext.request, prevContext.request)) {
                                return false;
                            }

                            if (!eq(nextContext.reload, prevContext.reload)) {
                                return false;
                            }

                            return true;
                        }
                        return false;
                }
            } else {
                return false;
            }
        }
    );

    return {
        state: context.state,
        auth: context.state === "ready" ? context.auth : null,
        methods: constructedMethods as any,
    };
}

export function useScopeMatch(...scopes: string[]): {
    [key: string]: boolean | null;
} {
    const scopeCheck = scopes.join(":");
    const [result, setResult] = useState<{ [key: string]: boolean }>(
        scopes.reduce((prev, cur) => ({ ...prev, [cur]: null }), {})
    );
    const api = useApi(ScopeMixin);

    useEffect(() => {
        if (api.auth?.user?.id) {
            if (api.auth.user.admin) {
                setResult(
                    scopes.reduce((prev, cur) => ({ ...prev, [cur]: true }), {})
                );
                return;
            }
            api.methods.validate_scopes(...scopes).then((v) =>
                setResult(
                    Object.entries(v).reduce(
                        (prev, [crKey, crVal]) => ({
                            ...prev,
                            [crKey]: crVal === null ? null : crVal.length > 0,
                        }),
                        {}
                    )
                )
            );
        } else {
            setResult(
                scopes.reduce((prev, cur) => ({ ...prev, [cur]: null }), {})
            );
        }
    }, [scopeCheck, api.auth?.user?.id, api.state]);

    return result;
}

export function useScoped(scopes: string[], all?: boolean): boolean {
    const matched = Object.values(useScopeMatch(...scopes)).filter(
        (v) => v === null || v === true
    );
    if (all) {
        return matched.length === scopes.length;
    } else {
        return matched.length > 0;
    }
}
