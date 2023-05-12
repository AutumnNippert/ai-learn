const { Configuration, OpenAIApi } = require("openai");
const constants = require('constants');
require('dotenv').config();

// Set your API key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function generateResponse(messages) {
    try {
        const completion = openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: constants.BOT_PERSONALITY },
                ...messages
            ],
        });
        return completion.data.choices[0].text;
    } catch (error) {
        console.error(error);
        return error.message;
    }
}

async function generateImage(prompt) {
    try {
        const response = await openai.image.create({
            prompt: prompt,
            n: 1,
            size: "512x512"
        });
        return response.data[0].url;
    } catch (error) {
        console.error(error);
        return null;
    }
}

if (require.main === module) {
    //testing
    const prompt = "Hi How are you?";
    const messages = [{ role: "user", content: prompt }];
    const description = generateResponse(messages);
    console.log(description);
}

module.exports = { generateResponse, generateImage };