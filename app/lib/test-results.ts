export type TestResult = {
  testId: string;
  correct: number;
  wrong: number;
  passed: boolean;
  completedAt: string;
};

const DATABASE_NAME = "driver-theory";
const STORE_NAME = "test-results";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME))
        database.createObjectStore(STORE_NAME, { keyPath: "testId" });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getTestResults(): Promise<Record<string, TestResult>> {
  if (typeof window === "undefined" || !window.indexedDB) return {};
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      database.close();
      resolve(
        Object.fromEntries(
          request.result.map((result: TestResult) => [result.testId, result]),
        ),
      );
    };
  });
}

export async function saveTestResult(result: TestResult): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) return;
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
    transaction.objectStore(STORE_NAME).put(result);
  });
}
