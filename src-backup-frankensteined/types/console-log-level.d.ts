declare module 'console-log-level' {
  interface Logger {
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    fatal(...args: any[]): void;
  }

  interface Options {
    level?: string;
    prefix?: string | ((level: string) => string);
  }

  function consoleLogLevel(options?: Options): Logger;
  export = consoleLogLevel;
}
