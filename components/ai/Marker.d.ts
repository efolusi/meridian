import * as React from 'react';

export type MarkerVariant = 'default' | 'border' | 'separator';

export interface MarkerStyleOptions {
  variant?: MarkerVariant;
  className?: string;
}

export interface MarkerProps extends React.HTMLAttributes<HTMLElement> {
  /** Layout treatment. @default 'default' */
  variant?: MarkerVariant;
  /** Replace the default root with an element or render function. */
  render?: React.ReactElement | ((props: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }) => React.ReactElement);
}

export declare function markerVariants(options?: MarkerStyleOptions): string;
export declare const Marker: React.ForwardRefExoticComponent<
  MarkerProps & React.RefAttributes<HTMLElement>
>;
export declare const MarkerIcon: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>
>;
export declare const MarkerContent: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>
>;
