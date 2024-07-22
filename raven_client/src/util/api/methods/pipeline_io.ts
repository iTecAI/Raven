import { IOFieldTypes, PipelineDataIO, PipelineIO, PipelineTriggerIO } from "../../../types/backend/pipeline";
import { data } from "../types";
import { MixinConstructor } from "./base";

interface IOBase {
    name: string;
    icon: string | null;
    description: string | null;
}

export interface DataIOModel extends IOBase {
    type: "data";
    fields: Omit<IOFieldTypes, "value" | "rgb" | "hls" | "hsv">[];
}

export interface TriggerIOModel extends IOBase {
    type: "trigger";
}

export function PipelineIOMixin<TBase extends MixinConstructor>(base: TBase) {
    return class PipelineIOMethods extends base {
        public async all_io(): Promise<PipelineIO[]> {
            return data(await this.request<PipelineIO[]>("/pipelines/io"), []);
        }

        public async trigger_io(): Promise<PipelineTriggerIO[]> {
            return data(await this.request<PipelineTriggerIO[]>("/pipelines/io/triggers"), []);
        }

        public async data_io(): Promise<PipelineDataIO[]> {
            return data(await this.request<PipelineDataIO[]>("/pipelines/io/data"), []);
        }

        public async get_io(id: string): Promise<PipelineIO | null> {
            return data(await this.request<PipelineIO>(`/pipelines/io/${id}`), null);
        }

        public async create_trigger_io(model: TriggerIOModel): Promise<PipelineTriggerIO | null> {
            return data(await this.request<PipelineTriggerIO>("/pipelines/io/triggers", {method: "post", body: model}), null);
        }

        public async create_data_io(model: DataIOModel): Promise<PipelineDataIO | null> {
            return data(await this.request<PipelineDataIO>("/pipelines/io/data", {method: "post", body: model}), null);
        }
    };
}
