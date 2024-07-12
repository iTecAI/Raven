import { createContext } from "react";

export type Event<TData = any> = {
    id: string;
    plugin: string | null;
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
    ) => string;
    unsubscribe: (...subscriptions: { channel: string; id: string }[]) => void;
};

export const EventContext = createContext<EventContextType>({
    subscribe: () => "",
    unsubscribe: () => {},
});
