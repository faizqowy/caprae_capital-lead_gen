
'use server';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { Lead } from '@/types';

export async function saveLeadsToFirestore(
  userId: string,
  leads: Lead[],
  topLeads?: Lead[]
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User is not authenticated.' };
  }

  try {
    const batch = writeBatch(db);

    const leadsCollectionRef = collection(db, 'users', userId, 'leads');
    leads.forEach((lead) => {
      const { isEnriching, isScoring, ...leadToSave } = lead;
      const docRef = doc(leadsCollectionRef, lead.id);
      batch.set(docRef, {
        ...leadToSave,
        savedAt: lead.savedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });

    if (topLeads && topLeads.length > 0) {
      const topLeadsCollectionRef = collection(db, 'users', userId, 'topLeads');
      const topLeadsDocRef = doc(topLeadsCollectionRef, `top-${Date.now()}`);
      batch.set(topLeadsDocRef, {
        leads: topLeads,
        createdAt: new Date().toISOString(),
      });
    }

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error saving leads to Firestore:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function getSavedLeads(userId: string): Promise<{ leads?: Lead[], error?: string }> {
   if (!userId) {
    return { error: 'User is not authenticated.' };
  }
  try {
    const leadsCollectionRef = collection(db, 'users', userId, 'leads');
    const q = query(leadsCollectionRef, orderBy("savedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const leads = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Lead));
    return { leads };
  } catch (error) {
     console.error('Error fetching leads from Firestore:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}

export async function getTopLeads(userId: string): Promise<{ topLeads?: { leads: Lead[] }[], error?: string }> {
    if (!userId) {
        return { error: 'User is not authenticated.' };
    }
    try {
        const topLeadsCollectionRef = collection(db, 'users', userId, 'topLeads');
        const q = query(topLeadsCollectionRef, orderBy("createdAt", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        const topLeads = querySnapshot.docs.map(doc => doc.data() as { leads: Lead[] });
        return { topLeads };
    } catch (error) {
        console.error('Error fetching top leads from Firestore:', error);
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { error: errorMessage };
    }
}
