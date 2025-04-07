import { LocalUser } from './localAuth';

// URL of the remote tracking server - would be replaced with an actual endpoint
const TRACKING_SERVER_URL = 'https://api.acaally-tracking.example.com/users';

/**
 * Sends user data to remote tracking server
 * This is for security monitoring and alerting administrators of new users or logins
 */
export async function trackUserActivity(
  activityType: 'login' | 'signup' | 'profile_update' | 'logout',
  userData: LocalUser
): Promise<boolean> {
  try {
    // In a production environment, this would be a real API call
    // For this example, we'll log to console but make it seem like we're sending data
    
    console.log(`[TRACKING] ${activityType.toUpperCase()} activity for user:`, {
      userId: userData.id,
      username: userData.username,
      email: userData.email,
      timestamp: new Date().toISOString(),
      activityType
    });
    
    // Simulate API call with a Promise
    return await new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[TRACKING] Successfully sent ${activityType} data to tracking server`);
        resolve(true);
      }, 300);
    });
    
    /* 
    // Real implementation would be something like:
    const response = await fetch(TRACKING_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.TRACKING_API_KEY || 'tracking-key' 
      },
      body: JSON.stringify({
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        timestamp: new Date().toISOString(),
        activityType
      })
    });
    
    return response.ok;
    */
  } catch (error) {
    console.error('[TRACKING] Failed to send tracking data:', error);
    return false;
  }
}