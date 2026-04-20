import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addMealLog, subscribeToTodayLogs } from '../services/firestore';
import { LogMealForm } from '../components/LogMealForm';
import { Activity, Flame, Droplets, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [totals, setTotals] = useState({ protein: 0, carbs: 0, fats: 0 });

  // 1. Start the Live Listener
  useEffect(() => {
    if (!user) return;
    
    // Subscribe and save the "Unsubscribe" function
    const unsubscribe = subscribeToTodayLogs(user.uid, (fetchedLogs) => {
      setLogs(fetchedLogs);
      
      // 2. Calculate Totals using .reduce()
      const newTotals = fetchedLogs.reduce((acc, log) => ({
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fats: acc.fats + (log.fats || 0)
      }), { protein: 0, carbs: 0, fats: 0 });

      setTotals(newTotals);
    });

    return () => unsubscribe(); // Cleanup on close
  }, [user]);

  const handleAddMeal = async (mealData: any) => {
    if (user) await addMealLog(user.uid, mealData);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-8 pb-20">
      <h2 className="text-3xl font-black text-slate-900 mb-2">My Day 🥗</h2>
      <p className="text-slate-500 mb-8">Tracking for today, {new Date().toLocaleDateString()}</p>

      {/* Input Section */}
      <LogMealForm onAdd={handleAddMeal} />

      {/* Macro Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MacroCard title="Protein" current={totals.protein} target={150} color="orange" icon={<Activity />} />
        <MacroCard title="Carbs" current={totals.carbs} target={200} color="blue" icon={<Flame />} />
        <MacroCard title="Fats" current={totals.fats} target={60} color="yellow" icon={<Droplets />} />
      </div>

      {/* Recent Logs List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-slate-700">Today's History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {logs.map((log) => (
            <div key={log.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-bold text-slate-800">{log.foodName}</p>
                <div className="flex gap-3 text-xs font-medium text-slate-400 mt-1">
                  <span>P: {log.protein}g</span>
                  <span>C: {log.carbs}g</span>
                  <span>F: {log.fats}g</span>
                </div>
              </div>
              <div className="text-slate-300"><Clock className="w-4 h-4" /></div>
            </div>
          ))}
          {logs.length === 0 && <p className="p-10 text-center text-slate-400">No meals logged yet today.</p>}
        </div>
      </div>
    </div>
  );
};

// Simple reusable card component for the grid
const MacroCard = ({ title, current, target, color, icon }: any) => {
  const percentage = Math.min((current / target) * 100, 100);
  const colorMap: any = { orange: 'bg-orange-500', blue: 'bg-blue-500', yellow: 'bg-yellow-500' };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4 opacity-70">{icon} <span className="font-bold">{title}</span></div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-slate-900">{current}</span>
        <span className="text-slate-400 font-medium">/ {target}g</span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
        <div className={`${colorMap[color]} h-2 transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default Dashboard;