export interface QueueProvider<T> {
  send: (data: T) => Promise<void>;
}
