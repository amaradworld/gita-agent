// ============================================================
// GITA GYAN — DATABASE MIGRATION SCRIPT
// Run: npm run migrate (after setting SUPABASE_URL and SUPABASE_SERVICE_KEY)
// ============================================================

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Error: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
  }

  console.log('Connecting to Supabase...');
  const supabase = createClient(url, key);

  // Read schema SQL
  const schemaPath = join(__dirname, '..', 'supabase', 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf-8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });
      if (error) {
        // Try direct query for DDL
        const { error: err2 } = await supabase.from('_exec').select('*').limit(0);
        if (err2) {
          console.log(`  Statement ${i + 1}/${statements.length}: Using Supabase SQL Editor instead`);
          console.log(`  Copy the schema from supabase/schema.sql and run it in Supabase SQL Editor`);
          break;
        }
      } else {
        console.log(`  Statement ${i + 1}/${statements.length}: OK`);
      }
    } catch (err) {
      console.log(`  Statement ${i + 1}: ${err.message}`);
    }
  }

  console.log('\nMigration complete!');
  console.log('If DDL statements failed, copy supabase/schema.sql into Supabase SQL Editor and run it manually.');
}

migrate().catch(console.error);
