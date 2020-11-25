/*
 * Created by Jimmy Lan
 * Creation Date: 2020-11-23
 * Description: An abstract representation of an interactive block component.
 */

import { BlockModel } from "../../models/common/BlockModel";
import { EventsMap, ModelChangeEventOptions } from "../../commonTypes";

export abstract class BlockComponent<T extends BlockModel<K>, K> {
  constructor(public parent: Element, public model: T) {
    this.bindModel();
  }

  /**
   * Bind model to this view component so that the view component rerender
   * itself whenever the model changes.
   */
  bindModel = (): void => {
    this.model.on("change", (options) => {
      if (options) {
        const { shouldRerender } = options as ModelChangeEventOptions;
        if (!shouldRerender) {
          return;
        }
      }
      this.render();
    });
  };

  /**
   * Obtain a map of events in this view component.
   * Descriptor (i.e. p, object key) of event maps in view components must
   * follow the following syntax:
   * - Begin with a selector to an HTMLElement.
   * - Follow by a column (:).
   * - End by the event type to register. The event type to register is one of the DOM events.
   */
  get eventsMap(): EventsMap {
    return {};
  }

  /**
   * Bind events to this view component using the eventsMap in this object.
   * @param fragment Document fragment corresponding to this view component.
   */
  bindEvents = (fragment: DocumentFragment): void => {
    for (let descriptor in this.eventsMap) {
      // This check is to ensure that there is no unexpected
      // prototype change on the eventsMap object, which can lead
      // to hard-to-find issues.
      if (!this.eventsMap.hasOwnProperty(descriptor)) {
        throw new Error(
          "Unexpected prototype change in eventsMap. Please " +
            "always provide a callback function for each event descriptor!"
        );
      }

      // The descriptor is in the format <selector>:<eventType> for view
      // components.
      const [selector, eventType] = descriptor.split(":");

      // This check ensures that selector and eventType are not undefined.
      if (!selector || !eventType) {
        throw new Error(
          "Descriptor, or key of the eventsMap object, " +
            "must be in the format 'selector:eventType'!"
        );
      }

      fragment.querySelectorAll(selector).forEach((element: Element) => {
        element.addEventListener(eventType, this.eventsMap[descriptor]);
      });
    }
  };

  /**
   * Return a string with html syntax that represents this view component.
   */
  abstract get htmlStructure(): string;

  /**
   * Render the component by appending it to the parent component.
   * @param disableClean Boolean value to indicate whether to clean all
   *    children elements of the parent before this component is
   *    appended. Defaults to false.
   */
  render = (disableClean: boolean = false) => {
    // Clean up parent area
    if (!disableClean) {
      this.parent.innerHTML = "";
    }

    // Create template element to host html for this component
    const templateElement = document.createElement("template");
    templateElement.innerHTML = this.htmlStructure;

    this.bindEvents(templateElement.content);

    // Append template element to parent
    this.parent.appendChild(templateElement.content);
  };
}
