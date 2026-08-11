import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney, currencySymbol } from "../lib/currency.ts";

test("formatIDR 50000 → 'Rp 50.000'", () => {
  assert.equal(formatMoney(50000), "Rp 50.000");
});

test("formatIDR 1500000 → 'Rp 1.500.000'", () => {
  assert.equal(formatMoney(1500000), "Rp 1.500.000");
});

test("formatIDR 0 → 'Rp 0'", () => {
  assert.equal(formatMoney(0), "Rp 0");
});

test("formatIDR negative → '-Rp 5.000'", () => {
  assert.equal(formatMoney(-5000), "-Rp 5.000");
});

test("formatUSD 1234.5 → '$1,234.50'", () => {
  assert.equal(formatMoney(1234.5, "USD"), "$1,234.50");
});

test("formatJPY 1000 → '￥1,000' (0 decimals)", () => {
  assert.equal(formatMoney(1000, "JPY"), "￥1,000");
});

test("currencySymbol returns symbol only", () => {
  assert.equal(currencySymbol("IDR"), "Rp");
  assert.equal(currencySymbol("USD"), "$");
});
