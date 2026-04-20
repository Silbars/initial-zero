import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserGoals, updateUserGoals } from '../services/firestore';
import { Save, Target, ShieldCheck, Flame, Activity, Droplets } from 'lucide-react';

const toSafeNumber = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
};

const calculateCaloriesFromMacros = (protein: number, carbs: number, fats: number) => {
  return Math.round((protein * 4) + (carbs * 4) + (fats * 9));
};

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 70
  });

  useEffect(() => {
    if (user) {
      getUserGoals(user.uid).then((data: any) => {
        const protein = toSafeNumber(Number(data?.protein ?? 150));
        const carbs = toSafeNumber(Number(data?.carbs ?? 200));
        const fats = toSafeNumber(Number(data?.fats ?? 70));
        const calories = calculateCaloriesFromMacros(protein, carbs, fats);
        setGoals({ calories, protein, carbs, fats });
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const normalizedGoals = {
      protein: toSafeNumber(goals.protein),
      carbs: toSafeNumber(goals.carbs),
      fats: toSafeNumber(goals.fats),
      calories: calculateCaloriesFromMacros(
        toSafeNumber(goals.protein),
        toSafeNumber(goals.carbs),
        toSafeNumber(goals.fats)
      )
    };

    setSaving(true);
    await updateUserGoals(user.uid, normalizedGoals);
    setGoals(normalizedGoals);
    setSaving(false);
    alert("Goals updated successfully!");
  };

  const updateMacroGoal = (key: 'protein' | 'carbs' | 'fats', value: number) => {
    const safeValue = toSafeNumber(value);
    setGoals((prev) => {
      const nextGoals = { ...prev, [key]: safeValue };
      return {
        ...nextGoals,
        calories: calculateCaloriesFromMacros(nextGoals.protein, nextGoals.carbs, nextGoals.fats)
      };
    });
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading your profile...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2">Settings ⚙️</h2>
        <p className="text-slate-500 font-medium">Fine-tune your daily nutritional targets.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Target className="text-orange-500" size={20} />
              Daily Macro Targets
            </h3>
            
            <div className="space-y-5">
              <GoalInput label="Daily Calories" icon={<Flame className="text-slate-400"/>} value={goals.calories} 
                unit="kcal" readOnly />
              
              <GoalInput label="Protein Goal" icon={<Activity className="text-orange-500"/>} value={goals.protein === 0 ? "" : goals.protein} 
                onChange={(v : any) => updateMacroGoal('protein', v)} unit="g" />
              
              <GoalInput label="Carbs Goal" icon={<Flame className="text-blue-500"/>} value={goals.carbs === 0 ? "" : goals.carbs} 
                onChange={(v : any) => updateMacroGoal('carbs', v)} unit="g" />
              
              <GoalInput label="Fats Goal" icon={<Droplets className="text-yellow-500"/>} value={goals.fats === 0 ? "" : goals.fats} 
                onChange={(v : any) => updateMacroGoal('fats', v)} unit="g" />
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-10 bg-slate-900 hover:bg-orange-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-200"
            >
              {saving ? <span className="animate-pulse">Saving...</span> : <><Save size={20} /> Save Changes</>}
            </button>
          </section>
        </div>


        <div className="space-y-6">
          <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100">
            <ShieldCheck className="mb-4" size={32} />
            <h4 className="font-bold text-xl mb-2">Pro Tip</h4>
            <p className="text-orange-100 text-sm leading-relaxed">
              For a high-protein vegetarian diet, aim for at least *<b><i>1.6g of protein per kg</i></b>* of body weight. Adjust these targets as your activity levels change!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalInput = ({ label, value, onChange, unit, icon, readOnly = false }: any) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent focus-within:border-orange-200 transition-all">
    <div className="flex items-center gap-3">
      {icon}
      <label className="text-sm font-bold text-slate-600">{label}</label>
    </div>
    <div className="flex items-center gap-2">
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        readOnly={readOnly}
        className={`bg-white border border-gray-200 rounded-xl px-3 py-2 w-24 text-right font-black text-slate-900 outline-none ${
          readOnly ? 'cursor-not-allowed bg-gray-100 text-slate-500' : 'focus:ring-2 focus:ring-orange-500'
        }`}
      />
      <span className="text-xs font-bold text-slate-400 w-8">{unit}</span>
    </div>
  </div>
);

export default Settings;