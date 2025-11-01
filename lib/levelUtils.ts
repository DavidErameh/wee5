export function getXPForNextLevel(level: number): number {
  // Based on MEE6's model: 5 * (level ^ 2) + 50 * level + 100
  return 5 * (level ** 2) + 50 * level + 100;
}

export function getRewardForLevel(level: number): { type: string; value: any } | null {
  switch (level) {
    case 5:
      return { type: 'free_membership_days', value: 3 };
    case 10:
      return { type: 'free_membership_days', value: 7 };
    case 25:
      return { type: 'free_membership_days', value: 14 };
    case 50:
      return { type: 'free_membership_days', value: 30 };
    case 100:
      return { type: 'permanent_discount', value: '50%' };
    default:
      return null;
  }
}
