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
    messages.unshift({ role: "system", content: config.BOT_PERSONALITY })
    //console.log(messages);
    try {
        let completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        });
        return String(completion.data.choices[0].message.content);
    } catch (error) {
        console.error(error);
        return String(error.message);
    }
}

async function generateImage(prompt) {
    try {
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "512x512",
            response_format: "b64_json",
        });
        return "data:image/png;base64, " + String(response.data.data[0].b64_json); // returns as base64 encoded image
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

if (require.main === module) {
    //testing
    //make imgae
    generateImage("A painting of a cat sitting on a chair. Painted by the famous artist Pablo Picasso.");
}

module.exports = { generateResponse, generateImage };