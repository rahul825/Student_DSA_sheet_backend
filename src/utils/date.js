// All helpers work on "YYYY-MM-DD" strings so there is no timezone drift.

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// `tzOffset` is the user's offset from UTC in minutes (IST = 330).
function todayInTz(tzOffset = 0) {
  return new Date(Date.now() + tzOffset * 60000).toISOString().slice(0, 10);
}

function isWeekend(dateStr) {
  const day = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

module.exports = { addDays, todayInTz, isWeekend };
