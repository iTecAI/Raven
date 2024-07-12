import { createContext } from "react";
import { Resource } from "../../types/backend/resource";

export type ResourceContextType = Resource[];
export const ResourceContext = createContext<ResourceContextType>([]);
