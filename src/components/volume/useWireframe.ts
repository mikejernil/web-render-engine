import { useEffect, useState } from 'react';

const TYPING_FIELDS = 'input, textarea, select, [contenteditable]';

/**
 * Wireframe on/off, also flipped by the W key.
 * @param listenForKey Whether the W key is listened to.
 * @returns The wireframe state and its setter.
 */
export const useWireframe = (listenForKey: boolean) => {

    // Flip wireframe on W, unless typing in a field or holding a modifier key.
    useEffect(() => {
        if (!listenForKey) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'w' || event.repeat) return;
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.target instanceof Element && event.target.closest(TYPING_FIELDS)) return;

            setWireframe((on) => !on);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [listenForKey]);

    return [wireframe, setWireframe] as const;
};
