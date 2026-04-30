import OpenAI from 'openai';
const client = new OpenAI({
  apiKey: "sk-82bdad0a1fd34987b73030504ae67080",
  baseURL: "https://api.deepseek.com",
});
console.log("Testing DeepSeek client...");
try {
  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [{ role: 'user', content: 'Say hi' }],
    max_tokens: 10,
  });
  console.log("Success:", response.choices[0].message.content);
} catch (e) {
  console.error("Error:", e.message);
}
