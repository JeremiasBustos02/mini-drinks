import assert from "node:assert/strict";
import test from "node:test";

import { updateComboAndReplaceItems } from "@/lib/admin/combo-concurrency";

test("actualiza con la versión actual y reemplaza los componentes", async () => {
  let componentsReplaced = false;

  const result = await updateComboAndReplaceItems(
    async () => true,
    async () => {
      componentsReplaced = true;
    },
  );

  assert.equal(result, "success");
  assert.equal(componentsReplaced, true);
});

test("una versión vieja informa conflicto y no toca los componentes", async () => {
  let componentsReplaced = false;

  const result = await updateComboAndReplaceItems(
    async () => false,
    async () => {
      componentsReplaced = true;
    },
  );

  assert.equal(result, "conflict");
  assert.equal(componentsReplaced, false);
});

test("un segundo guardado con la versión refrescada vuelve a actualizar", async () => {
  let storedVersion = 1;
  let expectedVersion = 1;

  const save = () =>
    updateComboAndReplaceItems(
      async () => {
        if (expectedVersion !== storedVersion) return false;
        storedVersion += 1;
        return true;
      },
      async () => {},
    );

  assert.equal(await save(), "success");
  expectedVersion = storedVersion;
  assert.equal(await save(), "success");
});
