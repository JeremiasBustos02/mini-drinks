import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

async function main() {
  const authUserId = process.argv[2];

  if (!authUserId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(authUserId)) {
    throw new Error("Uso: npm run db:add-admin -- <SUPABASE_AUTH_USER_UUID>");
  }

  const [{ db }, { adminUsers }] = await Promise.all([
    import("@/lib/db"),
    import("@/lib/db/schema"),
  ]);

  const [admin] = await db
    .insert(adminUsers)
    .values({ authUserId })
    .onConflictDoNothing({ target: adminUsers.authUserId })
    .returning({ id: adminUsers.id });

  console.log(admin ? "Administrador registrado." : "El usuario ya estaba registrado como administrador.");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
