// Animates a number from 0 to the target value over a given duration.
// Used on stat cards so numbers count up on mount — gives the admin
// immediate visual confirmation that data has loaded.
// Respects prefers-reduced-motion — returns the final value instantly
// when the user has requested reduced motion.
'use client';

import { useState, useEffect, useRef } from 'react';

export function useCountUp(
    target: number,
    duration: number = 800,
): number {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        // Respect reduced motion preference — no animation
        const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced || target === 0) {
            rafRef.current = requestAnimationFrame(() => setValue(target));
            return;
        }

        startTimeRef.current = 0;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
                setValue(0);
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic — fast start, slow finish
            const eased = 1 - Math.pow(1 - progress, 3);

            setValue(Math.floor(eased * target));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setValue(target);
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return value;
}
