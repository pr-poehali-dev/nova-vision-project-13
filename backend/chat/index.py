"""
Чат с нейросетью НейроМакс на базе OpenAI GPT-3.5-turbo.
Принимает массив сообщений и возвращает ответ ИИ.
"""
import json
import os
from openai import OpenAI


def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    body = json.loads(event.get('body', '{}'))
    messages = body.get('messages', [])

    if not messages:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'messages required'})}

    client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])

    system_message = {
        'role': 'system',
        'content': 'Ты НейроМакс — дружелюбный и умный ИИ-помощник. Отвечай на русском языке, кратко и по делу.'
    }

    completion = client.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=[system_message] + messages,
        max_tokens=1000,
        temperature=0.7,
    )

    reply = completion.choices[0].message.content

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'reply': reply})
    }
