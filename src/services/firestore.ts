import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";

import { db } from "./firebase";
import { doc, deleteDoc } from "firebase/firestore";

export const addMealLog = async (userId: string, meal: any) => {
  const logsRef = collection(db, "users", userId, "dailyLogs");
  return addDoc(logsRef, {
    ...meal,
    timestamp: serverTimestamp(),
  });
};

export const subscribeToTodayLogs = (userId: string, callback: (logs: any[]) => void) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const logsRef = collection(db, "users", userId, "dailyLogs");
  const q = query(
    logsRef, 
    where("timestamp", ">=", Timestamp.fromDate(today)),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((snapshotDoc) => ({
      ...snapshotDoc.data(),
      id: snapshotDoc.id,
    }));
    callback(logs);
  });
};

export const deleteMealLog = async (userId: string, logId: string) => {
  console.log("Attempting to delete:", logId, "for user:", userId);
  try {
    const logRef = doc(db, "users", userId, "dailyLogs", logId);
    await deleteDoc(logRef);
    console.log("Delete successful in Firestore!");
  } catch (error) {
    console.error("FIREBASE DELETE ERROR:", error);
  }

};