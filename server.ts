import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables — .env.local overrides .env (mirrors Vite's convention)
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

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

// Initialize Supabase Client (service role for server-side operations)
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

// =========================================================================
// LOCAL FALLBACK MEMORY STORES
// =========================================================================

// Stores profiles in memory when Supabase is not configured
let localProfiles: Record<string, any> = {};
// Stores stamps in memory when Supabase is not configured
let localStamps: Record<string, any[]> = {};

// Current session user (kept in memory for local mode)
let currentSessionUser: any = null;

// =========================================================================
// HELPER: Build a profile object from Supabase data
// =========================================================================
function buildProfile(userId: string, meta: Record<string, any>, email: string): Record<string, any> {
  return {
    id: userId,
    first_name: meta.first_name || null,
    last_name: meta.last_name || null,
    name: `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'VSU Student',
    email,
    student_id: meta.student_id || null,
    avatar_url: null,
    consent_given: false,
    consent_timestamp: null,
    created_at: new Date().toISOString()
  };
}

// =========================================================================
// HELPER: Validate that decoded bytes actually match a real image format
// by checking "magic bytes" (file signature) instead of trusting the
// data:image/... prefix, which is just a string the client can fake.
// =========================================================================
function isValidImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng =
    buffer[0] === 0x89 && buffer[1] === 0x50 &&
    buffer[2] === 0x4E && buffer[3] === 0x47;

  return isJpeg || isPng;
}

// =========================================================================
// HELPER: Strip anything unsafe from an ID before it's used in a file path.
// =========================================================================
function sanitizeId(id: string): string {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '');
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabaseConnected: !!supabaseAdmin });
});

// 2. Auth Session endpoint (Get current user state)
app.get('/api/auth/session', async (req, res) => {
  res.json({ user: currentSessionUser || null });
});

// 3. Sign Up — creates a new Supabase Auth user and profile row
app.post('/api/auth/signup', async (req, res) => {
  const { firstName, lastName, studentId, email, password } = req.body;

  if (!firstName || !lastName || !studentId || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  // If Supabase is configured, create a real account
  if (supabaseAdmin) {
    try {
      // Use signUp (works with anon key OR service role key).
      // admin.createUser requires service role only — signUp is universal.
      const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            student_id: studentId,
            full_name: `${firstName} ${lastName}`
          }
        }
      });

      if (authError) {
        console.error('Supabase auth signup error:', authError);
        if (
          authError.message?.toLowerCase().includes('already registered') ||
          authError.message?.toLowerCase().includes('already exists') ||
          authError.message?.toLowerCase().includes('user already')
        ) {
          return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
        }
        return res.status(400).json({ error: authError.message || 'Failed to create account.' });
      }

      if (!authData?.user) {
        return res.status(500).json({ error: 'User creation returned empty response.' });
      }

      // Upsert the profile row so all custom fields are saved regardless of trigger timing
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`,
          email,
          student_id: studentId,
          avatar_url: null,
          consent_given: false
        }, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.error('Error upserting profile in Supabase:', profileError);
      }

      const profile = profileData || buildProfile(authData.user.id, { first_name: firstName, last_name: lastName, student_id: studentId }, email);
      currentSessionUser = profile;
      if (!localStamps[profile.id]) localStamps[profile.id] = [];

      return res.status(201).json({ user: profile, source: 'supabase' });
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
    }
  }

  // ── LOCAL FALLBACK (no Supabase configured) ──────────────────────────────
  const existingUser = Object.values(localProfiles).find((p: any) => p.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  const localId = `local-${Date.now()}`;
  const newProfile = {
    ...buildProfile(localId, { first_name: firstName, last_name: lastName, student_id: studentId }, email),
    // Store password hash equivalent for local auth
    _password: password
  };

  localProfiles[localId] = newProfile;
  localStamps[localId] = [];
  currentSessionUser = { ...newProfile, _password: undefined };

  return res.status(201).json({ user: currentSessionUser, source: 'local' });
});

// 4. Login — authenticates with email and password
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // If Supabase is configured, use Supabase Auth
  if (supabaseAdmin) {
    try {
      // Sign in with password using Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Supabase login error:', authError);
        if (authError.message?.toLowerCase().includes('invalid') || authError.message?.toLowerCase().includes('credentials')) {
          return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
        }
        return res.status(401).json({ error: authError.message || 'Login failed.' });
      }

      if (!authData?.user) {
        return res.status(401).json({ error: 'Login failed. Please try again.' });
      }

      // Fetch profile from profiles table
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Profile fetch error after login:', profileError);
        // Build a basic profile from auth metadata if profile row not found
        const meta = authData.user.user_metadata || {};
        const fallbackProfile = buildProfile(authData.user.id, meta, email);
        currentSessionUser = fallbackProfile;
        if (!localStamps[fallbackProfile.id]) localStamps[fallbackProfile.id] = [];
        return res.json({ user: fallbackProfile, source: 'supabase-auth' });
      }

      currentSessionUser = profileData;
      if (!localStamps[profileData.id]) localStamps[profileData.id] = [];
      return res.json({ user: profileData, source: 'supabase' });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
    }
  }

  // ── LOCAL FALLBACK ─────────────────────────────────────────────────────
  const matchedUser = Object.values(localProfiles).find(
    (p: any) => p.email === email && p._password === password
  ) as any;

  if (!matchedUser) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  currentSessionUser = { ...matchedUser, _password: undefined };
  if (!localStamps[matchedUser.id]) localStamps[matchedUser.id] = [];
  return res.json({ user: currentSessionUser, source: 'local' });
});

// 5. Consent agreement endpoint
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
  } else if (currentSessionUser && currentSessionUser.id === userId) {
    currentSessionUser.consent_given = consentGiven;
    currentSessionUser.consent_timestamp = timestamp;
    localProfiles[userId] = { ...currentSessionUser };
  }
  
  if (currentSessionUser && currentSessionUser.id === userId) {
    currentSessionUser = { ...currentSessionUser, consent_given: consentGiven, consent_timestamp: timestamp };
  }

  res.json({ profile: currentSessionUser, source: 'local' });
});

// 6. Get stamps for the current user
app.get('/api/stamps', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const safeUserId = sanitizeId(userId);

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('stamps')
        .select('*')
        .eq('user_id', safeUserId);

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
  const userStamps = localStamps[safeUserId] || [];
  res.json({ stamps: userStamps, source: 'local' });
});

// 7. Upload stamp photo & insert stamp row
app.post('/api/stamps/upload', async (req, res) => {
  const { userId, landmarkId, photoBase64 } = req.body;
  
  if (!userId || !landmarkId || !photoBase64) {
    return res.status(400).json({ error: 'Missing required fields: userId, landmarkId, or photoBase64' });
  }

  // ── Sanitize IDs before they're ever used in a file path or storage key ──
  const safeUserId = sanitizeId(userId);
  const safeLandmarkId = sanitizeId(landmarkId);  

  if (!safeUserId || !safeLandmarkId) {
    return res.status(400).json({ error: 'Invalid user or landmark identifier.' });
  }

  const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // ── Size check: 5MB limit, measured on the actual decoded bytes ──
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  if (buffer.length === 0) {
    return res.status(400).json({ error: 'Photo data is empty or corrupted. Please try again.' });
  }
  if (buffer.length > MAX_SIZE_BYTES) {
    return res.status(400).json({ error: 'Photo is too large. Please use an image under 5MB.' });
  }

  // ── Type check: verify actual file signature, not just the claimed MIME type ──
  if (!isValidImageBuffer(buffer)) {
    return res.status(400).json({ error: 'File does not appear to be a valid JPEG or PNG image.' });
  }

  const filename = `${safeUserId}-${safeLandmarkId}-${Date.now()}.jpg`;

  let photoUrl = '';

  // If Supabase is connected, attempt uploading to Supabase Storage Bucket 'stamps'
  if (supabaseAdmin) {
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('stamps')
        .upload(`${safeUserId}/${safeLandmarkId}.jpg`, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
      } else {
        const { data: urlData } = supabaseAdmin.storage
          .from('stamps')
          .getPublicUrl(`${safeUserId}/${safeLandmarkId}.jpg`);
        
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
    user_id: safeUserId,
    landmark_id: safeLandmarkId,
    photo_url: photoUrl,
    stamped_at: new Date().toISOString()
  };

  // Upsert stamp in Supabase
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('stamps')
        .upsert({
          user_id: safeUserId,
          landmark_id: safeLandmarkId,
          photo_url: photoUrl,
          stamped_at: new Date().toISOString()
        }, { onConflict: 'user_id,landmark_id' })
        .select();  

      if (error) {
        console.error('Error inserting stamp in Supabase:', error);
      } else {
        return res.json({ stamp: data?.[0] || newStamp, source: 'supabase', message: 'Landmark stamped successfully!' });
      }
    } catch (err) {
      console.error('Failed to upsert stamp to Supabase:', err);
    }
  }

  // Fallback insert/update in memory
  if (!localStamps[safeUserId]) {
    localStamps[safeUserId] = [];
  }

  // Remove existing stamp for same landmark if it exists
  localStamps[safeUserId] = localStamps[safeUserId].filter(s => s.landmark_id !== safeLandmarkId);
  localStamps[safeUserId].push(newStamp);

  res.json({ stamp: newStamp, source: 'local', message: 'Landmark stamped successfully!' });
});

// =========================================================================
// GLOBAL JSON ERROR HANDLER — ensures crashes never return HTML to the client
// =========================================================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
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
