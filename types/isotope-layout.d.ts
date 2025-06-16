declare module 'isotope-layout' {
  interface IsotopeOptions {
    layoutMode?: string;
    itemSelector?: string;
    percentPosition?: boolean;
    masonry?: {
      columnWidth?: string | number;
      gutter?: string | number;
    };
    getSortData?: {
      [key: string]: string | ((itemElem: HTMLElement) => number | string);
    };
    sortBy?: string;
    sortAscending?: boolean;
    filter?: string | ((itemElem: HTMLElement) => boolean);
    transitionDuration?: number | string;
    hiddenStyle?: object;
    visibleStyle?: object;
    [key: string]: any;
  }

  class Isotope {
    constructor(element: HTMLElement, options?: IsotopeOptions);
    
    arrange(options?: { filter?: string; sortBy?: string }): void;
    layout(): void;
    reloadItems(): void;
    destroy(): void;
    insert(elements: Element | Element[]): void;
    remove(elements: Element | Element[]): void;
    stamp(elements: Element | Element[]): void;
    unstamp(elements: Element | Element[]): void;
    getFilteredItemElements(): HTMLElement[];
    getItemElements(): HTMLElement[];
    appended(elements: HTMLElement | HTMLElement[]): void;
    prepended(elements: HTMLElement | HTMLElement[]): void;
    addItems(elements: HTMLElement | HTMLElement[]): void;
    
    on(eventName: string, listener: Function): void;
    off(eventName: string, listener: Function): void;
    once(eventName: string, listener: Function): void;
    
    static data(element: HTMLElement): Isotope | undefined;
  }

  export default Isotope;
}