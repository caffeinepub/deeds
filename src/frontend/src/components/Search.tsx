import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export default function Search({ onSearch, placeholder = "Search blogs, challenges, users..." }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-8 relative z-10">
      <div className="relative group">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-red-600 transition-colors z-10" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-14 py-6 text-base rounded-2xl shadow-md bg-background-lighter border-2 border-border hover:border-red-400/40 focus:border-red-600 transition-all duration-200 focus:ring-2 focus:ring-red-600/20 relative z-10"
        />
        <Button 
          type="submit" 
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl shadow-md bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 z-10"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
