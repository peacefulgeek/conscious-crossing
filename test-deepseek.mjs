import { generateArticle } from './src/lib/deepseek-generate.mjs';
async function run() {
  console.log("Testing generateArticle...");
  try {
    const res = await generateArticle({
      title: "The Five Stages of Dying: What Kubler-Ross Got Right and Wrong",
      category: "conscious-dying",
      tags: ["kubler-ross", "grief", "stages"]
    });
    console.log("Success:", res.title);
    console.log("Word count:", res.wordCount);
  } catch (err) {
    console.error("Error generating:", err);
  }
}
run();
