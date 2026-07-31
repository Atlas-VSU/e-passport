import { initializeApp, getApps } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let storageInstance: FirebaseStorage | null = null;

export function getFirebaseStorage(): FirebaseStorage | null {
    if (storageInstance) return storageInstance;

    const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY || '';
    const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '';
    const bucket = (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '';
    const appId = (import.meta as any).env?.VITE_FIREBASE_APP_ID || '';

    if (!apiKey || !projectId || !bucket) {
        console.warn('Firebase Storage env vars missing. Photo uploads will use Express fallback.');
        return null;
    }

    try {
        const app = getApps().length
            ? getApps()[0]
            : initializeApp({ apiKey, projectId, storageBucket: bucket, appId });
        storageInstance = getStorage(app);
        return storageInstance;
    } catch (err) {
        console.error('Failed to initialize Firebase Storage:', err);
        return null;
    }
}
