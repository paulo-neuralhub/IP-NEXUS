import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  duration?: number;
  className?: string;
}

export function AudioPlayer({ src, duration: initialDuration, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn('flex items-center gap-3 min-w-[200px]', className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0 hover:bg-[#008f72] transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white fill-white" />
        ) : (
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        )}
      </button>

      {/* Progress bar and time */}
      <div className="flex-1 min-w-0">
        {/* Progress bar */}
        <div
          className="h-1 bg-gray-300 rounded-full cursor-pointer relative"
          onClick={handleSeek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-[#00a884] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00a884] rounded-full shadow"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Time */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
