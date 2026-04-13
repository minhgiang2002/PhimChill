import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useDevToolsDetector } from '../hooks/useDevToolsDetector';
import { AlertTriangle } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onError?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, onError }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useDevToolsDetector(() => {
    console.warn("DevTools detected! Closing player to prevent IP block.");
    setIsDevToolsOpen(true);
    if (playerRef.current) {
      playerRef.current.pause();
    }
  });

  useEffect(() => {
    if (isDevToolsOpen) return;

    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-theme-city'); // Optional: add a theme
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        poster: poster,
        sources: [{
          src: src,
          type: 'application/x-mpegURL'
        }],
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            'liveDisplay',
            'remainingTimeDisplay',
            'customControlSpacer',
            'playbackRateMenuButton',
            'chaptersButton',
            'descriptionsButton',
            'subsCapsButton',
            'audioTrackButton',
            'fullscreenToggle',
          ],
        },
      }, () => {
        // videojs.log('player is ready');
      });

      player.on('error', () => {
        if (onError) onError();
      });
    } else if (playerRef.current) {
      // If src changes, update the player
      const player = playerRef.current;
      player.src({ src: src, type: 'application/x-mpegURL' });
      if (poster) player.poster(poster);
    }
  }, [src, poster, onError]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className="relative w-full h-full rounded-2xl overflow-hidden">
      {isDevToolsOpen && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-brand mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Cảnh báo bảo mật</h3>
          <p className="text-gray-400 max-w-md">
            Vui lòng đóng Developer Tools để tiếp tục xem phim. Việc mở DevTools có thể khiến IP của bạn bị máy chủ phát video chặn vĩnh viễn.
          </p>
          <button 
            onClick={() => setIsDevToolsOpen(false)}
            className="mt-6 px-6 py-2 bg-brand text-white rounded-full font-bold hover:bg-brand-dark transition-colors"
          >
            Tôi đã đóng, thử lại
          </button>
        </div>
      )}
      <div ref={videoRef} className="w-full h-full" />
      <style dangerouslySetInnerHTML={{ __html: `
        .video-js {
          background-color: #000;
          font-family: inherit;
        }
        .vjs-big-play-button {
          background-color: rgba(229, 9, 20, 0.8) !important;
          border-color: transparent !important;
          border-radius: 50% !important;
          width: 80px !important;
          height: 80px !important;
          line-height: 80px !important;
          margin-top: -40px !important;
          margin-left: -40px !important;
        }
        .vjs-control-bar {
          background-color: rgba(0, 0, 0, 0.7) !important;
          height: 50px !important;
        }
        .vjs-slider {
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
        .vjs-play-progress {
          background-color: #e50914 !important;
        }
        .vjs-load-progress {
          background-color: rgba(255, 255, 255, 0.3) !important;
        }
      `}} />
    </div>
  );
};

export default VideoPlayer;
