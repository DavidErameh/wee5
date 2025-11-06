
/**
 * @jest-environment node
 */

// tests/api/xp.test.ts
import { POST as awardXP } from '@/app/api/xp/route';

describe('XP API', () => {
  test('awards XP for valid request', async () => {
    const req = new Request('http://localhost:3000/api/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test_user_123',
        experienceId: 'test_exp_456',
        activityType: 'message',
      }),
    });

    const response = await awardXP(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.xpAwarded).toBe(20);
  });

  test('rejects invalid activity type', async () => {
    const req = new Request('http://localhost:3000/api/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test_user_123',
        experienceId: 'test_exp_456',
        activityType: 'invalid',
      }),
    });

    const response = await awardXP(req);
    expect(response.status).toBe(400);
  });
});
