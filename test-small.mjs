import { generateArticle } from './src/lib/deepseek-generate.mjs';
async function run() {
  console.log("Testing small generation...");
  try {
    const res = await generateArticle({
      title: "Short Test",
      category: "conscious-dying",
      tags: ["test"]
    });
    console.log("Success:", res.title);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
