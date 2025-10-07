declare module "rocksdb" {
  type Callback<T = void> = (error: Error | undefined | null, value?: T) => void;

  interface Options {
    createIfMissing?: boolean;
  }

  interface BatchOperation {
    type: "put" | "del";
    key: string;
    value?: string;
  }

  interface KeyStreamOptions {
    gte: string;
    lt: string;
  }

  export default class RocksDB {
    constructor(path: string);
    open(options: Options, callback: Callback): void;
    close(callback: Callback): void;
    put(key: string, value: string, callback: Callback): void;
    get(key: string, callback: Callback<string>): void;
    del(key: string, callback: Callback): void;
    batch(operations: BatchOperation[], callback: Callback): void;
    createKeyStream(options: KeyStreamOptions): NodeJS.ReadableStream;
  }
}
