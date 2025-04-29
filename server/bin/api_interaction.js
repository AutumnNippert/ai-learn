import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";

let config = fs.readFileSync("res/content_config.json");
config = JSON.parse(config);
dotenv.config();

// Set your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateResponse(messages) {
    messages.unshift({ role: "system", content: config.BOT_PERSONALITY })
    //console.log(messages);
    for (; ;) {
        try {
            let completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
            });
            return String(completion.choices[0].message.content);
        } catch (error) {
            if (!error.message.includes("429")) {
                console.error(error);
                return String(error.message);
            }
            // continue in while loop and try again
        }
    }
}


// returns a link to a base64 encoded image
async function generateImage(prompt) {
    try {
        const img = await openai.images.generate({
            model: "dall-e-3",
            prompt:prompt,
            n: 1,
            size: "1024x1024"
        });

        const imageBuffer = Buffer.from(img.data[0].b64_json, "base64");

        return imageBuffer;

    } catch (error) {
        console.error(error.message);
        return null;
    }
}


import { fileURLToPath } from 'url';
const currentFile = fileURLToPath(import.meta.url);
const executedFile = process.argv[1];

if (currentFile === executedFile) {
    generateImage("A painting of a cat sitting on a chair. Painted by the famous artist Pablo Picasso.");
}

export { generateResponse, generateImage };