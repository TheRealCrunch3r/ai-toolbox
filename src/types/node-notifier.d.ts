declare module 'node-notifier' {
  export interface NotifyOptions {
    title?: string;
    msg?: string;
    sound?: boolean | string;
    icon?: string;
    [key: string]: unknown;
  }

  export function notify(options: NotifyOptions): string | number;
  export default notify;
}
