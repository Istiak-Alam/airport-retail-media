import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

export function useSimulation() {
  const [state, setState] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let alive = true;

    function connect() {
      ws = new WebSocket(`${WS_URL}/ws`);
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (alive) setTimeout(connect, 2000);
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "simState") setState(msg.data);
          if (msg.type === "time") setCurrentTime(new Date(msg.data));
        } catch {}
      };
    }

    connect();
    api.simState().then(setState).catch(() => {});

    return () => {
      alive = false;
      ws?.close();
    };
  }, []);

  const play = useCallback(() => api.play(), []);
  const pause = useCallback(() => api.pause(), []);
  const setSpeed = useCallback((s: 1 | 10 | 60) => api.setSpeed(s), []);
  const inject = useCallback((type: string, payload: any) => api.inject(type, payload), []);

  return {
    state,
    currentTime,
    connected,
    play,
    pause,
    setSpeed,
    inject,
    isPlaying: state?.isPlaying ?? false,
    speed: state?.speed ?? 1,
  };
}