import { Search as SearchIcon } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  placeholder?: string;
  loading?: boolean;
}

export const SearchInput = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Search...", 
  loading = false 
}: SearchInputProps) => {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto mb-12">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
        <SearchIcon size={22} />
      </div>
      
      <input 
        type="text"
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-[2.5rem] pl-16 pr-32 py-5 text-lg outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm transition-all placeholder:text-slate-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      />
      
      <button 
        type="submit" 
        disabled={loading}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-3 rounded-[1.5rem] font-bold hover:bg-orange-600 transition-all active:scale-95 disabled:bg-slate-300"
      >
        {loading ? "Searching..." : "Explore"}
      </button>
    </form>
  );
};