const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const API_KEY = import.meta.env.VITE_USDA_API_KEY;

export const searchFoodNutrition = async (query: string) => {
  try {
    const response = await fetch(
      `${USDA_BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&pageSize=1`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
      console.log("No food items found for this query.");
      return null;
    }

    const food = data.foods[0];
    
    const getNutrient = (id: number) => 
      food.foodNutrients.find((n: any) => n.nutrientId === id)?.value || 0;

    return {
      foodName: food.description,
      calories: Math.round(getNutrient(1008)),
      protein: Math.round(getNutrient(1003)),
      carbs: Math.round(getNutrient(1005)),
      fats: Math.round(getNutrient(1004)),
      servingSize: "100g (USDA Standard)" 
    };
  } catch (error) {
    console.error("USDA API connection failed:", error);
    return null;
  }
};
