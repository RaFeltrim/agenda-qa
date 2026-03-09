/**
 * Type Augmentations for Ant Design Components
 * 
 * This file extends the type definitions to include common testing attributes
 * without using `as any` casts throughout the codebase.
 */

import 'react';

declare module 'react' {
    interface HTMLAttributes<T> {
        'data-testid'?: string;
    }
}

/**
 * Extended field props that include data-testid
 * Use this when standard FieldProps don't accept data-testid
 */
export interface TestableFieldProps {
    'data-testid'?: string;
    size?: 'small' | 'middle' | 'large';
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Helper type to merge standard props with testable props
 */
export type WithTestId<T> = T & { 'data-testid'?: string };
