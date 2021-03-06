/*
 * Created by Jimmy Lan
 * Creation Date: 2020-12-15
 * Description: A collection of models.
 */

import { BlockModel } from "./BlockModel";
import { EventRegistry } from "./EventRegistry";
import { Persistence, Serializable, StoragePersistence } from "./Persistence";

export class Collection<T extends BlockModel> implements Serializable {
  private elements: T[];
  events: EventRegistry;
  persistence: Persistence<this> | undefined;

  constructor(elements: T[], persistenceStorage?: Storage) {
    this.elements = [...elements];
    this.events = new EventRegistry();
    if (persistenceStorage) {
      this.persistence = new StoragePersistence(this, persistenceStorage);
    }
  }

  get on() {
    return this.events.register;
  }

  get trigger() {
    return this.events.trigger;
  }

  get unregister() {
    return this.events.unregister;
  }

  get(index: number): T {
    return this.elements[index];
  }

  getAll(): T[] {
    return [...this.elements];
  }

  set(index: number, model: T): void {
    const prev = [...this.elements];
    this.elements[index] = model;
    this.events.trigger("change", prev);
  }

  remove(model: T): T {
    const prev = [...this.elements];
    this.elements = this.elements.filter((element) => element !== model);
    this.events.trigger("change", prev);
    return model;
  }

  removeAt(index: number): T {
    const prev = [...this.elements];
    const model = this.elements.splice(index, 1)[0];
    this.events.trigger("change", prev);
    return model;
  }

  replace(models: T[]): void {
    const prev = [...this.elements];
    this.elements = [...models];
    this.events.trigger("change", prev);
  }

  save(key: string): void {
    if (!this.persistence) {
      throw new Error("No persistence is specified for this model.");
    }
    this.persistence.save(key);
    this.events.trigger("save");
  }

  read(key: string): void {
    if (!this.persistence) {
      throw new Error("No persistence is specified for this model.");
    }
    this.persistence.read(key);
    this.events.trigger("read");
  }

  deserialize(raw: string): void {
    let rawElements: string[];
    try {
      rawElements = JSON.parse(raw);
    } catch (error) {
      throw new Error(`Cannot parse from the parameter "raw". ${raw}`);
    }

    if (this.elements.length !== rawElements.length) {
      throw new Error(
        `Not Assignable: Read ${rawElements.length} entries from storage, but only ${this.elements.length} ` +
          "elements exist in the current collection."
      );
    }

    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].deserialize(rawElements[i]);
    }
  }

  serialize(): string {
    const toSerialize = [];
    for (let element of this.elements) {
      toSerialize.push(element.serialize());
    }
    return JSON.stringify(toSerialize);
  }
}
