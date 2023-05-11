import openai
import os
from dotenv import load_dotenv
import bin.const as const

# Set your API key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_response(model="gpt-3.5-turbo", history=[]):
    # is_truncated = False
    try:
        history.insert(0, {"role": "system", "content": const.BOT_PERSONALITY})
        
        response = openai.ChatCompletion.create(
            model=model,
            messages=history
        )
        response = response["choices"][0]["message"]["content"]
        return response 
    except Exception as e:
        print(e)
        return str(e)
    
def generate_image(prompt):
    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="512x512"
        )
        image_url = response['data'][0]['url']
        return image_url
    except Exception as e:
        print(e)

if __name__ == "__main__":
    pass