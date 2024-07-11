import { createContext } from "react";

export type Event<TData = any> = {
    id: string;
    source: string;
    type: string;
    channel: "global" | "session";
    data: TData;
    subscribers: string[];
};

export type EventContextType = {
    subscribe: <TData = any>(
        event: string,
        callback: (event: Event<TData>) => void,
    ) => void;
    unsubscribe: (...events: string[]) => void;
};

export const EventContext = createContext<EventContextType>({
    subscribe: () => {},
    unsubscribe: () => {},
});
