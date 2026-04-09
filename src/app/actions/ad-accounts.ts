'use server';

import { getFirebaseDb } from '../../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export async function listGoogleAdsAccounts(accessToken: string) {
  try {
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      console.error('GOOGLE_ADS_DEVELOPER_TOKEN is missing');
      return { success: false, error: 'Configuração de sistema pendente (Developer Token).' };
    }

    // 1. Get Accessible Customers (direct access)
    // Using v17 - latest stable
    const listResponse = await fetch('https://googleads.googleapis.com/v17/customers:listAccessibleCustomers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
      }
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      let errorMessage = 'Falha ao listar contas base.';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      return { success: false, error: errorMessage };
    }

    const listData = await listResponse.json();
    const seeds = (listData.resourceNames || []).map((name: string) => name.replace('customers/', ''));
    
    if (seeds.length === 0) {
      return { success: true, accounts: [] };
    }

    const detailedAccounts = [];

    // 2. For each seed, if it's a manager (MCC), search for client accounts
    for (const customerId of seeds) {
      const query = `
        SELECT 
          customer.id, 
          customer.descriptive_name, 
          customer.manager 
        FROM customer 
        LIMIT 1
      `;

      try {
        const searchRes = await fetch(`https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`, {
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
                  customer_client.descriptive_name,
                  customer_client.status
                FROM customer_client 
                WHERE customer_client.level <= 1 AND customer_client.status = 'ENABLED'
              `;
              
              const clientRes = await fetch(`https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`, {
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
                const clientData = await clientRes.json();
                (clientData.results || []).forEach((res: any) => {
                  const client = res.customerClient;
                  const clientId = client.clientCustomer.replace('customers/', '');
                  // Avoid duplicates
                  if (clientId !== customerId) {
                    detailedAccounts.push({
                      id: clientId,
                      name: `(${customer.descriptiveName}) ${client.descriptiveName || clientId}`,
                      isManager: false,
                      loginCustomerId: customerId // Keep track of parent MCC
                    });
                  }
                });
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error processing seed ${customerId}:`, err);
        // Continue with other seeds
      }
    }

    return { 
      success: true, 
      accounts: detailedAccounts.length > 0 ? detailedAccounts : seeds.map((id: string) => ({ id, name: id, isManager: false })) 
    };
    
  } catch (error: any) {
    console.error('Error listing Google Ads accounts:', error);
    return { success: false, error: error.message || 'Erro interno ao processar contas do Google Ads.' };
  }
}

export async function saveConnection(userId: string, platform: string, accountId: string, accessToken: string, loginCustomerId?: string) {
  try {
    const db = getFirebaseDb();
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
    const db = getFirebaseDb();
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
