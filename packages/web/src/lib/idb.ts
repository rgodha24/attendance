import { toast } from "@/components/ui/use-toast";
import { createStore } from "jotai";
import { scannerNameAtom, selectedClassAtom } from "./atoms";

export type SignIn = {
  scannerName: string;
  time: Date;
  id: string;
  studentID: number;
};

export function getDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    console.log("getting db");
    const req = indexedDB.open("attendance", 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      const store = db.createObjectStore("signins", { keyPath: "id" });
      store.createIndex("scannerNameidx", "scannerName");
    };
  });
}

export async function getSignIns({
  scannerName,
  start,
  end,
}: {
  scannerName: string;
  start: Date;
  end: Date;
}): Promise<SignIn[]> {
  console.log("getting signins for ", scannerName);
  return new Promise<SignIn[]>(async (resolve, reject) => {
    const db = await getDB();
    const transaction = db.transaction(["signins"], "readonly");
    const store = transaction.objectStore("signins");
    const scannerIndex = store.index("scannerNameidx");

    const signIns: SignIn[] = [];

    const request = scannerIndex.openCursor(IDBKeyRange.only(scannerName));

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        signIns.push(cursor.value);
        cursor.continue();
      } else {
        resolve(
          signIns.filter(
            ({ time }) =>
              time.getTime() > start.getTime() &&
              time.getTime() <= end.getTime()
          )
        );
      }
    };

    request.onerror = () => {
      reject(new Error("Error fetching sign-ins"));
    };
  });
}

export async function getAllScannerNames() {
  return new Promise<string[]>(async (resolve, reject) => {
    const db = await getDB();
    const transaction = db.transaction(["signins"], "readonly");
    const store = transaction.objectStore("signins");
    const scannerIndex = store.index("scannerNameidx");

    const scannerNames = new Set<string>();

    const request = scannerIndex.openKeyCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        scannerNames.add(cursor.key as string);
        cursor.continue();
      } else {
        resolve([...scannerNames]);
      }
    };

    request.onerror = () => {
      reject(new Error("Error fetching scanner names"));
    };
  });
}

export async function addSignIn(
  {
    scannerName,
    time,
    id,
    studentID,
  }: {
    scannerName: string;
    time: Date;
    id: string;
    studentID: number;
  },
  invalidate = false
) {
  return new Promise<void>(async (resolve, reject) => {
    const db = await getDB();
    const transaction = db.transaction(["signins"], "readwrite");
    const store = transaction.objectStore("signins");

    const request = store.add({ scannerName, time, id, studentID });

    transaction.oncomplete = () => {
      if (invalidate) window.dispatchEvent(new CustomEvent("signin"));

      const store = createStore();
      const currentClass = store.get(selectedClassAtom);
      const currentScanner = store.get(scannerNameAtom);
      const name = currentClass?.students.find(
        (student) => student.studentID === studentID
      )?.name;

      toast({
        title:
          `${!!name ? name : studentID} signed in` +
          (currentScanner ? ` on scanner ${currentScanner}` : ""),
      });

      resolve();
    };

    request.onerror = () => {
      reject(new Error("Error adding sign-in"));
    };
  });
}
