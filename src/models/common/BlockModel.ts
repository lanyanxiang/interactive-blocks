/*
 * Created by Jimmy Lan
 * Creation Date: 2020-11-23
 * Description: An interactive block model.
 */

import { AttributeRegistry } from "./AttributeRegistry";
import { EventRegistry } from "./EventRegistry";
import { Serializable, StoragePersistence } from "./Persistence";

export class BlockModel<T = any> implements Serializable {
  events: EventRegistry;
  persistence: StoragePersistence<this>;

  constructor(
    private attributes: AttributeRegistry<T>,
    persistenceStorage: Storage = localStorage
  ) {
    // At the current project scope, it is not likely that the event and storage
    // classes need to be substituted. Therefore, they are instantiated directly
    // here. In the future, when more options become available, the instantiation
    // of these classes will be extracted.
    this.events = new EventRegistry();
    this.persistence = new StoragePersistence<this>(this, persistenceStorage);
  }

  get get() {
    return this.attributes.get;
  }

  get getAll() {
    return this.attributes.getAll;
  }

  get on() {
    return this.events.register;
  }

  get trigger() {
    return this.events.trigger;
  }

  /**
   * Save current model as value to <key> in persistence.
   * @param key A string key to save model
   */
  save = (key: string) => {
    if (!this.persistence) {
      throw new Error("No persistence is specified for this model.");
    }
    this.persistence.save(key);
    this.events.trigger("save");
  };

  /**
   * Read model from persistence in location <key>.
   * @param key A string key to access information relating to the model
   */
  read = (key: string) => {
    if (!this.persistence) {
      throw new Error("No persistence is specified for this model.");
    }
    this.persistence.read(key);
    this.events.trigger("read");
  };

  /**
   * @param newData
   * @see AttributeRegistry.set
   */
  set = (newData: Partial<T>) => {
    this.attributes.set(newData);
    this.events.trigger("change");
  };

  /**
   * @param newData
   * @see AttributeRegistry.replace
   */
  replace = (newData: T) => {
    this.attributes.replace(newData);
    this.events.trigger("change");
  };

  /**
   * Serialize attributes of this model.
   */
  serialize = (): string => {
    return JSON.stringify(this.attributes);
  };

  /**
   * Deserialize <raw> and replace current attributes.
   * @param raw A string corresponding to attributes to be deserialized.
   */
  deserialize = (raw: string): void => {
    try {
      this.attributes.replace(JSON.parse(raw));
    } catch (e: any) {
      throw new Error(`Cannot deserialize from value ${raw}`);
    }
  };
}
