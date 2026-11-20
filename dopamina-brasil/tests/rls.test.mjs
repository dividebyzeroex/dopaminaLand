import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('private tables deny public reads/writes while service role still works', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE ROLE anon NOLOGIN;
      CREATE ROLE authenticated NOLOGIN;
      CREATE ROLE service_role NOLOGIN BYPASSRLS;
      CREATE TABLE sessions (id int PRIMARY KEY);
      CREATE TABLE intent_events (id int PRIMARY KEY);
      CREATE TABLE price_alerts (id int PRIMARY KEY);
      INSERT INTO sessions VALUES (1);
      INSERT INTO intent_events VALUES (1);
      INSERT INTO price_alerts VALUES (1);
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON sessions, intent_events, price_alerts TO PUBLIC, anon, authenticated;
      CREATE POLICY "unversioned permissive policy" ON sessions FOR ALL USING (true) WITH CHECK (true);
    `);
    const migration = await readFile(new URL('../supabase/migrations/003_lock_down_analytics_reads.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration); // Idempotence, including already removed policy names.
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      for (const table of ['sessions', 'intent_events', 'price_alerts']) {
        for (const sql of [`SELECT * FROM ${table}`, `INSERT INTO ${table} VALUES (2)`, `UPDATE ${table} SET id=2`, `DELETE FROM ${table}`]) {
          await assert.rejects(db.query(sql), /permission denied/);
        }
      }
      await db.exec('RESET ROLE');
    }
    await db.exec('SET ROLE service_role');
    for (const table of ['sessions', 'intent_events', 'price_alerts']) {
      assert.equal((await db.query(`SELECT * FROM ${table}`)).rows.length, 1);
      await db.exec(`INSERT INTO ${table} VALUES (2); UPDATE ${table} SET id=3 WHERE id=2; DELETE FROM ${table} WHERE id=3;`);
    }
  } finally { await db.close(); }
});
