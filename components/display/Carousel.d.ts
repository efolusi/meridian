export interface CarouselApi {
  canScrollNext(): boolean;
  canScrollPrev(): boolean;
  containerNode(): HTMLElement | null;
  destroy(): void;
  off(event: string, callback: (api: CarouselApi) => void): CarouselApi;
  on(event: string, callback: (api: CarouselApi) => void): CarouselApi;
  reInit(): void;
  rootNode(): HTMLElement | null;
  scrollNext(): void;
  scrollPrev(): void;
  scrollSnapList(): number[];
  scrollTo(index: number): void;
  selectedScrollSnap(): number;
  slideNodes(): HTMLElement[];
}
export interface CarouselOptions { align?: 'start' | 'center' | 'end'; loop?: boolean; direction?: 'ltr' | 'rtl'; }
export interface CarouselPlugin { init?(api: CarouselApi): void; destroy?(): void; }
export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> { orientation?: 'horizontal' | 'vertical'; opts?: CarouselOptions; plugins?: CarouselPlugin[]; setApi?: (api: CarouselApi | undefined) => void; }
export declare const Carousel: React.ForwardRefExoticComponent<CarouselProps & React.RefAttributes<HTMLDivElement>>;
export declare const CarouselContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CarouselItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CarouselPrevious: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const CarouselNext: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
