import type * as React from 'react';
import type { DefaultLegendContentProps, DefaultTooltipContentProps, LegendProps, ResponsiveContainerProps, TooltipProps, TooltipValueType } from 'recharts';

export type ChartConfig = Record<string, { label?: React.ReactNode; icon?: React.ComponentType } & ({ color?: string; theme?: never } | { color?: never; theme: { light: string; dark: string } })>;
export declare function useChart(): { config: ChartConfig };
export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> { config: ChartConfig; children: ResponsiveContainerProps['children']; initialDimension?: { width: number; height: number } }
export declare const ChartContainer: React.ForwardRefExoticComponent<ChartContainerProps & React.RefAttributes<HTMLDivElement>>;
export declare function ChartStyle(props: { id: string; config: ChartConfig }): React.JSX.Element | null;
export declare function ChartTooltip(props: TooltipProps<any, any>): React.JSX.Element | null;
export interface ChartTooltipContentProps extends Omit<DefaultTooltipContentProps<TooltipValueType, string | number>, 'accessibilityLayer'> { active?: boolean; className?: string; hideLabel?: boolean; hideIndicator?: boolean; indicator?: 'line' | 'dot' | 'dashed'; nameKey?: string; labelKey?: string; color?: string }
export declare function ChartTooltipContent(props: ChartTooltipContentProps): React.JSX.Element | null;
export declare function ChartLegend(props: LegendProps): React.JSX.Element | null;
export interface ChartLegendContentProps extends DefaultLegendContentProps { className?: string; hideIcon?: boolean; nameKey?: string }
export declare function ChartLegendContent(props: ChartLegendContentProps): React.JSX.Element | null;
