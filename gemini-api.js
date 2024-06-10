const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI('AIzaSyD9pVcBt9WDryehHU9AtnAFjXjJc2HC3yQ');

async function run(_prompt) {
  
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  const prompt = _prompt;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text;
}

//run('こんにちは').then((res) => console.log(res));
module.exports.run = run 