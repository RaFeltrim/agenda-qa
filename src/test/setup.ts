import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock window.matchMedia for Ant Design components in jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver for Ant Design
class MockResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
(window as any).ResizeObserver = MockResizeObserver;

// Mock getComputedStyle for Ant Design
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
    try {
        return originalGetComputedStyle(elt, pseudoElt);
    } catch {
        return {} as CSSStyleDeclaration;
    }
};

// Clean up after each test
afterEach(() => {
    cleanup();
});
