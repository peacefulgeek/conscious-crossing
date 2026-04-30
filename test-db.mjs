import { query } from './src/lib/db.mjs';
async function test() {
  console.log("Testing DB...");
  try {
    const { rows } = await query("SELECT COUNT(*) FROM articles");
    console.log("DB OK:", rows[0].count, "articles");
    const { rows: r2 } = await query("SELECT slug FROM articles LIMIT 1");
    console.log("Sample slug:", r2[0]?.slug);
    
    // Test array insert
    await query("INSERT INTO articles (slug, title, body, category, tags) VALUES ($1,$2,$3,$4,$5::text[]) ON CONFLICT DO NOTHING", 
      ['test-array', 'Test', 'Body', 'test', ['tag1', 'tag2']]);
    console.log("Array insert OK");
    await query("DELETE FROM articles WHERE slug = 'test-array'");
    console.log("Cleanup OK");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
