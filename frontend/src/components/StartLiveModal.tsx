import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Radio, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';
import { useCreateLiveSession, useEndLiveSession } from '../hooks/useQueries';
import { toast } from 'sonner';
import LiveChatPanel from './LiveChatPanel';

interface StartLiveModalProps {
  onClose: () => void;
}

export default function StartLiveModal({ onClose }: StartLiveModalProps) {
  const [isLive, setIsLive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startLiveMutation = useCreateLiveSession();
  const endLiveMutation = useEndLiveSession();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startLive = async () => {
    try {
      const streamId = `stream-${Date.now()}`;
      const result = await startLiveMutation.mutateAsync({ streamId });
      const newSessionId = result?.id || `session-${Date.now()}`;
      setSessionId(newSessionId);
      setIsLive(true);
      toast.success('You are now live!');
    } catch (error: any) {
      console.error('Error starting live session:', error);
      toast.error(error.message || 'Failed to start live session');
    }
  };

  const endLive = async () => {
    if (!sessionId) return;

    try {
      await endLiveMutation.mutateAsync(sessionId);
      setIsLive(false);
      toast.success('Live session ended');
      handleClose();
    } catch (error: any) {
      console.error('Error ending live session:', error);
      toast.error(error.message || 'Failed to end live session');
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid md:grid-cols-[1fr,300px] h-full">
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isLive && (
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  LIVE
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              <Button
                size="icon"
                variant={videoEnabled ? 'default' : 'destructive'}
                onClick={toggleVideo}
                className="rounded-full"
              >
                {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant={audioEnabled ? 'default' : 'destructive'}
                onClick={toggleAudio}
                className="rounded-full"
              >
                {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              {!isLive ? (
                <Button
                  onClick={startLive}
                  disabled={startLiveMutation.isPending}
                  className="gap-2 rounded-full"
                >
                  <Radio className="h-4 w-4" />
                  {startLiveMutation.isPending ? 'Starting...' : 'Go Live'}
                </Button>
              ) : (
                <Button
                  onClick={endLive}
                  disabled={endLiveMutation.isPending}
                  variant="destructive"
                  className="gap-2 rounded-full"
                >
                  <X className="h-4 w-4" />
                  {endLiveMutation.isPending ? 'Ending...' : 'End Live'}
                </Button>
              )}
            </div>
          </div>
          {isLive && sessionId && (
            <div className="bg-background border-l">
              <LiveChatPanel sessionId={sessionId} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
