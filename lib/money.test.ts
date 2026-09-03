import assert from "node:assert/strict";
import test from "node:test";

import { formatArsInput, parseArsToCents } from "@/lib/money";

test("convierte pesos enteros a centavos", () => {
  assert.equal(parseArsToCents("5900"), 590000);
});

test("acepta hasta dos decimales con coma o punto", () => {
  assert.equal(parseArsToCents("5900,5"), 590050);
  assert.equal(parseArsToCents("5900.05"), 590005);
});

test("rechaza formatos ambiguos, negativos y más de dos decimales", () => {
  for (const value of ["5.900", "-1", "10,123", "abc", ""]) {
    assert.throws(() => parseArsToCents(value));
  }
});

test("formatea centavos para volver a editar sin perder precisión", () => {
  assert.equal(formatArsInput(590000), "5900");
  assert.equal(formatArsInput(590050), "5900,50");
});
