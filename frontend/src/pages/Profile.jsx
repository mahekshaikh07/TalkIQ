import { useState, useEffect } from 'react';
import { Mic, TrendingUp, Flame, Award, LogOut, PlayCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import { useNavigate } from 'react-router-dom';
import { getSpeechSessions, getDebateSessions } from '../api/sessionsApi';
import {
  tagSessions,
  onlyCompleted,
  averageOverall,
  averageScores,
  calculateStreak,
  localDateKey,
  parseDate,
  simpleName,
  fmt1,
  SPEECH_SCORE_KEYS,
  DEBATE_SCORE_KEYS,
} from '../utils/dashboardHelpers';

// ---- Shared styles (change here, it updates everywhere) ----
// ---- Spacing scale: 4 = tight, 6 = card padding / section gaps ----
const CARD =
  'bg-white/70 backdrop-blur-md border border-white/45 rounded-2xl shadow-sm ' +
  'p-5 sm:p-6 flex flex-col';
const CARD_HEAD = 'flex items-center justify-between mb-4';
const LABEL = 'text-xs font-medium text-slate-400';
const ICON = 'text-slate-400';
const VALUE = 'text-2xl font-display font-semibold text-slate-700 leading-8';
const UNIT = 'text-sm text-slate-400 font-normal';
const SUBTEXT = 'mt-auto pt-4 text-xs text-slate-400';

const BTN =
  'flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400';
const BTN_PRIMARY = BTN + ' bg-slate-700 text-white hover:bg-slate-600';
const BTN_SECONDARY = BTN + ' border border-slate-200 bg-white/60 text-slate-600 hover:bg-white';

// Builds the profile numbers from the real sessions.
function buildStats(speech, debates) {
  const all = tagSessions(speech, debates);

  // Last 7 days, oldest first: filled if there was a session that day
  const days = {};
  all.forEach((x) => {
    const d = parseDate(x.created_at);
    if (d) days[localDateKey(d)] = true;
  });
  const streakDots = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    streakDots.push(!!days[localDateKey(d)]);
  }

  // Top skill = the score with the highest average (speech + debate scores together)
  let top = null;
  const consider = (list, keys) => {
    if (!list.length) return;
    const avg = averageScores(list, keys);
    keys.forEach((k) => {
      if (!top || avg[k] > top.value) top = { key: k, value: avg[k] };
    });
  };
  consider(speech, SPEECH_SCORE_KEYS);
  consider(debates, DEBATE_SCORE_KEYS);

  return {
    totalSessions: all.length,
    speechCount: speech.length,
    debateCount: debates.length,
    avgScore: averageOverall(all),
    currentStreak: calculateStreak(all),
    streakDots,
    topSkill: top
      ? { name: simpleName(top.key), description: 'Average ' + fmt1(top.value) + '/10' }
      : { name: 'Not yet', description: 'Finish a session to see your strongest skill' },
  };
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(() => buildStats([], []));
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSpeechSessions(), getDebateSessions()])
      .then((results) => {
        if (cancelled) return;
        setStats(buildStats(results[0] || [], onlyCompleted(results[1] || [])));
      })
      .catch((err) => {
        if (!cancelled) setStatsError(err && err.message ? err.message : 'Could not load your stats.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

    return (
    <div className="space-y-6 sm:space-y-8">
      {/* Profile Header Card */}
      <div className={`${CARD} sm:flex-row sm:items-center sm:justify-between gap-5`}>
        <div className="flex items-center gap-4 sm:gap-5">
          <Avatar
            name={user?.name}
            size="w-16 h-16 sm:w-20 sm:h-20"
            textSize="text-xl sm:text-2xl"
            className="shrink-0"
          />

          <div className="min-w-0">
            <h2 className="font-display font-semibold text-slate-700 text-lg sm:text-xl truncate">
              {user?.name || 'Your account'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {statsError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {statsError}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Sessions */}
        <div className={CARD}>
          <div className={CARD_HEAD}>
            <span className={LABEL}>Total Sessions</span>
            <Mic size={16} className={ICON} />
          </div>
          <p className={VALUE}>{stats.totalSessions}</p>
          <p className={SUBTEXT}>
            {stats.speechCount} speaking · {stats.debateCount} debate
          </p>
        </div>

        {/* Average Score */}
        <div className={CARD}>
          <div className={CARD_HEAD}>
            <span className={LABEL}>Average Score</span>
            <TrendingUp size={16} className={ICON} />
          </div>
          <p className={VALUE}>
            {fmt1(stats.avgScore, '-')}
            <span className={UNIT}>/10</span>
          </p>
          <p className={SUBTEXT}>Across speaking and debate</p>
        </div>

        {/* Current Streak */}
        <div className={CARD}>
          <div className={CARD_HEAD}>
            <span className={LABEL}>Current Streak</span>
            <Flame size={16} className={ICON} />
          </div>
          <p className={VALUE}>
            {stats.currentStreak} <span className={UNIT}>Days</span>
          </p>
          <div className="mt-auto pt-4 flex gap-1">
            {stats.streakDots.map((filled, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${filled ? 'bg-slate-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Top Skill */}
        <div className={CARD}>
          <div className={CARD_HEAD}>
            <span className={LABEL}>Top Skill</span>
            <Award size={16} className={ICON} />
          </div>
          <p className="text-lg font-display font-semibold text-slate-700 leading-8">
            {stats.topSkill.name}
          </p>
          <p className={SUBTEXT}>{stats.topSkill.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button onClick={() => navigate('/speaking/setup')} className={BTN_PRIMARY}>
          <PlayCircle size={16} />
          Start Practice
        </button>
        <button onClick={handleLogout} className={BTN_SECONDARY}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}