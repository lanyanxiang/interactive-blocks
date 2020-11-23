/*
 * Created by Jimmy Lan
 * Creation Date: 2020-11-23
 * Description:
 *    Event registry class to persist and trigger a set of events.
 */

type EventCallback = () => void;
type EventsRecord = { [eventType: string]: EventCallback[] };

export class EventRegistry {
  constructor(public events: EventsRecord = {}) {}

  /**
   * Register event <eventType> with <callback>.
   * @param eventType type of event to register.
   * @param callback callback function to be invoked when event
   *    <eventType> is triggered.
   */
  register = (eventType: string, callback: EventCallback): void => {
    const eventCallbacks = this.events[eventType] || [];
    eventCallbacks.push(callback);
    this.events[eventType] = eventCallbacks;
  };

  /**
   * Trigger event <eventType>.
   * @param eventType type of event to be triggered.
   */
  trigger = (eventType: string): void => {
    this.events[eventType]?.forEach((callback: EventCallback) => callback());
  };
}