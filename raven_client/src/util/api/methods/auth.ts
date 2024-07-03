import { User } from "../../../types/backend/auth";
import { data } from "../types";
import { MixinConstructor } from "./base";

export function AuthMixin<TBase extends MixinConstructor>(base: TBase) {
    return class AuthMethods extends base {
        public async login(
            username: string,
            password: string
        ): Promise<User | null> {
            const result = data(
                await this.request<User>("/auth/login", {
                    method: "post",
                    body: { username, password },
                })
            );
            if (result) {
                await this.reload();
            }
            return result;
        }
    };
}
