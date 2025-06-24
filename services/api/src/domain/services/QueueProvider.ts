export type QueueProvider<T> = (queue: string, data: T) => Promise<void>;
