import { toast } from "@/components/ui/use-toast";
import { isDate } from "util/types";

type SignIn = {
  scannerName: string;
  time: Date;
  id: string;
  studentID: number;
};

export function getDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
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

export async function addSignIn({
  scannerName,
  time,
  id,
  studentID,
}: {
  scannerName: string;
  time: Date;
  id: string;
  studentID: number;
}) {
  return new Promise<void>(async (resolve, reject) => {
    const db = await getDB();
    const transaction = db.transaction(["signins"], "readwrite");
    const store = transaction.objectStore("signins");

    const signIn = { scannerName, time, id, studentID };

    const request = store.add(signIn);

    request.onsuccess = () => {
      window.dispatchEvent(new CustomEvent("signin"));
      toast({
        title: `${studentID} signed in`,
      });
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Error adding sign-in"));
    };
  });
}
