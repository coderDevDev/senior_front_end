import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';


export interface MatchData {
  id: string;
  ipaddress: string;
}

export interface FingerprintData {
  fingerprint_image: string; // base64 PNG
  template: string;
  quality?: number; // optional, if your server sends it
}

interface FingerprintListenerProps {
  /**
   * Fired every time the server emits `fingerprint_data`.
   * The parent component (ProfilePage) can decide what to do next
   * (e.g. auto-register the first template it receives).
   */
  onCapture?: (data: FingerprintData) => void;

  /** How many previews to keep in local state (default = 3) */
  maxPrints?: number;
   onMatch: (data: MatchData) => void;
}

export const FingerprintListener: React.FC<FingerprintListenerProps> = ({
  onCapture,
  maxPrints = 3,
  onMatch
}) => {
  const [prints, setPrints] = useState<FingerprintData[]>([]);

  useEffect(() => {
    const socket: Socket = io('http://localhost:3000');

    socket.on('connect', () => console.log('Connected to WebSocket server'));

    socket.on('fingerprint_data', (data: FingerprintData) => {
      console.log('Fingerprint Data Received:', data);
      onCapture?.(data); // bubble up first

      setPrints(prev => {
        if (prev.length >= maxPrints) {
          // local preview limit reached – ignore extra images
          return prev;
        }
        return [...prev, data];
      });
    });


    socket.on('match_fingerprint', (data) => {
      console.log('🔍 match_fingerprint', data);
      onMatch(data);
    });

    

    return () => {
      socket.off('fingerprint_data');
      socket.disconnect();
    };
  }, [onCapture, maxPrints]);

  /* –––––––––––––––  PREVIEW RENDER  ––––––––––––––– */
  return (
    <div id="fingerprint-container" className="grid grid-cols-3 gap-4">
      {prints.map(({ fingerprint_image }, idx) => (
        <img
          key={idx}
          src={`data:image/png;base64,${fingerprint_image}`}
          width={150}
          alt={`Fingerprint Preview ${idx + 1}`}
          className="rounded shadow"
        />
      ))}
    </div>
  );
};
