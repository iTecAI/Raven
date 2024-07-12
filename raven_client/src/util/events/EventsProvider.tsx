import { ReactNode, useEffect, useMemo } from "react";
import { useApi } from "../api";
import { Event, EventContext } from "./types";
import { isArray, omit, uniqueId } from "lodash";

class EventManager {
    public subscriptions: {
        [key: string]: { id: string; callback: (event: Event) => void }[];
    };
    private socket: WebSocket | null;
    public active: boolean;

    public constructor() {
        this.subscriptions = {};
        this.socket = null;
        this.active = false;
    }

    public get connected(): boolean {
        if (this.socket === null) {
            return false;
        }

        return this.socket.readyState === WebSocket.OPEN;
    }

    public handleEvent(event: MessageEvent) {
        const parsed: Event = JSON.parse(event.data);
        if (parsed.subscribers) {
            for (const sub of parsed.subscribers) {
                if (Object.keys(this.subscriptions).includes(sub)) {
                    this.subscriptions[sub].map((i) => i.callback(parsed));
                }
            }
        }
    }

    public connect() {
        if (this.connected) {
            this.socket?.close();
        }

        this.active = true;
        this.socket = new WebSocket(`wss://${location.host}/api/events/ws`);
        this.socket.addEventListener("message", this.handleEvent.bind(this));
        this.socket.addEventListener(
            "open",
            (() =>
                this.socket?.send(
                    JSON.stringify({
                        command: "subscriptions.add",
                        paths: Object.keys(this.subscriptions),
                    }),
                )).bind(this),
        );
        this.socket.addEventListener(
            "close",
            (() => {
                if (this.active) {
                    setTimeout((() => this.connect()).bind(this), 1000);
                }
            }).bind(this),
        );
    }

    public disconnect() {
        this.active = false;
        if (this.connected) {
            this.socket?.close();
        }

        this.socket = null;
    }

    public subscribe(
        channel: string,
        callback: (event: Event) => void,
    ): string {
        if (!isArray(this.subscriptions[channel])) {
            this.subscriptions[channel] = [];
        }
        const id = uniqueId();
        this.subscriptions[channel].push({ id, callback });
        if (this.connected) {
            this.socket?.send(
                JSON.stringify({
                    command: "subscriptions.add",
                    paths: [channel],
                }),
            );
        }
        return id;
    }

    public unsubscribe(...subscriptions: { channel: string; id: string }[]) {
        const unsubscribeFrom: string[] = [];
        for (const sub of subscriptions) {
            if (isArray(this.subscriptions[sub.channel])) {
                this.subscriptions[sub.channel] = this.subscriptions[
                    sub.channel
                ].filter((v) => v.id !== sub.id);
                if (this.subscriptions[sub.channel].length === 0) {
                    this.subscriptions = omit(this.subscriptions, sub.channel);
                    unsubscribeFrom.push(sub.channel);
                }
            }
        }

        if (this.connected && unsubscribeFrom.length > 0) {
            this.socket?.send(
                JSON.stringify({
                    command: "subscriptions.remove",
                    paths: unsubscribeFrom,
                }),
            );
        }
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
                subscribe: manager.subscribe.bind(manager),
                unsubscribe: manager.unsubscribe.bind(manager),
            }}
        >
            {children}
        </EventContext.Provider>
    );
}
