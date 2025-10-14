import { resolve } from "node:path";
import RocksDB from "rocksdb";

const dbPathArg = process.argv[2];
const dbPath = resolve(process.cwd(), dbPathArg ?? "./data/rocksdb");

async function openDatabase(path: string): Promise<RocksDB> {
  const db = new RocksDB(path);
  await new Promise<void>((resolveOpen, rejectOpen) => {
    db.open({ createIfMissing: false }, (error: Error | undefined | null) => {
      if (error) {
        rejectOpen(error);
        return;
      }
      resolveOpen();
    });
  });
  return db;
}

async function iterate(db: RocksDB): Promise<Array<{ key: string; value: string }>> {
  const iterator = db.iterator({ keys: true, values: true });
  const entries: Array<{ key: string; value: string }> = [];

  await new Promise<void>((resolveIter, rejectIter) => {
    const next = () => {
      iterator.next((error: Error | null, key?: Buffer, value?: Buffer) => {
        if (error) {
          if ((error as { notFound?: boolean }).notFound) {
            // Exhausted iterator
            endIterator();
            return;
          }
          endIterator(error);
          return;
        }

        if (!key) {
          endIterator();
          return;
        }

        entries.push({ key: key.toString(), value: value?.toString() ?? "" });
        next();
      });
    };

    const endIterator = (error?: unknown) => {
      iterator.end((endError?: Error | null) => {
        if (endError) {
          rejectIter(endError);
          return;
        }
        if (error) {
          rejectIter(error);
          return;
        }
        resolveIter();
      });
    };

    next();
  });

  return entries;
}

async function closeDatabase(db: RocksDB) {
  await new Promise<void>((resolveClose, rejectClose) => {
    db.close((error?: Error | null) => {
      if (error) {
        rejectClose(error);
        return;
      }
      resolveClose();
    });
  });
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

(async () => {
  try {
    const db = await openDatabase(dbPath);
    const entries = await iterate(db);

    const grouped = entries.reduce<Record<string, Array<{ key: string; value: unknown }>>>((acc, entry) => {
      const prefix = entry.key.split(":")[0] ?? "unknown";
      if (!acc[prefix]) {
        acc[prefix] = [];
      }
      acc[prefix].push({ key: entry.key, value: safeParseJson(entry.value) });
      return acc;
    }, {});

    // eslint-disable-next-line no-console
    console.log(`Opened RocksDB at ${dbPath}`);

    Object.entries(grouped).forEach(([prefix, items]) => {
      // eslint-disable-next-line no-console
      console.log(`\n[${prefix}] (${items.length})`);
      items.forEach((item) => {
        // eslint-disable-next-line no-console
        console.dir(item, { depth: null });
      });
    });

    if (entries.length === 0) {
      // eslint-disable-next-line no-console
      console.log("\nDatabase is empty");
    }

    await closeDatabase(db);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to read RocksDB", error);
    process.exitCode = 1;
  }
})();
