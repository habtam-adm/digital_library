// Conversion between the Gregorian and the Ethiopian (Amete Mihret) calendars.
// The Ethiopian year has 12 months of 30 days plus Pagume, a 5 or 6 day month.

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;

const MONTHS_AM = [
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
];

const MONTHS_EN = [
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
];

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

function jdnToEthiopian(jdn) {
  const offset = jdn - JD_EPOCH_OFFSET_AMETE_MIHRET;
  const r = mod(offset, 1461);
  const n = mod(r, 365) + 365 * Math.floor(r / 1460);
  return {
    year: 4 * Math.floor(offset / 1461) + Math.floor(r / 365) - Math.floor(r / 1460),
    month: Math.floor(n / 30) + 1,
    day: mod(n, 30) + 1,
  };
}

// Accepts a Date, an ISO string or a "YYYY-MM-DD HH:mm:ss" string.
function toEthiopian(value) {
  const date = value instanceof Date ? value : new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return null;
  return jdnToEthiopian(
    gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate()),
  );
}

function formatEthiopian(value, locale = "en") {
  const ec = toEthiopian(value);
  if (!ec) return "";
  const months = locale === "am" ? MONTHS_AM : MONTHS_EN;
  return `${months[ec.month - 1]} ${ec.day}, ${ec.year}`;
}

// Ethiopian year that a Gregorian year mostly overlaps with.
function gregorianYearToEthiopianYear(gregorianYear) {
  return gregorianYear - 8;
}

module.exports = {
  MONTHS_AM,
  MONTHS_EN,
  toEthiopian,
  formatEthiopian,
  gregorianYearToEthiopianYear,
};
