import * as defaultStorages from "../common/multi-storage";

export function init (options) {
    const {
        storage = defaultStorages
    } = options;

    this.storage = {
        get: storage.get,
        set: storage.set,
        del: storage.del
    };
}
