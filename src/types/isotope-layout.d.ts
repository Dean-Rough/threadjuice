declare module 'isotope-layout' {
  interface IsotopeOptions {
    itemSelector?: string;
    layoutMode?: string;
    masonry?: {
      columnWidth?: number | string;
      gutter?: number | string;
    };
    fitRows?: {
      gutter?: number | string;
    };
    cellsByRow?: {
      columnWidth?: number;
      rowHeight?: number;
    };
    vertical?: {
      horizontalAlignment?: number;
    };
    packery?: {
      columnWidth?: number | string;
      rowHeight?: number | string;
      gutter?: number | string;
    };
    sortBy?: string;
    sortAscending?: boolean;
    filter?: string | ((itemElem: Element) => boolean);
    hiddenStyle?: { [key: string]: string | number };
    visibleStyle?: { [key: string]: string | number };
    transitionDuration?: string | number;
    stagger?: string | number;
    resize?: boolean;
    initLayout?: boolean;
    originLeft?: boolean;
    originTop?: boolean;
    containerStyle?: { [key: string]: string | number };
    percentPosition?: boolean;
    stamp?: string;
    isJQueryFiltering?: boolean;
    animationOptions?: {
      duration?: number;
      easing?: string;
      queue?: boolean;
    };
  }

  interface IsotopeInstance {
    arrange(options?: { filter?: string | ((itemElem: Element) => boolean) }): void;
    filter(filter: string | ((itemElem: Element) => boolean)): void;
    sort(sortBy: string, sortAscending?: boolean): void;
    updateSortData(): void;
    layout(): void;
    layoutItems(items: Element[], isStill?: boolean): void;
    stamp(elements: Element | Element[]): void;
    unstamp(elements: Element | Element[]): void;
    appended(elements: Element | Element[]): void;
    prepended(elements: Element | Element[]): void;
    addItems(elements: Element | Element[]): void;
    remove(elements: Element | Element[]): void;
    shuffle(): void;
    destroy(): void;
    reloadItems(): void;
    getItemElements(): Element[];
    getFilteredItemElements(): Element[];
    on(eventName: string, callback: (event: Event, ...args: any[]) => void): void;
    off(eventName: string, callback?: (event: Event, ...args: any[]) => void): void;
    once(eventName: string, callback: (event: Event, ...args: any[]) => void): void;
  }

  class Isotope implements IsotopeInstance {
    constructor(element: Element | string, options?: IsotopeOptions);
    
    arrange(options?: { filter?: string | ((itemElem: Element) => boolean) }): void;
    filter(filter: string | ((itemElem: Element) => boolean)): void;
    sort(sortBy: string, sortAscending?: boolean): void;
    updateSortData(): void;
    layout(): void;
    layoutItems(items: Element[], isStill?: boolean): void;
    stamp(elements: Element | Element[]): void;
    unstamp(elements: Element | Element[]): void;
    appended(elements: Element | Element[]): void;
    prepended(elements: Element | Element[]): void;
    addItems(elements: Element | Element[]): void;
    remove(elements: Element | Element[]): void;
    shuffle(): void;
    destroy(): void;
    reloadItems(): void;
    getItemElements(): Element[];
    getFilteredItemElements(): Element[];
    on(eventName: string, callback: (event: Event, ...args: any[]) => void): void;
    off(eventName: string, callback?: (event: Event, ...args: any[]) => void): void;
    once(eventName: string, callback: (event: Event, ...args: any[]) => void): void;
  }

  export = Isotope;
} 