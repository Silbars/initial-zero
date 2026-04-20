import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addMealLog, subscribeToTodayLogs, deleteMealLog, getUserGoals } from '../services/firestore';
import { LogMealForm } from '../components/LogMealForm';
import { 
  Activity, 
  Flame, 
  Droplets, 
  Clock, 
  Trash2, 
  Utensils, 
  TrendingUp,
  Target
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [totals, setTotals] = useState({ protein: 0, carbs: 0, fats: 0, calories: 0 });
  const [goals, setGoals] = useState({ calories: 2000, protein: 150, carbs: 200, fats: 70 });

  useEffect(() => {
    if (!user) return;

    getUserGoals(user.uid)
      .then((savedGoals: any) => {
        setGoals({
          calories: Number(savedGoals?.calories) || 2000,
          protein: Number(savedGoals?.protein) || 150,
          carbs: Number(savedGoals?.carbs) || 200,
          fats: Number(savedGoals?.fats) || 70,
        });
      })
      .catch((error) => {
        console.error('Failed to load user goals:', error);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToTodayLogs(user.uid, (fetchedLogs) => {
      setLogs(fetchedLogs);
      
      const newTotals = fetchedLogs.reduce((acc, log) => ({
        protein: acc.protein + (Number(log.protein) || 0),
        carbs: acc.carbs + (Number(log.carbs) || 0),
        fats: acc.fats + (Number(log.fats) || 0),
        calories: acc.calories + (Number(log.calories) || 0)
      }), { protein: 0, carbs: 0, fats: 0, calories: 0 });

      setTotals(newTotals);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddMeal = async (mealData: any) => {
    if (user) {
      try {
        await addMealLog(user.uid, mealData);
      } catch (err) {
        console.error("Failed to add meal:", err);
      }
    }
  };

  const handleDelete = async (logId: string) => {
    if (user) {
      await deleteMealLog(user.uid, logId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="text-orange-500 w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Daily Analytics</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900">Your Progress 📈</h2>
      </header>

      <section className="mb-12">
        <LogMealForm onAdd={handleAddMeal} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <MacroCard title="Total Calories" current={totals.calories} target={goals.calories} unit="kcal" color="slate" icon={<Target />} />
        <MacroCard title="Protein" current={totals.protein} target={goals.protein} unit="g" color="orange" icon={<Activity />} />
        <MacroCard title="Carbs" current={totals.carbs} target={goals.carbs} unit="g" color="blue" icon={<Flame />} />
        <MacroCard title="Fats" current={totals.fats} target={goals.fats} unit="g" color="yellow" icon={<Droplets />} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Clock className="text-slate-400" size={20} />
            Today's Log
          </h3>
          <span className="bg-white border border-gray-200 px-4 py-1 rounded-full text-xs font-bold text-slate-500 shadow-sm">
            {logs.length} entries
          </span>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex items-center justify-between animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <Utensils size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 capitalize leading-none mb-2">{log.foodName}</h4>
                  <div className="flex gap-3 items-center">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">{log.calories} kcal</span>
                    <div className="flex gap-2 text-[10px] font-black uppercase text-slate-400 tracking-tight">
                      <span>P: {log.protein}g</span>
                      <span className="opacity-30">|</span>
                      <span>C: {log.carbs}g</span>
                      <span className="opacity-30">|</span>
                      <span>F: {log.fats}g</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDelete(log.id)}
                className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nothing logged today</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const MacroCard = ({ title, current, target, unit, color, icon }: any) => {
  const safeTarget = Number(target) > 0 ? Number(target) : 1;
  const currentValue = Number(current) || 0;
  const percentage = Math.min((currentValue / safeTarget) * 100, 100);
  
  const colors: any = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    yellow: 'bg-amber-400',
    slate: 'bg-slate-900'
  };

  const valueTextColors: any = {
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    yellow: 'text-amber-500',
    slate: 'text-slate-900'
  };

  return (
    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px]">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-xl text-slate-400">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{title}</span>
      </div>
      
      <div>
        <div className="flex items-baseline gap-1 mb-4">
          <span className={`text-3xl font-black leading-none ${valueTextColors[color]}`}>{currentValue}</span>
          <span className="text-xl font-black text-slate-400 leading-none">/{safeTarget}</span>
          <span className="text-slate-400 text-sm font-bold">{unit}</span>
        </div>

        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className={`${colors[color]} h-full transition-all duration-1000 ease-out`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;