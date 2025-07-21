import { browser } from '$app/environment';
import { IndexedDB } from './indexedDB';
import type { IndexedDBData } from './storageType';

export class IndexedDbStorageManager {

    private indexedDB?: IndexedDB<IndexedDBData>;

    constructor(dbName?: string, storeName?: string) {

        this.indexedDB = new IndexedDB(dbName, storeName);

    }

    async set(key: string, value: any) {
        if (!browser) return;

        let value_ = structuredClone(value);

        if (this.indexedDB) {
            const indexedDBValue: IndexedDBData = { id: key, ...(value_  ) };
            await this.indexedDB.add(indexedDBValue);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (!browser) return null;

        if (this.indexedDB) {
            const items = await this.indexedDB.getAll();
            return (items.find((item) => item.id === key) || null) as T | null;
        }

        return null;
    }

    async remove(key: string) {
        if (!browser) return;

        if (this.indexedDB) {
            await this.indexedDB.delete(key);
        }
    }

    async clear() {
        if (!browser) return;

        if (this.indexedDB) {
            await this.indexedDB.clear();
        }
    }
}