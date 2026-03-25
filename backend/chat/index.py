"""
Чат с нейросетью НейроМакс на базе OpenAI GPT-3.5-turbo.
Принимает массив сообщений и возвращает ответ ИИ.
"""
import json
import os
import urllib.request


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

    system_message = {
        'role': 'system',
        'content': 'Ты НейроМакс — дружелюбный и умный ИИ-помощник. Отвечай на русском языке, кратко и по делу.'
    }

    payload = json.dumps({
        'model': 'gpt-3.5-turbo',
        'messages': [system_message] + messages,
        'max_tokens': 1000,
        'temperature': 0.7,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f"Bearer {os.environ['OPENAI_API_KEY']}",
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            result = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}

    reply = result['choices'][0]['message']['content']

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'reply': reply})
    }
