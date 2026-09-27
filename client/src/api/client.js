async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  signup: (body) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) =>
    request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  getInvite: () => request('/api/pair/invite'),
  getMembers: () => request('/api/pair/members'),
  getTodayLogs: () => request('/api/logs/today'),
  saveTodayLog: (cigarettes) =>
    request('/api/logs/today', { method: 'PUT', body: JSON.stringify({ cigarettes }) }),
  getLogs: (from, to) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return request(`/api/logs${qs ? `?${qs}` : ''}`);
  },
  getDashboardStats: () => request('/api/stats/dashboard'),
  getSummaryStats: () => request('/api/stats/summary'),
  updateProfile: (displayName) =>
    request('/api/settings/profile', { method: 'PATCH', body: JSON.stringify({ displayName }) }),
};
