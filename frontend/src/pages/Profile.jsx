import { useState } from 'react';
import { Camera, Edit3, Mic, TrendingUp, Flame, Award, LogOut, PlayCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Dummy stats — replace with real data once backend is wired in
const profileStats = {
  totalSessions: 142,
  sessionsProgress: 71, // % for progress bar
  avgClarityScore: 88,
  clarityChange: '+3% this month',
  currentStreak: 12,
  streakDots: [true, true, true, true, true, false, false], // filled vs empty
  topSkill: {
    name: 'Pacing & Pauses',
    description: 'Consistently hit target cadence',
  },
};

const badges = ['Premium Member', 'Debate Coach'];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl] = useState(
    user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.name || 'Eleanor')
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white/70 backdrop-blur-md border border-white/45 rounded-2xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={user?.name || 'User avatar'}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <button
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-sm hover:bg-slate-600 transition-colors"
              aria-label="Change avatar"
            >
              <Camera size={12} />
            </button>
          </div>

          <div>
            <h2 className="font-display font-semibold text-slate-700 text-lg">
              {user?.name || 'Eleanor Vance'}
            </h2>
            <p className="text-sm text-slate-400">{user?.email || 'eleanor.vance@example.com'}</p>
            <div className="flex gap-2 mt-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-600"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 bg-white/60 text-slate-600 hover:bg-white transition-colors">
          <Edit3 size={14} />
          Edit Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-white/70 backdrop-blur-md border border-white/45 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Sessions</span>
            <Mic size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-display font-semibold text-slate-700">
            {profileStats.totalSessions}
          </p>
          <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-500 rounded-full"
              style={{ width: `${profileStats.sessionsProgress}%` }}
            />
          </div>
        </div>

        {/* Avg Clarity Score */}
        <div className="bg-white/70 backdrop-blur-md border border-white/45 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Avg. Clarity Score</span>
            <TrendingUp size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-display font-semibold text-slate-700">
            {profileStats.avgClarityScore}
            <span className="text-sm text-slate-400 font-normal">/100</span>
          </p>
          <p className="mt-3 text-xs text-emerald-600 font-medium">{profileStats.clarityChange}</p>
        </div>

        {/* Current Streak */}
        <div className="bg-white/70 backdrop-blur-md border border-white/45 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Current Streak</span>
            <Flame size={16} className="text-orange-400" />
          </div>
          <p className="text-2xl font-display font-semibold text-slate-700">
            {profileStats.currentStreak} <span className="text-sm text-slate-400 font-normal">Days</span>
          </p>
          <div className="mt-3 flex gap-1">
            {profileStats.streakDots.map((filled, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${filled ? 'bg-slate-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Top Skill */}
        <div className="bg-white/70 backdrop-blur-md border border-white/45 rounded-2xl p-5 shadow-sm border-l-4 border-l-slate-400">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Top Skill</span>
            <Award size={16} className="text-slate-400" />
          </div>
          <p className="text-lg font-display font-semibold text-slate-700">
            {profileStats.topSkill.name}
          </p>
          <p className="mt-2 text-xs text-slate-400">{profileStats.topSkill.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => navigate('/speaking/setup')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors"
        >
          <PlayCircle size={16} />
          Start Practice
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 bg-white/60 text-slate-600 text-sm font-medium hover:bg-white transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}