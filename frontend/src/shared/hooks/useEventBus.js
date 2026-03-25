import { useEffect } from 'react';
import { eventBus } from '../../core/EventBus';

/**
 * Custom hook to easily subscribe to EventBus events within React components.
 * Automatically handles unsubscription on unmount.
 *
 * @param {string} eventName - Name of the event to listen to
 * @param {function} callback - Function to run when event is emitted
 */
export function useEventBus(eventName, callback) {
    useEffect(() => {
        const unsubscribe = eventBus.on(eventName, callback);
        return () => {
            unsubscribe();
        };
    }, [eventName, callback]);
}
