// src/components/user/NotificationsCenter.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { db } from '../../services/db';
import { Bell, HeartHandshake, CheckCircle2, Shield, Award, Clock } from 'lucide-react';

interface NotificationsCenterProps {
  currentUser: User;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ currentUser }) => {
  const activities = db.getActivityLogs().slice(0, 15);
  const userAchievements = db.getUserAchievements(currentUser.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold font-display text-slate-900">Updates & Notifications</h2>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Real-Time In-App Engine
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Section Y & AE: All community notices, confirmations, and milestone awards delivered reliably even if external email quotas exhaust
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((act) => (
          <div key={act.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-start gap-3.5 hover:border-indigo-200 transition-colors">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
              act.action.includes('COMPLETED') ? 'bg-purple-600' :
              act.action.includes('OFFER') ? 'bg-emerald-600' :
              act.action.includes('ACHIEVEMENT') ? 'bg-amber-500' :
              'bg-indigo-600'
            }`}>
              {act.action.includes('COMPLETED') ? <CheckCircle2 className="w-4 h-4" /> :
               act.action.includes('ACHIEVEMENT') ? <Award className="w-4 h-4" /> :
               <HeartHandshake className="w-4 h-4" />}
            </div>

            <div className="flex-1 space-y-0.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{act.action.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{act.targetLabel}</p>
              <span className="text-[10px] text-slate-400 block pt-0.5">
                Actor: {act.actorName} ({act.actorRole})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
