import { ExecutionTarget, Executor } from "../../../types/backend/executor";
import { Resource } from "../../../types/backend/resource";
import { data } from "../types";
import { MixinConstructor } from "./base";

export function ResourceMixin<TBase extends MixinConstructor>(base: TBase) {
    return class ResourceMethods extends base {
        public async list_resources(): Promise<Resource[]> {
            return data(await this.request<Resource[]>("/resources"), []);
        }

        public async get_executors_for_resource(
            ...resources: Resource[]
        ): Promise<Executor[]> {
            return data(
                await this.request<Executor[]>("/resources/executors", {
                    method: "post",
                    body: resources,
                }),
                [],
            );
        }

        public async get_resources_by_target(
            targets: (ExecutionTarget | ExecutionTarget[])[],
        ): Promise<Resource[]> {
            return data(
                await this.request<Resource[]>("/resources/filtered", {
                    method: "post",
                    body: targets,
                }),
                [],
            );
        }

        public async execute_on_resource(
            executor: Executor,
            args: { [key: string]: any },
            target: Resource,
        ): Promise<void> {
            await this.request<null>("/resources/execute", {
                method: "post",
                body: { target, executor, args },
            });
        }
    };
}
