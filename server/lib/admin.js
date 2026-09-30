const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'shashwatgandhi88@gmail.com').toLowerCase();

export function isAdminEmail(email) {
  return email?.toLowerCase() === ADMIN_EMAIL;
}
