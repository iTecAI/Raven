import { AuthState } from "../../../types/backend/auth";
import { ApiContextType, ApiRequestOptions, ApiResponse } from "../types";

export class BaseApi {
    public constructor(
        public apiContext: ApiContextType,
        public instanceId: string
    ) {}

    public async request<T = any>(
        endpoint: string,
        options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        if (this.apiContext.state === "ready") {
            return await this.apiContext.request<T>(endpoint, options);
        } else {
            return {
                success: false,
                statusCode: 0,
                statusText: "API not active.",
                data: null,
            };
        }
    }

    public async reload(): Promise<AuthState | null> {
        if (this.apiContext.state === "loading") {
            return null;
        } else {
            return await this.apiContext.reload();
        }
    }

    public get state(): "loading" | "ready" | "error" {
        return this.apiContext.state;
    }

    public get auth(): AuthState | null {
        if (this.apiContext.state === "ready") {
            return this.apiContext.auth;
        } else {
            return null;
        }
    }
}

export type Constructor<T extends object> = new (...args: any[]) => T;
export type MixinConstructor = Constructor<BaseApi>;
export type ApiMethods<
    TBase extends MixinConstructor,
    TMixin extends BaseApi
> = (base: TBase) => TMixin;
