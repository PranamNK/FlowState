import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Session, ActivityOutcome } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

interface SessionContextType {
  activeSession: Session | null;
  elapsedSeconds: number;
  isLoading: boolean;
  startSession: (title: string, category: string, focusScore?: number, energyScore?: number) => Promise<Session>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  finishSession: (finalData?: { focusScore?: number; energyScore?: number; outcome?: ActivityOutcome; notes?: string }) => Promise<any>;
  cancelSession: () => Promise<void>;
  refreshActiveSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const timerRef = useRef<any>(null);

  const fetchActive = async () => {
    if (!isAuthenticated) {
      setActiveSession(null);
      setElapsedSeconds(0);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get<{ success: boolean; active: { session: Session; currentElapsedSeconds: number } | null }>('/sessions/active');
      if (res.success && res.active) {
        setActiveSession(res.active.session);
        setElapsedSeconds(res.active.currentElapsedSeconds);
      } else {
        setActiveSession(null);
        setElapsedSeconds(0);
      }
    } catch (err) {
      setActiveSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    socket.on('session:started', (session: Session) => {
      setActiveSession(session);
      setElapsedSeconds(0);
    });

    socket.on('session:paused', (session: Session) => {
      setActiveSession(session);
      setElapsedSeconds(session.accumulatedSeconds);
    });

    socket.on('session:resumed', (session: Session) => {
      setActiveSession(session);
    });

    socket.on('session:finished', () => {
      setActiveSession(null);
      setElapsedSeconds(0);
    });

    socket.on('session:cancelled', () => {
      setActiveSession(null);
      setElapsedSeconds(0);
    });

    return () => {
      socket.off('session:started');
      socket.off('session:paused');
      socket.off('session:resumed');
      socket.off('session:finished');
      socket.off('session:cancelled');
    };
  }, [socket]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (activeSession && activeSession.status === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeSession?.status, activeSession?._id]);

  const startSession = async (title: string, category: string, focusScore = 80, energyScore = 80) => {
    const res = await api.post<{ success: boolean; session: Session }>('/sessions/start', {
      title,
      category,
      focusScore,
      energyScore,
    });
    if (res.success && res.session) {
      setActiveSession(res.session);
      setElapsedSeconds(0);
      return res.session;
    }
    throw new Error('Failed to start session.');
  };

  const pauseSession = async () => {
    if (!activeSession) return;
    const res = await api.post<{ success: boolean; session: Session }>(`/sessions/${activeSession._id}/pause`);
    if (res.success && res.session) {
      setActiveSession(res.session);
      setElapsedSeconds(res.session.accumulatedSeconds);
    }
  };

  const resumeSession = async () => {
    if (!activeSession) return;
    const res = await api.post<{ success: boolean; session: Session }>(`/sessions/${activeSession._id}/resume`);
    if (res.success && res.session) {
      setActiveSession(res.session);
    }
  };

  const finishSession = async (finalData = {}) => {
    if (!activeSession) return;
    const res = await api.post<{ success: boolean; activity: any; session: Session }>(
      `/sessions/${activeSession._id}/finish`,
      finalData
    );
    if (res.success) {
      setActiveSession(null);
      setElapsedSeconds(0);
      return res;
    }
    throw new Error('Failed to finish session.');
  };

  const cancelSession = async () => {
    if (!activeSession) return;
    await api.post(`/sessions/${activeSession._id}/cancel`);
    setActiveSession(null);
    setElapsedSeconds(0);
  };

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        elapsedSeconds,
        isLoading,
        startSession,
        pauseSession,
        resumeSession,
        finishSession,
        cancelSession,
        refreshActiveSession: fetchActive,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
