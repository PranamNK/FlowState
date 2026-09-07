import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SessionProvider } from './context/SessionContext';
import { Navbar } from './components/common/Navbar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TimelinePage } from './pages/TimelinePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ActivityModal } from './components/activities/ActivityModal';
import { StartSessionModal } from './components/sessions/StartSessionModal';
import { FinishSessionModal } from './components/sessions/FinishSessionModal';
import { GoalModal } from './components/goals/GoalModal';
import type { Activity, Goal } from './types';
import { api } from './api/client';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'timeline' | 'analytics' | 'goals'>('dashboard');

  // Modal States
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isStartSessionOpen, setIsStartSessionOpen] = useState(false);
  const [isFinishSessionOpen, setIsFinishSessionOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-tertiary)',
          fontSize: '0.9rem',
        }}
      >
        Initializing FLOWSTATE...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleOpenActivityModal = (activity: Activity | null = null) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (data: Partial<Activity>) => {
    if (selectedActivity) {
      await api.put(`/activities/${selectedActivity._id}`, data);
    } else {
      await api.post('/activities', data);
    }
    setRefreshKey((k) => k + 1);
  };

  const handleCreateGoal = async (data: Partial<Goal>) => {
    await api.post('/goals', data);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenActivityModal={() => handleOpenActivityModal(null)}
          onOpenStartSessionModal={() => setIsStartSessionOpen(true)}
          onOpenFinishSessionModal={() => setIsFinishSessionOpen(true)}
        />

        <main key={refreshKey} style={{ flex: 1 }}>
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenActivityModal={handleOpenActivityModal}
              onOpenStartSessionModal={() => setIsStartSessionOpen(true)}
              onOpenGoalModal={() => setIsGoalModalOpen(true)}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'timeline' && (
            <TimelinePage onOpenActivityModal={handleOpenActivityModal} />
          )}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'goals' && (
            <GoalsPage onOpenGoalModal={() => setIsGoalModalOpen(true)} />
          )}
        </main>
      </div>

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSubmit={handleSaveActivity}
        initialActivity={selectedActivity}
      />

      <StartSessionModal
        isOpen={isStartSessionOpen}
        onClose={() => setIsStartSessionOpen(false)}
      />

      <FinishSessionModal
        isOpen={isFinishSessionOpen}
        onClose={() => setIsFinishSessionOpen(false)}
        onCompleted={() => setRefreshKey((k) => k + 1)}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <SessionProvider>
          <MainApp />
        </SessionProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
