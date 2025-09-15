
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon as CaptureIcon, CloseIcon, SwitchCameraIcon } from './icons';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    let isMounted = true;
    const getMedia = async () => {
      stopStream(); // Stop any existing stream before starting a new one
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false,
        });
        if (isMounted) {
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (isMounted) {
            setError("Could not access the camera. Please ensure permissions are granted.");
        }
      }
    };

    getMedia();

    return () => {
      isMounted = false;
      stopStream();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
            onCapture(file);
            stopStream();
          }
        }, 'image/png');
      }
    }
  };
  
  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
      stopStream();
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center" role="dialog" aria-modal="true">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-800 text-white p-3 rounded-md text-center z-10">
          {error}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-around items-center">
         <button onClick={handleSwitchCamera} className="p-3 bg-gray-600 rounded-full text-white hover:bg-gray-500 transition-colors" aria-label="Switch Camera">
          <SwitchCameraIcon className="w-8 h-8" />
        </button>
        <button onClick={handleCapture} className="p-4 bg-indigo-600 rounded-full text-white ring-4 ring-white/50 hover:bg-indigo-500 transition-colors" aria-label="Capture photo">
          <CaptureIcon className="w-10 h-10" />
        </button>
        <button onClick={handleClose} className="p-3 bg-gray-600 rounded-full text-white hover:bg-gray-500 transition-colors" aria-label="Close camera">
          <CloseIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
