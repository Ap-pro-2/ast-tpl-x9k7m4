/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '@unpic/astro' {
    import type { HTMLAttributes } from 'astro/types';
    
    export interface ImageProps extends Omit<HTMLAttributes<'img'>, 'src' | 'width' | 'height'> {
      src: string;
      alt: string;
      width?: number;
      height?: number;
      layout?: 'constrained' | 'fullWidth' | 'fixed';
      placeholder?: 'blurhash' | 'none' | 'dominantColor' | 'lqip';
      priority?: boolean;
      background?: string;
      aspectRatio?: number;
    }
    
    export const Image: (props: ImageProps) => any;
    export const Source: (props: any) => any;
  }