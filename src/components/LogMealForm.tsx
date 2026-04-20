import { useState, useEffect } from 'react';
import { PlusCircle, Loader2, X, Check, Weight } from 'lucide-react';
import { searchFoodNutrition } from '../services/usda';

export const LogMealForm = ({ onAdd }: { onAdd: (meal: any) => void }) => {
  const [text, setText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [grams, setGrams] = useState(100); // Default to 100g

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSearching) return;

    setIsSearching(true);
    const data = await searchFoodNutrition(text);
    
    if (data) {
      setPreview(data);
      setGrams(100); // Reset to 100g for every new search
    }
    setIsSearching(false);
  };

  // The logic to "Scale" the macros based on input grams
  const multiplier = grams / 100;
  const scaledPreview = preview ? {
    ...preview,
    foodName: `${preview.foodName} (${grams}g)`,
    calories: Math.round(preview.calories * multiplier),
    protein: Math.round(preview.protein * multiplier),
    carbs: Math.round(preview.carbs * multiplier),
    fats: Math.round(preview.fats * multiplier),
    servingSize: `${grams}g`
  } : null;

  const handleConfirm = () => {
    onAdd(scaledPreview);
    setPreview(null);
    setText('');
  };

  return (
    <div className="mb-8">
      {!preview ? (
        <form onSubmit={handleSearch} className="flex gap-3 animate-in fade-in zoom-in">
          <input
            type="text"
            placeholder="Search food (e.g., Soya Granules)..."
            className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="bg-orange-600 text-white p-4 rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
            {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlusCircle className="w-6 h-6" />}
          </button>
        </form>
      ) : (
        <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Adjust Portion</span>
              <h3 className="text-xl font-bold line-clamp-1">{preview.foodName}</h3>
            </div>
            <button onClick={() => setPreview(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
              <X size={20} />
            </button>
          </div>

          {/* Grams Input Section */}
          <div className="bg-slate-800 p-4 rounded-2xl mb-6 flex items-center gap-4 border border-slate-700">
            <div className="bg-slate-700 p-2 rounded-xl text-orange-500">
              <Weight size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Amount in Grams</p>
              <input 
                type="number" 
                value={grams === 0 ? "" : grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="bg-transparent text-2xl font-black text-white w-full outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Live Updating Macro Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <MacroMini label="Cals" value={scaledPreview?.calories} />
            <MacroMini label="Prot" value={scaledPreview?.protein} color="border-orange-500" />
            <MacroMini label="Carb" value={scaledPreview?.carbs} color="border-blue-500" />
            <MacroMini label="Fat" value={scaledPreview?.fats} color="border-yellow-500" />
          </div>

          <button 
            onClick={handleConfirm}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Check size={20} />
            Add {grams}g to My Day
          </button>
        </div>
      )}
    </div>
  );
};

// Internal Helper Component
const MacroMini = ({ label, value, color = "border-slate-700" }: any) => (
  <div className={`bg-slate-800/50 p-3 rounded-2xl text-center border-b-4 ${color}`}>
    <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{label}</p>
    <p className="text-lg font-bold">{value}<span className="text-[10px] ml-0.5">{label === 'Cals' ? '' : 'g'}</span></p>
  </div>
);