const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
let config = fs.readFileSync("res/config.json");
config = JSON.parse(config);
require('dotenv').config();

// Set your API key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateResponse(messages) {
    messages.unshift({ role: "system", content: config.BOT_PERSONALITY})
    try {
        let completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        });
        console.log(completion.data.choices);
        return String(completion.data.choices[0].message.content);
    } catch (error) {
        console.error(error);
        return String(error.message);
    }
}

async function generateImage(prompt) {
    try {
        const response = await openai.image.create({
            prompt: prompt,
            n: 1,
            size: "512x512"
        });
        return String(response.data[0].url);
    } catch (error) {
        console.error(error);
        return null;
    }
}

if (require.main === module) {
    //testing
    const prompt = "Hi How are you?";
    const messages = [{ "role": "user", 'content': prompt }];
    const description = generateResponse(messages);
    console.log(description);
}

module.exports = { generateResponse, generateImage };