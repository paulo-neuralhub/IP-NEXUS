import { useState, useRef, useEffect } from 'react';
import { Mic, Send, X, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
  onStartRecording: () => void;
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  isRecording,
  onStartRecording,
}: VoiceRecorderProps) {
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    }

    return () => {
      stopRecording();
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start animation
      const updateLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
        }
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob, duration);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

      mediaRecorder.start(100);

      // Start timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSend = () => {
    stopRecording();
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
    }
    stopRecording();
    onCancel();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-[#00a884]"
        onClick={onStartRecording}
      >
        <Mic className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-[#f0f2f5] rounded-full px-4 py-2 flex-1 animate-fade-in">
      {/* Cancel button */}
      <Button
        variant="ghost"
        size="icon"
        className="text-red-500 hover:text-red-600 h-8 w-8"
        onClick={handleCancel}
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Duration */}
      <span className="text-sm font-medium text-red-500 min-w-[40px]">
        {formatDuration(duration)}
      </span>

      {/* Waveform visualization */}
      <div className="flex-1 flex items-center justify-center gap-0.5 h-8">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-[#00a884] rounded-full transition-all duration-75"
            style={{
              height: `${Math.max(4, Math.sin(i * 0.5 + duration) * audioLevel * 24 + 8)}px`,
              opacity: 0.6 + audioLevel * 0.4,
            }}
          />
        ))}
      </div>

      {/* Recording indicator */}
      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />

      {/* Send button */}
      <Button
        variant="ghost"
        size="icon"
        className="text-[#00a884] hover:text-[#008f72] h-8 w-8"
        onClick={handleSend}
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
