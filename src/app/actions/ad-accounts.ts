'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function listGoogleAdsAccounts(accessToken: string) {
  try {
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN não configurado.');

    const response = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro API Google: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const formattedAccounts = (data.resourceNames || []).map((name: string) => name.replace('customers/', ''));
    return { success: true, accounts: formattedAccounts };
  } catch (error: any) {
    console.error('Error listing Google Ads accounts:', error);
    return { success: false, error: error.message };
  }
}

export async function saveConnection(userId: string, platform: string, accountId: string, accessToken: string) {
  try {
    // Note: In a real app, you'd probably encrypt the token or use reach-refresh flows.
    // For this context, we'll store it in the user's profile as requested for the "Max" plan.
    const userRef = doc(db, 'users', userId);
    
    // We can store connections in a sub-object
    const connectionKey = `connections.${platform.toLowerCase().replace(' ', '_')}`;
    
    await updateDoc(userRef, {
      [connectionKey]: {
        accountId,
        accessToken,
        connectedAt: Date.now(),
        isActive: true
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error saving connection:', error);
    return { success: false, error: error.message };
  }
}

export async function removeConnection(userId: string, platform: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const connectionKey = `connections.${platform.toLowerCase().replace(' ', '_')}`;
    
    await updateDoc(userRef, {
      [connectionKey]: null
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error removing connection:', error);
    return { success: false, error: error.message };
  }
}
