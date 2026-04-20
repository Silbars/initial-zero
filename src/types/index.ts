export interface MealLog {
  id?: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  timestamp: any; // Firestore Timestamp
  userId: string;
}