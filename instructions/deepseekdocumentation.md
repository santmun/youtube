# Your First API Call

The DeepSeek API uses an API format compatible with OpenAI. By modifying the configuration, you can use the OpenAI SDK or softwares compatible with the OpenAI API to access the DeepSeek API.

| PARAM | VALUE |
| --- | --- |
| base_url * | `https://api.deepseek.com` |
| api_key | apply for an [API key](https://platform.deepseek.com/api_keys) |
- To be compatible with OpenAI, you can also use `https://api.deepseek.com/v1` as the `base_url`. But note that the `v1` here has NO relationship with the model's version.
- **The `deepseek-chat` model has been upgraded to DeepSeek-V3. The API remains unchanged.** You can invoke DeepSeek-V3 by specifying `model='deepseek-chat'`.

## Invoke The Chat API

Once you have obtained an API key, you can access the DeepSeek API using the following example scripts. This is a non-stream example, you can set the `stream` parameter to `true` to get stream response.

- curl
- python
- nodejs

`curl https://api.deepseek.com/chat/completions \  -H "Content-Type: application/json" \  -H "Authorization: Bearer <DeepSeek API Key>" \  -d '{        "model": "deepseek-chat",        "messages": [          {"role": "system", "content": "You are a helpful assistant."},          {"role": "user", "content": "Hello!"}        ],        "stream": false      }'`


JSON Output
In many scenarios, users need the model to output in strict JSON format to achieve structured output, facilitating subsequent parsing.

DeepSeek provides JSON Output to ensure the model outputs valid JSON strings.

Notice
To enable JSON Output, users should:

Set the response_format parameter to {'type': 'json_object'}.
Include the word "json" in the system or user prompt, and provide an example of the desired JSON format to guide the model in outputting valid JSON.
Set the max_tokens parameter reasonably to prevent the JSON string from being truncated midway.
Sample Code
Here is the complete Python code demonstrating the use of JSON Output:

import json
from openai import OpenAI

client = OpenAI(
    api_key="<your api key>",
    base_url="https://api.deepseek.com",
)

system_prompt = """
The user will provide some exam text. Please parse the "question" and "answer" and output them in JSON format. 

EXAMPLE INPUT: 
Which is the highest mountain in the world? Mount Everest.

EXAMPLE JSON OUTPUT:
{
    "question": "Which is the highest mountain in the world?",
    "answer": "Mount Everest"
}
"""

user_prompt = "Which is the longest river in the world? The Nile River."

messages = [{"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}]

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=messages,
    response_format={
        'type': 'json_object'
    }
)

print(json.loads(response.choices[0].message.content))


The model will output:

{
    "question": "Which is the longest river in the world?",
    "answer": "The Nile River"
}