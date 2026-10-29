// src/services/achievementEngine.ts
import confetti from 'canvas-confetti';
import { User, Interaction, AchievementDefinition, UserAchievement } from '../types';

/**
 * Section K: Achievement Engine
 * Evaluates achievements dynamically against database-driven criteria.
 * Anti-abuse safeguard: Never increments metrics if helperId === requesterId.
 */
export function evaluateAchievementsOnInteractionComplete(
  helper: User,
  interaction: Interaction,
  definitions: AchievementDefinition[],
  existingUserAchievements: UserAchievement[],
  onAward: (achievement: UserAchievement) => void
): void {
  // Anti-abuse check: prevent users from helping themselves on fake posts
  if (interaction.helperId === interaction.requesterId) {
    console.warn('Anti-Abuse triggered: Self-help detected, achievement metrics skipped.');
    return;
  }

  // Active definitions sorted by threshold ascending
  const activeDefs = definitions.filter(d => d.isActive);

  // Check each metric against helper's updated stats
  activeDefs.forEach(def => {
    // Check if already awarded
    const alreadyEarned = existingUserAchievements.some(
      ua => ua.userId === helper.id && ua.achievementId === def.id
    );
    if (alreadyEarned) return;

    let currentMetricCount = 0;
    switch (def.metric) {
      case 'total_helps':
        currentMetricCount = helper.stats.helpsGiven;
        break;
      case 'blood_helps':
        currentMetricCount = helper.stats.bloodHelps;
        break;
      case 'ride_helps':
        currentMetricCount = helper.stats.rideHelps;
        break;
      case 'education_helps':
        currentMetricCount = helper.stats.educationHelps;
        break;
      case 'return_helps':
        currentMetricCount = helper.stats.returnsCompleted;
        break;
      case 'community_lifeline':
        currentMetricCount = helper.stats.bloodHelps;
        break;
      default:
        currentMetricCount = 0;
    }

    if (currentMetricCount >= def.requiredCount) {
      const awarded: UserAchievement = {
        id: `uach_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: helper.id,
        achievementId: def.id,
        earnedAt: new Date().toISOString(),
        awardedBy: 'SYSTEM',
        currentCount: currentMetricCount
      };

      onAward(awarded);

      // Trigger non-intrusive celebratory visual confetti (Section M)
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fail
      }
    }
  });
}

export interface MilestoneProgress {
  currentAchievement?: AchievementDefinition;
  nextAchievement?: AchievementDefinition;
  currentCount: number;
  requiredCount: number;
  remainingCount: number;
  percentage: number;
  unlockedAll: boolean;
}

/**
 * Section M: User Achievement UI helper
 * Calculates real progress towards the next milestone in a category.
 * E.g., "Helping Hand: 7 / 10 helps, [███████░░░], 3 more helps to unlock Community Helper."
 */
export function calculateCategoryMilestone(
  user: User,
  category: 'general' | 'blood' | 'rides' | 'education' | 'lostfound',
  definitions: AchievementDefinition[],
  userAchievements: UserAchievement[]
): MilestoneProgress {
  const categoryDefs = definitions
    .filter(d => d.isActive && d.category === category)
    .sort((a, b) => a.requiredCount - b.requiredCount);

  let currentCount = 0;
  switch (category) {
    case 'general':
      currentCount = user.stats.helpsGiven;
      break;
    case 'blood':
      currentCount = user.stats.bloodHelps;
      break;
    case 'rides':
      currentCount = user.stats.rideHelps;
      break;
    case 'education':
      currentCount = user.stats.educationHelps;
      break;
    case 'lostfound':
      currentCount = user.stats.returnsCompleted;
      break;
  }

  // Find earned vs next unearned
  const earnedIds = new Set(
    userAchievements.filter(ua => ua.userId === user.id).map(ua => ua.achievementId)
  );

  const earnedDefs = categoryDefs.filter(d => earnedIds.has(d.id));
  const unearnedDefs = categoryDefs.filter(d => !earnedIds.has(d.id));

  const currentAchievement = earnedDefs.length > 0 ? earnedDefs[earnedDefs.length - 1] : undefined;
  const nextAchievement = unearnedDefs.length > 0 ? unearnedDefs[0] : undefined;

  if (!nextAchievement) {
    // All milestones in category achieved!
    return {
      currentAchievement,
      nextAchievement: undefined,
      currentCount,
      requiredCount: currentAchievement?.requiredCount || currentCount,
      remainingCount: 0,
      percentage: 100,
      unlockedAll: true
    };
  }

  const prevThreshold = currentAchievement ? currentAchievement.requiredCount : 0;
  const targetThreshold = nextAchievement.requiredCount;
  const remaining = Math.max(0, targetThreshold - currentCount);
  const totalSpan = targetThreshold - prevThreshold;
  const progressInSpan = Math.max(0, currentCount - prevThreshold);
  const percentage = Math.min(100, Math.round((progressInSpan / (totalSpan || 1)) * 100));

  return {
    currentAchievement,
    nextAchievement,
    currentCount,
    requiredCount: targetThreshold,
    remainingCount: remaining,
    percentage,
    unlockedAll: false
  };
}
