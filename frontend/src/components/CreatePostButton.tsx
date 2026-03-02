import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostModal from './CreatePostModal';

export default function CreatePostButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
        size="lg"
      >
        <Plus className="w-5 h-5" />
        Share a Deed
      </Button>
      <CreatePostModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
