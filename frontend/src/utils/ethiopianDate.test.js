import { formatEthiopian, toEthiopian } from "./ethiopianDate";

test("Ethiopian new year maps to Meskerem 1", () => {
  expect(toEthiopian("2024-09-11")).toEqual({ year: 2017, month: 1, day: 1 });
  expect(toEthiopian("2023-09-12")).toEqual({ year: 2016, month: 1, day: 1 });
});

test("formats dates with Amharic month names", () => {
  expect(formatEthiopian("2026-07-31", "am")).toBe("ሐምሌ 24, 2018");
  expect(formatEthiopian("2026-07-31", "en")).toBe("Hamle 24, 2018");
});

test("returns null for an unusable value", () => {
  expect(toEthiopian("")).toBeNull();
  expect(toEthiopian("not a date")).toBeNull();
});
