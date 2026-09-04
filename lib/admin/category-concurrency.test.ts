import assert from "node:assert/strict";
import test from "node:test";

import { updateCategoryWithVersion } from "@/lib/admin/category-concurrency";

type StoredCategory = { active: boolean; name: string; version: number };

function mutate(
  category: StoredCategory,
  expectedVersion: number,
  patch: Partial<Omit<StoredCategory, "version">>,
) {
  return updateCategoryWithVersion(async () => {
    if (category.version !== expectedVersion) return false;
    Object.assign(category, patch);
    category.version += 1;
    return true;
  });
}

test("la versión actual permite actualizar una categoría", async () => {
  const category = { active: true, name: "Miniaturas", version: 1 };
  assert.equal(await mutate(category, 1, { name: "Minis" }), "success");
  assert.equal(category.version, 2);
});

test("una versión vieja informa conflicto sin modificar la categoría", async () => {
  const category = { active: true, name: "Miniaturas", version: 2 };
  assert.equal(await mutate(category, 1, { name: "Minis" }), "conflict");
  assert.deepEqual(category, { active: true, name: "Miniaturas", version: 2 });
});

test("un segundo guardado tras refrescar vuelve a funcionar", async () => {
  const category = { active: true, name: "Miniaturas", version: 1 };
  assert.equal(await mutate(category, 1, { name: "Minis" }), "success");
  assert.equal(await mutate(category, category.version, { name: "Miniaturas" }), "success");
  assert.equal(category.version, 3);
});

test("los toggles incrementan la versión", async () => {
  const category = { active: true, name: "Miniaturas", version: 4 };
  assert.equal(await mutate(category, 4, { active: false }), "success");
  assert.equal(await mutate(category, 5, { active: true }), "success");
  assert.equal(category.version, 6);
});
