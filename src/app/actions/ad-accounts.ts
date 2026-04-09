'use server';

import { db } from '../../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function listGoogleAdsAccounts(accessToken: string) {
  try {
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      console.error('GOOGLE_ADS_DEVELOPER_TOKEN is missing');
      return { success: false, error: 'Configuração de sistema pendente (Developer Token).' };
    }

    // 1. Get Accessible Customers (direct access)
    const listResponse = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
      }
    });

    if (!listResponse.ok) {
      const errorData = await listResponse.json();
      return { success: false, error: errorData.error?.message || 'Falha ao listar contas base.' };
    }

    const listData = await listResponse.json();
    const seeds = (listData.resourceNames || []).map((name: string) => name.replace('customers/', ''));
    
    let allAccounts: string[] = [...seeds];

    // 2. For each seed, if it's a manager (MCC), search for client accounts
    // To keep it simple and avoid timeouts, we'll try to get the descriptive names and check hierarchy
    const detailedAccounts = [];

    for (const customerId of seeds) {
      const query = `
        SELECT 
          customer.id, 
          customer.descriptive_name, 
          customer.manager 
        FROM customer 
        LIMIT 1
      `;

      const searchRes = await fetch(`https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const customer = searchData.results?.[0]?.customer;
        
        if (customer) {
          detailedAccounts.push({
            id: customer.id,
            name: customer.descriptiveName || `Conta ${customer.id}`,
            isManager: customer.manager
          });

          // 3. IF IT'S A MANAGER, fetch sub-accounts
          if (customer.manager) {
            const clientQuery = `
              SELECT 
                customer_client.client_customer, 
                customer_client.descriptive_name 
              FROM customer_client 
              WHERE customer_client.level <= 1 AND customer_client.status = 'ENABLED'
            `;
            
            const clientRes = await fetch(`https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:search`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': developerToken,
                'login-customer-id': customerId, // CRITICAL FOR MCC
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query: clientQuery })
            });

            if (clientRes.ok) {
              const clientData = await clientRes.ok ? await clientRes.json() : { results: [] };
              (clientData.results || []).forEach((res: any) => {
                const client = res.customerClient;
                const clientId = client.clientCustomer.replace('customers/', '');
                // Avoid duplicates
                if (clientId !== customerId) {
                  detailedAccounts.push({
                    id: clientId,
                    name: `(${customer.descriptiveName}) ${client.descriptiveName || clientId}`,
                    isManager: false,
                    loginCustomerId: customerId // Keep track of the parent MCC for later use
                  });
                }
              });
            }
          }
        }
      }
    }

    return { 
      success: true, 
      accounts: detailedAccounts.length > 0 ? detailedAccounts : seeds.map((id: string) => ({ id, name: id, isManager: false })) 
    };
    
  } catch (error: any) {
    console.error('Error listing Google Ads accounts:', error);
    return { success: false, error: 'Erro interno ao processar contas do Google Ads.' };
  }
}

export async function saveConnection(userId: string, platform: string, accountId: string, accessToken: string, loginCustomerId?: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const connectionKey = `connections.${platform.toLowerCase().replace(' ', '_')}`;
    
    await updateDoc(userRef, {
      [connectionKey]: {
        accountId,
        accessToken,
        loginCustomerId: loginCustomerId || null, // Store parent MCC ID if used
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
