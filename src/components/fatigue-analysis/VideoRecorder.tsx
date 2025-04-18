
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

interface VideoRecorderProps {
  recording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  analysisResult: any;
  cameraError: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  recording,
  onStartRecording,
  onStopRecording,
  analysisResult,
  cameraError,
  videoRef
}) => {
  return (
    <div 
      className="p-6 border rounded-lg transition-all duration-200 border-primary bg-primary/5"
    >
      <div className="flex items-center gap-3 mb-4">
        <Video className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Реальный анализ</h3>
      </div>
      
      {recording ? (
        <Button variant="destructive" onClick={onStopRecording} className="w-full mb-4">
          Остановить запись
          {recording && <span className="ml-2 inline-block animate-pulse text-white">●</span>}
        </Button>
      ) : (
        <Button onClick={onStartRecording} className="w-full mb-4">
          {analysisResult ? 'Повторить запись' : 'Начать запись (30 сек)'}
        </Button>
      )}
      
      {/* Larger camera display with smooth transition */}
      <div 
        className={`mt-4 transition-all duration-500 ease-in-out transform ${
          recording ? 'opacity-100 scale-100 max-h-[50vh]' : 'opacity-0 scale-95 max-h-0 overflow-hidden'
        }`}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full rounded-md bg-black aspect-video shadow-lg"
        />
      </div>
      
      {cameraError && (
        <div className="mt-3 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {cameraError}
        </div>
      )}
    </div>
  );
};
