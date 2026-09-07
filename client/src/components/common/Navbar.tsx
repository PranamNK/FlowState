import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { formatSecondsToTimer } from '../../utils/formatters';
import { Play, Pause, Square, Plus, BarChart3, Clock, Target, Calendar, LogOut, Zap } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'timeline' | 'analytics' | 'goals';
  onSelectTab: (tab: 'dashboard' | 'timeline' | 'analytics' | 'goals') => void;
  onOpenActivityModal: () => void;
  onOpenStartSessionModal: () => void;
  onOpenFinishSessionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenActivityModal,
  onOpenStartSessionModal,
  onOpenFinishSessionModal,
}) => {
  const { user, logout } = useAuth();
  const { activeSession, elapsedSeconds, pauseSession, resumeSession } = useSession();

  return (
    <header className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => onSelectTab('dashboard')}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px var(--accent-primary-glow)',
            }}
          >
            <Zap size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>FLOWSTATE</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Time Intelligence
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className={`btn btn-ghost btn-sm ${currentTab === 'dashboard' ? 'btn-secondary' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <Clock size={15} /> Dashboard
          </button>
          <button
            className={`btn btn-ghost btn-sm ${currentTab === 'timeline' ? 'btn-secondary' : ''}`}
            onClick={() => onSelectTab('timeline')}
          >
            <Calendar size={15} /> Timeline
          </button>
          <button
            className={`btn btn-ghost btn-sm ${currentTab === 'analytics' ? 'btn-secondary' : ''}`}
            onClick={() => onSelectTab('analytics')}
          >
            <BarChart3 size={15} /> Analytics
          </button>
          <button
            className={`btn btn-ghost btn-sm ${currentTab === 'goals' ? 'btn-secondary' : ''}`}
            onClick={() => onSelectTab('goals')}
          >
            <Target size={15} /> Goals
          </button>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {activeSession ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: `1px solid ${activeSession.status === 'active' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px 4px 14px',
              boxShadow: activeSession.status === 'active' ? '0 0 16px var(--accent-primary-glow)' : 'none',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activeSession.status === 'active' ? '#10b981' : '#f59e0b',
              }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSession.title}
            </span>
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatSecondsToTimer(elapsedSeconds)}
            </span>

            {activeSession.status === 'active' ? (
              <button className="btn btn-ghost btn-icon btn-sm" onClick={pauseSession} title="Pause">
                <Pause size={14} />
              </button>
            ) : (
              <button className="btn btn-ghost btn-icon btn-sm" onClick={resumeSession} title="Resume">
                <Play size={14} />
              </button>
            )}

            <button
              className="btn btn-danger btn-icon btn-sm"
              onClick={onOpenFinishSessionModal}
              title="Finish Session"
            >
              <Square size={13} />
            </button>
          </div>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={onOpenStartSessionModal}>
            <Zap size={14} color="var(--accent-primary)" /> Start Focus
          </button>
        )}

        <button className="btn btn-primary btn-sm" onClick={onOpenActivityModal}>
          <Plus size={15} /> Log Activity
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={logout} title="Sign Out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
