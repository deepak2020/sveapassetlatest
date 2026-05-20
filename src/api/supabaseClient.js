import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Map Base44 entity names → Supabase table names
const TABLE_MAP = {
  Lesson: 'lessons',
  CivicTopic: 'civic_topics',
  QuizResult: 'quiz_results',
  UserVocabulary: 'user_vocabulary',
  UserSRSCard: 'user_srs_cards',
  ClozeSentence: 'cloze_sentences',
  User: 'profiles',
  GenerationJob: 'generation_jobs',
  TestEntity: 'test_entities',
};

// Tables that store user-scoped rows and need user_id on insert
const USER_OWNED_TABLES = new Set([
  'quiz_results',
  'user_vocabulary',
  'user_srs_cards',
]);

// Base44 used "created_date" as a sort key; Supabase stores it as "created_at"
function mapSortColumn(col) {
  return col === 'created_date' ? 'created_at' : col;
}

// Normalise a Supabase row so callers see "created_date" like they expect
function normaliseRow(row) {
  if (!row) return row;
  return { created_date: row.created_at, ...row };
}

function parseSort(sort) {
  if (!sort) return [];
  return sort.split(',').map((s) => {
    s = s.trim();
    const ascending = !s.startsWith('-');
    const column = mapSortColumn(s.replace(/^-/, '').trim());
    return { column, ascending };
  });
}

function makeEntityClient(tableName) {
  return {
    async list(sort, limit) {
      let q = supabase.from(tableName).select('*');
      for (const { column, ascending } of parseSort(sort)) {
        q = q.order(column, { ascending });
      }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(normaliseRow);
    },

    async filter(conditions = {}, sort, limit) {
      let q = supabase.from(tableName).select('*');
      for (const [key, value] of Object.entries(conditions)) {
        if (value !== undefined && value !== null) q = q.eq(key, value);
      }
      for (const { column, ascending } of parseSort(sort)) {
        q = q.order(column, { ascending });
      }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(normaliseRow);
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return normaliseRow(data);
    },

    async create(payload) {
      let row = payload;
      if (USER_OWNED_TABLES.has(tableName) && !row.user_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) row = { user_id: user.id, ...row };
      }
      const { data, error } = await supabase
        .from(tableName)
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return normaliseRow(data);
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normaliseRow(data);
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? '',
    ...profile,
  };
}

// Drop-in replacement for the Base44 SDK surface used across the app
export const base44 = {
  entities: Object.fromEntries(
    Object.entries(TABLE_MAP).map(([name, table]) => [name, makeEntityClient(table)])
  ),

  auth: {
    async me() {
      return getProfile();
    },

    async isAuthenticated() {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },

    async logout(returnUrl) {
      await supabase.auth.signOut();
      window.location.href = returnUrl || '/';
    },

    redirectToLogin(returnUrl) {
      const redirectTo = `${window.location.origin}/auth/callback${
        returnUrl ? `?next=${encodeURIComponent(returnUrl)}` : ''
      }`;
      supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    },

    async updateMe(fields) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (fields.full_name) {
        await supabase.auth.updateUser({ data: { full_name: fields.full_name } });
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...fields }, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return normaliseRow(data);
    },
  },

  functions: {
    async invoke(name, params = {}) {
      const response = await fetch(`/api/functions/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Function ${name} failed: ${text}`);
      }
      return response.json();
    },
  },

  integrations: {
    Core: {
      async InvokeLLM(params) {
        const response = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!response.ok) throw new Error('LLM call failed');
        return response.json();
      },
    },
  },

  // No-op – replace with your own analytics provider if needed
  analytics: { track: () => {} },
};
