// Conversion between the Gregorian and the Ethiopian (Amete Mihret) calendars.
// The Ethiopian year has 12 months of 30 days plus Pagume, a 5 or 6 day month.

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;

export const ETHIOPIAN_MONTHS = {
  am: [
    "መስከረም",
    "ጥቅምት",
    "ኅዳር",
    "ታኅሣሥ",
    "ጥር",
    "የካቲት",
    "መጋቢት",
    "ሚያዝያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
    "ጳጉሜን",
  ],
  en: [
    "Meskerem",
    "Tikimt",
    "Hidar",
    "Tahsas",
    "Tir",
    "Yekatit",
    "Megabit",
    "Miazia",
    "Ginbot",
    "Sene",
    "Hamle",
    "Nehase",
    "Pagume",
  ],
};

const mod = (a, b) => ((a % b) + b) % b;

function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function toEthiopian(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return null;

  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const offset = jdn - JD_EPOCH_OFFSET_AMETE_MIHRET;
  const r = mod(offset, 1461);
  const n = mod(r, 365) + 365 * Math.floor(r / 1460);
  return {
    year: 4 * Math.floor(offset / 1461) + Math.floor(r / 365) - Math.floor(r / 1460),
    month: Math.floor(n / 30) + 1,
    day: mod(n, 30) + 1,
  };
}

export function formatEthiopian(value, locale = "en") {
  const ec = toEthiopian(value);
  if (!ec) return "";
  const months = ETHIOPIAN_MONTHS[locale] || ETHIOPIAN_MONTHS.en;
  return `${months[ec.month - 1]} ${ec.day}, ${ec.year}`;
}

export function formatGregorian(value, locale = "en") {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "am" ? "am-ET" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Both calendars side by side, e.g. "14 Aug 2026 (ነሐሴ 8, 2018 ዓ.ም)".
export function formatDualDate(value, locale = "en") {
  if (!value) return "";
  const suffix = locale === "am" ? "ዓ.ም" : "E.C.";
  return `${formatGregorian(value, locale)} (${formatEthiopian(value, locale)} ${suffix})`;
}

export function gregorianYearToEthiopianYear(year) {
  return year - 8;
}
