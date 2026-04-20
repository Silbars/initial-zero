import { useState } from 'react';
import { PlusCircle, Loader2, X, Check } from 'lucide-react';
import { searchFoodNutrition } from '../services/usda';

export const LogMealForm = ({ onAdd }: { onAdd: (meal: any) => void }) => {
  const [text, setText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [preview, setPreview] = useState<any | null>(null); // The "Holding" state

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSearching) return;

    setIsSearching(true);
    const data = await searchFoodNutrition(text);
    
    if (data) {
      setPreview(data); // Show the card instead of saving immediately
    }
    setIsSearching(false);
  };

  const handleConfirm = () => {
    onAdd(preview);
    setPreview(null);
    setText('');
  };

  return (
    <div className="mb-8">
      {/* 1. The Search Input */}
      {!preview && (
        <form onSubmit={handleSearch} className="flex gap-3 animate-in fade-in zoom-in duration-300">
          <input
            type="text"
            placeholder="Search food (e.g., Avocado)..."
            className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="bg-orange-600 text-white p-4 rounded-2xl hover:bg-orange-700 transition-all">
            {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlusCircle className="w-6 h-6" />}
          </button>
        </form>
      )}

      {/* 2. The Preview Card (The "New Thing") */}
      {preview && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">Previewing</span>
              <h3 className="text-xl font-bold">{preview.foodName}</h3>
              <p className="text-slate-400 text-sm">Standard {preview.servingSize}</p>
            </div>
            <button onClick={() => setPreview(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-slate-800 p-3 rounded-2xl text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Cals</p>
              <p className="font-bold">{preview.calories}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl text-center border-b-2 border-orange-500">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Prot</p>
              <p className="font-bold">{preview.protein}g</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl text-center border-b-2 border-blue-500">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Carb</p>
              <p className="font-bold">{preview.carbs}g</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl text-center border-b-2 border-yellow-500">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Fat</p>
              <p className="font-bold">{preview.fats}g</p>
            </div>
          </div>

          <button 
            onClick={handleConfirm}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Check className="w-5 h-5" />
            Add to My Day
          </button>
        </div>
      )}
    </div>
  );
};