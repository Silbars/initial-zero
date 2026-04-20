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

// Function to save a new meal
export const addMealLog = async (userId: string, meal: any) => {
  const logsRef = collection(db, "users", userId, "dailyLogs");
  return addDoc(logsRef, {
    ...meal,
    timestamp: serverTimestamp(),
  });
};

// Function to listen for today's logs in real-time
export const subscribeToTodayLogs = (userId: string, callback: (logs: any[]) => void) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const logsRef = collection(db, "users", userId, "dailyLogs");
  // Query: Only get logs from today, sorted by newest first
  const q = query(
    logsRef, 
    where("timestamp", ">=", Timestamp.fromDate(today)),
    orderBy("timestamp", "desc")
  );

  // This creates the "Live Connection"
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(logs);
  });
};