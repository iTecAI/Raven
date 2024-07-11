import { ReactNode, useEffect, useMemo } from "react";
import { useApi } from "../api";
import { EventContext } from "./types";

class EventManager {
    public subscriptions: { [key: string]: (event: Event) => void };
    private socket: WebSocket | null;

    public constructor() {
        this.subscriptions = {};
        this.socket = null;
    }

    public get connected(): boolean {
        if (this.socket === null) {
            return false;
        }

        return this.socket.readyState === WebSocket.OPEN;
    }

    public handleEvent(event: MessageEvent) {
        console.log(this);
        console.log(event);
    }

    public connect() {
        if (this.connected) {
            this.socket?.close();
        }

        this.socket = new WebSocket(`wss://${location.host}/api/events/ws`);
        this.socket.addEventListener("message", this.handleEvent.bind(this));
    }

    public disconnect() {
        if (this.connected) {
            this.socket?.close();
        }

        this.socket = null;
    }
}

export function EventsProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const api = useApi();
    const manager = useMemo(() => {
        return new EventManager();
    }, []);

    useEffect(() => {
        if (api.state === "ready" && api.auth?.session) {
            manager.connect();
        } else {
            manager.disconnect();
        }
    }, [api.state, api.auth?.session.id]);

    return (
        <EventContext.Provider
            value={{
                subscribe: () => {},
                unsubscribe: () => {},
            }}
        >
            {children}
        </EventContext.Provider>
    );
}
