declare module 'wowjs' {
  interface WOWOptions {
    boxClass?: string;
    animateClass?: string;
    offset?: number;
    mobile?: boolean;
    live?: boolean;
    callback?: (box: Element) => void;
    scrollContainer?: string | null;
    resetAnimation?: boolean;
  }

  export class WOW {
    constructor(options?: WOWOptions);
    init(): void;
    sync(): void;
  }
} 