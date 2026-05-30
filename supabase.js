const SUPABASE_URL = 'https://hovvgdptshfikguddsui.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdnZnZHB0c2hmaWtndWRkc3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODcwNzAsImV4cCI6MjA5NTQ2MzA3MH0.eYGiPOcaKDQhmEuMJmVJXVnfXx8rI2F4rBYNzMjHhFM';

const supa = {
  async request(path, method = 'GET', body = null, extra = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : '',
        ...extra
      },
      body: body ? JSON.stringify(body) : null
    });
    if (!res.ok) { const e = await res.json(); throw e; }
    return res.status === 204 ? null : res.json();
  },

  async signUp(email, password, name, phone) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) throw data;
    // Create profile
    await this.request('profiles', 'POST', {
      id: data.user.id,
      email, name, phone, balance: 0
    });
    return data;
  },

  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) throw data;
    localStorage.setItem('se_token', data.access_token);
    localStorage.setItem('se_user', JSON.stringify(data.user));
    return data;
  },

  async getProfile(userId) {
    const rows = await this.request(`profiles?id=eq.${userId}&select=*`);
    return rows[0];
  },

  async updateBalance(userId, newBalance) {
    return this.request(`profiles?id=eq.${userId}`, 'PATCH', { balance: newBalance });
  },

  async addTransaction(userId, type, description, amount) {
    return this.request('transactions', 'POST', {
      user_id: userId, type, description, amount,
      created_at: new Date().toISOString()
    });
  },

  async getTransactions(userId) {
    return this.request(`transactions?user_id=eq.${userId}&order=created_at.desc&limit=10`);
  },

  getUser() {
    const u = localStorage.getItem('se_user');
    return u ? JSON.parse(u) : null;
  },

  getToken() { return localStorage.getItem('se_token'); },

  logout() {
    localStorage.removeItem('se_token');
    localStorage.removeItem('se_user');
    window.location.href = 'index.html';
  }
};
