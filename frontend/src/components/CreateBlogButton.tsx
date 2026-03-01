import { useState } from 'react';
import { Button } from './ui/button';
import { PenSquare } from 'lucide-react';
import CreateBlogModal from './CreateBlogModal';

export default function CreateBlogButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="gap-2">
        <PenSquare className="h-4 w-4" />
        Create Blog
      </Button>
      {showModal && <CreateBlogModal onClose={() => setShowModal(false)} />}
    </>
  );
}
