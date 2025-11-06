const DB_NAME = 'EducationAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'books';

// A variable to hold the database connection.
let db: IDBDatabase;

/**
 * Initializes the IndexedDB database.
 * This function handles the creation of the database and object store if they don't exist.
 * It returns a promise that resolves with the database connection.
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // If the database connection is already established, resolve with it.
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", (event.target as IDBRequest).error);
      reject('هەڵەیەک لە کردنەوەی بنکەی داتادا ڕوویدا');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    // This event is triggered only when the database version changes.
    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      // Create an object store if it doesn't already exist.
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Saves a file to the IndexedDB.
 * @param id - The unique identifier for the file (book.id).
 * @param file - The File object to be stored.
 */
export const saveFile = async (id: string, file: File): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, file });

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
        console.error('Error saving file:', (event.target as IDBRequest).error);
        reject('نەتوانرا فایلەکە پاشەکەوت بکرێت');
    };
  });
};

/**
 * Retrieves a file from the IndexedDB.
 * @param id - The unique identifier for the file (book.id).
 * @returns A promise that resolves with the File object or null if not found.
 */
export const getFile = async (id: string): Promise<File | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest).result;
      resolve(result ? result.file : null);
    };
    request.onerror = (event) => {
        console.error('Error getting file:', (event.target as IDBRequest).error);
        reject('نەتوانرا فایلەکە بهێنرێتەوە');
    };
  });
};

/**
 * Deletes a file from the IndexedDB.
 * @param id - The unique identifier for the file (book.id).
 */
export const deleteFile = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = (event) => {
        console.error('Error deleting file:', (event.target as IDBRequest).error);
        reject('نەتوانرا فایلەکە بسڕدرێتەوە');
    };
  });
};
