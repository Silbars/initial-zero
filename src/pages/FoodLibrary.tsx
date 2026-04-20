import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addMealLog, subscribeToTodayLogs, deleteMealLog } from '../services/firestore';
import { SearchInput } from '../components/SearchInput';
import { 
  Plus, 
  Loader2, 
  Weight, 
  X, 
  Check, 
  Utensils, 
  Trash2, 
  ShoppingBasket
} from 'lucide-react';

const FoodLibrary = () => {
  const { user } = useAuth();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [grams, setGrams] = useState(100);

  useEffect(() => {
    if (!user) return;

    const loadDefaults = async () => {
      setLoading(true);
      await handleSearchAction("high protein"); 
      setLoading(false);
    };
    loadDefaults();

    const unsubscribe = subscribeToTodayLogs(user.uid, (logs) => {
      setTodayLogs(logs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSearchAction = async (searchTerm: string) => {
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${import.meta.env.VITE_USDA_API_KEY}&query=${encodeURIComponent(searchTerm)}&pageSize=24`
      );
      const data = await response.json();
      const foods = Array.isArray(data?.foods) ? data.foods : [];
      
      const formattedResults = foods.map((food: any) => ({
        id: food.fdcId,
        foodName: food.description,
        calories: food.foodNutrients.find((n: any) => n.nutrientId === 1008)?.value || 0,
        protein: food.foodNutrients.find((n: any) => n.nutrientId === 1003)?.value || 0,
        carbs: food.foodNutrients.find((n: any) => n.nutrientId === 1005)?.value || 0,
        fats: food.foodNutrients.find((n: any) => n.nutrientId === 1004)?.value || 0,
      }));
      
      setResults(formattedResults);
    } catch (err) {
      console.error("Library fetch failed:", err);
    }
  };

  const onManualSearch = async () => {
    setLoading(true);
    await handleSearchAction(query);
    setLoading(false);
  };

  const showNoResults = !loading && query.trim().length > 0 && results.length === 0;

  const handleAddToToday = async () => {
    if (!user || !selectedFood) return;
    
    const multiplier = grams / 100;
    const finalMeal = {
      ...selectedFood,
      foodName: `${selectedFood.foodName} (${grams}g)`,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier),
      carbs: Math.round(selectedFood.carbs * multiplier),
      fats: Math.round(selectedFood.fats * multiplier),
    };

    await addMealLog(user.uid, finalMeal);
    setSelectedFood(null);
    setGrams(100);
  };

  const handleDelete = async (logId: string) => {
    if (user) await deleteMealLog(user.uid, logId);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 flex flex-col lg:flex-row gap-8">
      
      <div className="flex-1">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="text-orange-500 w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nutrient Database</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900">Explore Foods</h2>
        </header>

        <SearchInput 
          value={query}
          onChange={setQuery}
          onSearch={onManualSearch}
          placeholder="Search for ingredients or filter list..."
          loading={loading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading && results.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-200" />
            </div>
          ) : showNoResults ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-sm font-bold text-slate-500">Item not found</p>
              <p className="text-xs text-slate-400 mt-1">Try another keyword or spelling.</p>
            </div>
          ) : (
            results.map((food) => (
              <button 
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className="group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all text-left flex items-center gap-4"
              >
                <div className="bg-gray-50 p-3 rounded-2xl text-slate-300 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <Plus size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate leading-tight mb-1">{food.foodName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                      {Math.round(food.protein)}g Protein
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {Math.round(food.calories)} kcal
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <aside className="w-full lg:w-80">
        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white sticky top-24 shadow-2xl shadow-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-xl">
                <ShoppingBasket size={18} className="text-white" />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs">Today's Basket</h3>
            </div>
            <span className="text-[10px] font-black bg-slate-800 px-2 py-1 rounded-lg text-slate-400">
              {todayLogs.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
            {todayLogs.map((log) => (
              <div key={log.id} className="bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center group animate-in slide-in-from-right-4 border border-transparent hover:border-slate-700 transition-all">
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate pr-2 text-slate-200">{log.foodName}</p>
                  <p className="text-[10px] text-orange-500 font-bold mt-0.5">{log.calories} kcal</p>
                </div>
                <button 
                  onClick={() => handleDelete(log.id)}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {todayLogs.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                  <Plus size={20} />
                </div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  Click a food to <br /> add it here
                </p>
              </div>
            )}
          </div>

          {todayLogs.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Daily Total</span>
              <span className="text-sm font-black text-orange-500">
                {todayLogs.reduce((acc, curr) => acc + curr.calories, 0)} kcal
              </span>
            </div>
          )}
        </div>
      </aside>

      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Adjust Portion</span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{selectedFood.foodName}</h3>
              </div>
              <button onClick={() => setSelectedFood(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] mb-8 flex items-center gap-5 border-4 border-slate-800">
              <div className="bg-orange-500 text-white p-3 rounded-2xl shadow-lg shadow-orange-900/20">
                <Weight size={24} />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weight (Grams)</label>
                <input 
                  type="number"
                  value={grams === 0 ? "" : grams}
                  onChange={(e) => setGrams(Number(e.target.value))}
                  className="bg-transparent text-4xl font-black text-white w-full outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Est. Calories</p>
                  <p className="text-xl font-bold text-slate-800">{Math.round((selectedFood.calories / 100) * grams)} <span className="text-xs">kcal</span></p>
               </div>
               <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-orange-500 uppercase">Est. Protein</p>
                  <p className="text-xl font-bold text-slate-800">{Math.round((selectedFood.protein / 100) * grams)}g</p>
               </div>
            </div>

            <button 
              onClick={handleAddToToday}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-200"
            >
              <Check size={24} />
              Confirm & Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLibrary;