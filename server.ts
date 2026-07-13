import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase limits for base64 photo uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ensure upload directory exists for local fallback image saving
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded images statically
app.use('/public/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Initialize Supabase Client (Lazy / Guarded to prevent startup crash)
let supabaseAdmin: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('Server-side Supabase Admin Client initialized successfully.');
  } catch (error) {
    console.error('Server failed to initialize Supabase client:', error);
  }
} else {
  console.warn('SUPABASE_URL or keys are missing from environment. Using local server state.');
}

// Memory databases for local fallback
let localProfiles: Record<string, any> = {
  'local-guest-user': {
    id: 'local-guest-user',
    name: 'Gladiator Visitor',
    email: 'guest@vsu.edu.ph',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp2sBzLI1xPXv6z2EFg4v-JE_X6la7unIVAMQnw7cqVXBeyK-Au3VpRS4T7RQ7GVjjVK0yI8RJ_4X-BXafhexkK9hxwSxKaOxIdUZlsoENaNpY3xMF62WDVCjJzFIppAxom80idElG7DfkvGaqHoI2tmISZjqXX5_ouxxjU4SBQQ63OWjzcKJZMM7S0Np8n_Fg8mFiEmRhoOkc1MOsk6CXXiTA5f715hqQOjztMqWW01aBRKEDKH_ZRA',
    consent_given: false,
    consent_timestamp: null,
    created_at: new Date().toISOString()
  }
};

let localStamps: Record<string, any[]> = {
  'local-guest-user': []
};

// Current Session State
// Since we are running in an iframe with local testing, we can simulate an active session
let currentSessionUser: any = localProfiles['local-guest-user'];

// =========================================================================
// API ENDPOINTS
// =========================================================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabaseConnected: !!supabaseAdmin });
});

// 2. Auth Session endpoint (Get current user state)
app.get('/api/auth/session', async (req, res) => {
  // If we have a real session token or header, we would verify it with Supabase.
  // For the AI Studio preview environment, we keep the active session in currentSessionUser.
  res.json({ user: currentSessionUser });
});

// 3. Simulates login directly or sets the active user
app.post('/api/auth/login', (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const id = email.replace(/[^a-zA-Z0-9]/g, '-');
  
  if (!localProfiles[id]) {
    localProfiles[id] = {
      id,
      name: name || 'VSU Student',
      email: email,
      avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      consent_given: false,
      consent_timestamp: null,
      created_at: new Date().toISOString()
    };
  }

  currentSessionUser = localProfiles[id];
  if (!localStamps[id]) {
    localStamps[id] = [];
  }

  res.json({ user: currentSessionUser });
});

// 4. Consent agreement endpoint
app.post('/api/auth/consent', async (req, res) => {
  const { userId, consentGiven } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const timestamp = new Date().toISOString();

  // If Supabase is connected, update the PostgreSQL profile
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          consent_given: consentGiven,
          consent_timestamp: timestamp
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile in Supabase:', error);
      } else {
        if (currentSessionUser && currentSessionUser.id === userId) {
          currentSessionUser = data;
        }
        return res.json({ profile: data, source: 'supabase' });
      }
    } catch (err) {
      console.error('Failed to query Supabase profile update:', err);
    }
  }

  // Fallback update in local memory
  if (localProfiles[userId]) {
    localProfiles[userId].consent_given = consentGiven;
    localProfiles[userId].consent_timestamp = timestamp;
  }
  
  if (currentSessionUser && currentSessionUser.id === userId) {
    currentSessionUser = localProfiles[userId];
  }

  res.json({ profile: localProfiles[userId], source: 'local' });
});

// 5. Get stamps for the current user
app.get('/api/stamps', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('stamps')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error querying Supabase stamps:', error);
      } else {
        return res.json({ stamps: data || [], source: 'supabase' });
      }
    } catch (err) {
      console.error('Failed to fetch stamps from Supabase:', err);
    }
  }

  // Fallback
  const userStamps = localStamps[userId] || [];
  res.json({ stamps: userStamps, source: 'local' });
});

// 6. Upload stamp photo & insert stamp row
app.post('/api/stamps/upload', async (req, res) => {
  const { userId, landmarkId, photoBase64 } = req.body;
  
  if (!userId || !landmarkId || !photoBase64) {
    return res.status(400).json({ error: 'Missing required fields: userId, landmarkId, or photoBase64' });
  }

  const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `${userId}-${landmarkId}-${Date.now()}.jpg`;

  let photoUrl = '';

  // If Supabase is connected, attempt uploading to Supabase Storage Bucket 'stamps'
  if (supabaseAdmin) {
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('stamps')
        .upload(`${userId}/${landmarkId}.jpg`, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
      } else {
        const { data: urlData } = supabaseAdmin.storage
          .from('stamps')
          .getPublicUrl(`${userId}/${landmarkId}.jpg`);
        
        photoUrl = urlData?.publicUrl || '';
      }
    } catch (err) {
      console.error('Failed to upload file to Supabase Storage:', err);
    }
  }

  // Local fallback photo save if Supabase upload failed or is not configured
  if (!photoUrl) {
    try {
      const localFilePath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(localFilePath, buffer);
      // We serve it from '/public/uploads/:filename'
      photoUrl = `/public/uploads/${filename}`;
      console.log(`Saved image locally to: ${localFilePath}`);
    } catch (writeErr) {
      console.error('Failed to write local fallback file:', writeErr);
      return res.status(500).json({ error: 'Failed to write image file' });
    }
  }

  const newStamp = {
    id: `stamp-${Date.now()}`,
    user_id: userId,
    landmark_id: landmarkId,
    photo_url: photoUrl,
    stamped_at: new Date().toISOString()
  };

  // Upsert stamp in Supabase
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('stamps')
        .upsert({
          user_id: userId,
          landmark_id: landmarkId,
          photo_url: photoUrl,
          stamped_at: new Date().toISOString()
        }, { onConflict: 'user_id,landmark_id' })
        .select();

      if (error) {
        console.error('Error inserting stamp in Supabase:', error);
      } else {
        return res.json({ stamp: data?.[0] || newStamp, source: 'supabase' });
      }
    } catch (err) {
      console.error('Failed to upsert stamp to Supabase:', err);
    }
  }

  // Fallback insert/update in memory
  if (!localStamps[userId]) {
    localStamps[userId] = [];
  }

  // Remove existing stamp for same landmark if it exists
  localStamps[userId] = localStamps[userId].filter(s => s.landmark_id !== landmarkId);
  localStamps[userId].push(newStamp);

  res.json({ stamp: newStamp, source: 'local' });
});

// 7. Get OAuth URL
app.get('/api/auth/url', (req, res) => {
  const originUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const redirectUri = `${originUrl}/auth/callback`;

  if (!supabaseUrl) {
    // If Supabase is not configured, we return a mock authorization URL that directly triggers success
    return res.json({
      url: `${originUrl}/auth/callback?mock=true&email=visitor@vsu.edu.ph&name=Visayas%20Explorer`
    });
  }

  // If Supabase is active, fetch actual Google Sign In authorization URL
  const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;
  res.json({ url: authUrl });
});

// 8. OAuth Callback Handler
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, mock, email, name } = req.query;

  let userData = {
    id: 'supabase-user',
    name: (name as string) || 'VSU Student',
    email: (email as string) || 'student@vsu.edu.ph',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    consent_given: false,
    consent_timestamp: null,
    created_at: new Date().toISOString()
  };

  if (mock === 'true') {
    const id = userData.email.replace(/[^a-zA-Z0-9]/g, '-');
    userData.id = id;
    if (!localProfiles[id]) {
      localProfiles[id] = userData;
    }
    currentSessionUser = localProfiles[id];
  } else if (supabaseAdmin && code) {
    try {
      // Direct session exchange is typically managed by standard client libraries or cookies.
      // Since it is popup-based, we extract session or let browser exchange tokens.
      console.log('Received auth callback with code:', code);
    } catch (err) {
      console.error('OAuth token exchange failure:', err);
    }
  }

  // Send success message to parent window and close popup
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>VSU E-Passport Authentication</title>
      <style>
        body {
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #fff8f5;
          color: #001b0f;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .spinner {
          border: 4px solid #f5ece7;
          border-top: 4px solid #001b0f;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="spinner"></div>
      <h2>Logging you into VSU E-Passport...</h2>
      <p>This window will close automatically once the authentication completes.</p>
      <script>
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_AUTH_SUCCESS', 
            user: ${JSON.stringify(userData)} 
          }, '*');
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          window.location.href = '/';
        }
      </script>
    </body>
    </html>
  `);
});

// =========================================================================
// VITE ENGINE SETUP OR STATIC FRONTEND SERVING
// =========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
