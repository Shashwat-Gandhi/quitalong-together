export function toDateKey(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function aggregateDailyTotals(events) {
  const totals = new Map();
  for (const event of events) {
    const key = `${event.user_id}:${toDateKey(event.log_date)}`;
    totals.set(key, (totals.get(key) || 0) + event.cigarettes);
  }
  return totals;
}

export function eventsToDailyLogs(events) {
  const byUserDate = new Map();

  for (const event of events) {
    const dateKey = toDateKey(event.log_date);
    const mapKey = `${event.user_id}:${dateKey}`;
    if (!byUserDate.has(mapKey)) {
      byUserDate.set(mapKey, {
        user_id: event.user_id,
        log_date: dateKey,
        cigarettes: 0,
        updated_at: event.created_at,
      });
    }

    const row = byUserDate.get(mapKey);
    row.cigarettes += event.cigarettes;
    if (new Date(event.created_at) > new Date(row.updated_at)) {
      row.updated_at = event.created_at;
    }
  }

  return [...byUserDate.values()];
}
