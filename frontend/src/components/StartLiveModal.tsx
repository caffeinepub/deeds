import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStartLiveSession, useEndLiveSession } from '../hooks/useQueries';
import { Radio, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StartLiveModalProps {
  onClose: () => void;
}

export default function StartLiveModal({ onClose }: StartLiveModalProps) {
  const [isLive, setIsLive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const startSession = useStartLiveSession();
  const endSession = useEndLiveSession();

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const streamId = `stream_${Date.now()}`;
      const result = await startSession.mutateAsync({ streamId });
      const id = typeof result === 'string' ? result : (result as any)?.id ?? streamId;
      setSessionId(id);
      setIsLive(true);
      toast.success('You are now live! 🔴');
    } catch {
      toast.error('Failed to start live session');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;
    setIsStopping(true);
    try {
      await endSession.mutateAsync(sessionId);
      toast.success('Live session ended');
      onClose();
    } catch {
      toast.error('Failed to end live session');
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !isLive && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500" />
            {isLive ? 'You are Live!' : 'Go Live'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLive ? (
            <>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-bold text-red-600">LIVE</span>
                </div>
                <p className="text-sm text-muted-foreground">Your stream is active</p>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleStop}
                disabled={isStopping}
              >
                {isStopping ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ending...
                  </span>
                ) : (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Stream
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Start a live stream to share your deeds in real time with your followers.
              </p>

              <Button
                className="w-full"
                onClick={handleStart}
                disabled={isStarting}
              >
                {isStarting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Starting...
                  </span>
                ) : (
                  <>
                    <Radio className="w-4 h-4 mr-2" />
                    Go Live Now
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full" onClick={onClose}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
