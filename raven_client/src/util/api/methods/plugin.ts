import { PluginManifest } from "../../../types/backend/plugin";
import { data } from "../types";
import { MixinConstructor } from "./base";

export function PluginMixin<TBase extends MixinConstructor>(base: TBase) {
    return class PluginMethods extends base {
        public async list_plugins(): Promise<{
            [key: string]: PluginManifest;
        }> {
            return data(
                await this.request<{ [key: string]: PluginManifest }>(
                    "/plugins"
                ),
                {}
            );
        }

        public async get_plugin(name: string): Promise<PluginManifest | null> {
            return data(
                await this.request<PluginManifest>(`/plugins/${name}`),
                null
            );
        }
    };
}
