// useCountUp — animates a number from 0 to `target` over `duration` ms.
// Uses requestAnimationFrame for smooth, jank-free animation.
// Respects prefers-reduced-motion — returns target immediately if motion is off.
'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
    target: number;
    duration?: number;   // ms — default 800
    decimals?: number;   // decimal places to display — default 0
    enabled?: boolean;   // start animation — default true
}

/**
 * Animates a numeric value from 0 to `target` using rAF.
 * Returns the current display value as a number.
 */
export function useCountUp({
    target,
    duration = 800,
    decimals = 0,
    enabled = true,
}: UseCountUpOptions): number {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) return;

        // Respect reduced-motion preference — skip animation entirely
        const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced) {
            setValue(target);
            return;
        }

        startRef.current = null;

        const step = (timestamp: number) => {
            if (startRef.current === null) startRef.current = timestamp;

            const elapsed = timestamp - startRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic — fast start, smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = parseFloat((eased * target).toFixed(decimals));

            setValue(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration, decimals, enabled]);

    return value;
}
