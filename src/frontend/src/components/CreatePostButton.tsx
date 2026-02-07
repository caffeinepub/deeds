import { useState } from 'react';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

export default function CreatePostButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)} 
        className="w-full mb-8 h-14 text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-accent hover:opacity-90" 
        size="lg"
      >
        <Plus className="h-6 w-6 mr-2" />
        Share a Good Deed
      </Button>

      {showModal && <CreatePostModal onClose={() => setShowModal(false)} />}
    </>
  );
}
