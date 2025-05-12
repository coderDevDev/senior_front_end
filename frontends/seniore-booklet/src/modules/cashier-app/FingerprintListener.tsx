import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";

export interface MatchData {
  id: string;
  ipaddress: string;
}

interface FingerprintListener {

  onMatch: (data: MatchData) => void;
  socketUrl?: string;
}

export const FingerprintListener: React.FC<FingerprintListener> = ({
  onMatch,
  socketUrl = "http://localhost:3000",
}) => {
  useEffect(() => {
    const socket: Socket = io(socketUrl);

    socket.on("connect", () =>
      console.log("✅ connected to WS bridge for match-only listener")
    );

    socket.on("match_fingerprint", (data: MatchData) => {
      console.log("🔍 match_fingerprint", data);
      onMatch(data);
    });

    return () => {
      socket.off("match_fingerprint");
      socket.disconnect();
    };
  }, [onMatch, socketUrl]);


  return null;
};
