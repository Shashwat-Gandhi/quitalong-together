/**
 * Streak and stats calculations for smoke-free days.
 * A smoke-free day requires cigarettes === 0 AND a log entry for that day.
 */

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

function buildLogMap(logs) {
  const map = new Map();
  for (const log of logs) {
    const key = typeof log.log_date === 'string'
      ? log.log_date.slice(0, 10)
      : toDateKey(new Date(log.log_date));
    map.set(key, (map.get(key) || 0) + log.cigarettes);
  }
  return map;
}

export function isSmokeFreeDay(logMap, dateKey) {
  if (!logMap.has(dateKey)) return false;
  return logMap.get(dateKey) === 0;
}

export function calculateCurrentStreak(logMap, todayKey) {
  let streak = 0;
  let cursor = todayKey;

  if (isSmokeFreeDay(logMap, cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  } else if (logMap.has(cursor)) {
    return 0;
  } else {
    cursor = addDays(cursor, -1);
  }

  while (isSmokeFreeDay(logMap, cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function calculateLongestStreak(logMap) {
  if (logMap.size === 0) return 0;

  const sortedKeys = [...logMap.keys()].sort();
  let longest = 0;
  let current = 0;

  for (const key of sortedKeys) {
    if (logMap.get(key) === 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

export function getWeekRange(todayKey) {
  const today = parseDateKey(todayKey);
  const day = today.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    days.push(toDateKey(d));
  }

  return days;
}

export function getMonthStart(todayKey) {
  const [year, month] = todayKey.split('-');
  return `${year}-${month}-01`;
}

export function sumCigarettesInRange(logMap, fromKey, toKey) {
  let total = 0;
  let cursor = fromKey;

  while (cursor <= toKey) {
    if (logMap.has(cursor)) {
      total += logMap.get(cursor);
    }
    cursor = addDays(cursor, 1);
  }

  return total;
}

export function buildUserStats(logs, todayKey) {
  const logMap = buildLogMap(logs);

  return {
    currentStreak: calculateCurrentStreak(logMap, todayKey),
    longestStreak: calculateLongestStreak(logMap),
    monthTotal: sumCigarettesInRange(logMap, getMonthStart(todayKey), todayKey),
    logMap,
  };
}

export function buildWeekChartData(user1Logs, user2Logs, todayKey, user1Name, user2Name) {
  const weekDays = getWeekRange(todayKey);
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const map1 = buildLogMap(user1Logs);
  const map2 = buildLogMap(user2Logs);

  return {
    labels,
    datasets: [
      {
        label: user1Name,
        data: weekDays.map((d) => (map1.has(d) ? map1.get(d) : 0)),
      },
      {
        label: user2Name,
        data: weekDays.map((d) => (map2.has(d) ? map2.get(d) : 0)),
      },
    ],
  };
}

export function getTodayInTimezone(timezone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}
