import { Resource } from "../../../types/backend/resource";
import { data } from "../types";
import { MixinConstructor } from "./base";

export function ResourceMixin<TBase extends MixinConstructor>(base: TBase) {
    return class ResourceMethods extends base {
        public async list_resources(): Promise<Resource[]> {
            return data(await this.request<Resource[]>("/resources"), []);
        }
    };
}
