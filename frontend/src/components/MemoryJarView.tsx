import { useGetMyMemoryJar } from '../hooks/useQueries';
import { Card, CardContent } from './ui/card';
import { Loader2 } from 'lucide-react';
import MemoryJarPostCard from './MemoryJarPostCard';

export default function MemoryJarView() {
  const { data: jarEntries, isLoading } = useGetMyMemoryJar();

  const sortedEntries = jarEntries
    ? [...jarEntries].sort((a, b) => Number(b.savedAt - a.savedAt))
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (sortedEntries.length === 0) {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardContent className="py-16 text-center space-y-4">
          <img
            src="/assets/generated/memory-jar-icon.dim_256x256.png"
            alt="Memory Jar"
            className="h-24 w-24 object-contain mx-auto opacity-60"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div className="hidden text-6xl text-center">🫙</div>
          <div>
            <p className="font-bold text-amber-700 text-xl">Your jar is empty</p>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
              Start saving your favorite deeds! Tap the 🔖 bookmark icon on any post to add it to your Memory Jar.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
        <img
          src="/assets/generated/memory-jar-icon.dim_256x256.png"
          alt="Memory Jar"
          className="h-10 w-10 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        <div className="hidden text-2xl">🫙</div>
        <div>
          <p className="font-bold text-amber-700">Memory Jar</p>
          <p className="text-xs text-amber-600">{sortedEntries.length} cherished deed{sortedEntries.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sortedEntries.map(entry => (
          <MemoryJarPostCard key={entry.postId} entry={entry} />
        ))}
      </div>
    </div>
  );
}
