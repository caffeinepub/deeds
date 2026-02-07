import { useRef, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Badge } from './ui/badge';
import { Eye } from 'lucide-react';
import type { LiveSession } from '../hooks/useQueries';
import LiveChatPanel from './LiveChatPanel';

interface LiveViewerModalProps {
  session: LiveSession;
  onClose: () => void;
}

export default function LiveViewerModal({ session, onClose }: LiveViewerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // In a real implementation, this would connect to the broadcaster's stream
    // For now, we'll show a placeholder
    return () => {
      // Cleanup
    };
  }, [session]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid md:grid-cols-[1fr,300px] h-full">
          <div className="relative bg-black">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="mb-4 p-4 bg-white/10 rounded-full inline-block">
                  <Eye className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Stream Preview</h3>
                <p className="text-white/70 mb-4">
                  This is a simulated live stream viewer. In a production environment, this would
                  display the real-time video feed from the broadcaster using WebRTC peer-to-peer
                  connection.
                </p>
                <Badge className="bg-primary text-primary-foreground gap-1 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  LIVE
                </Badge>
              </div>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" />
                {Number(session.viewers)}
              </Badge>
            </div>
          </div>
          <div className="bg-background border-l">
            <LiveChatPanel sessionId={session.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
