// cortex/core/events.ts

type Listener<T = any> = (payload: T) => void | Promise<void>;

export class EventBus {
    private listeners: Map<string, Listener[]> = new Map();

    /**
     * Subscribe to an event
     */
    on<T = any>(event: string, listener: Listener<T>) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
    }

    /**
     * Emit an event (async safe)
     */
    async emit<T = any>(event: string, payload: T) {
        const listeners = this.listeners.get(event) || [];
        for (const listener of listeners) {
            await listener(payload);
        }
    }

    /**
     * Remove a listener
     */
    off<T = any>(event: string, listener: Listener<T>) {
        const listeners = this.listeners.get(event) || [];
        this.listeners.set(
            event,
            listeners.filter((l) => l !== listener)
        );
    }

    /**
     * Clear all listeners (useful on shutdown)
     */
    clear() {
        this.listeners.clear();
    }
}
