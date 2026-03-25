"""
Чат с нейросетью НейроМакс на базе GigaChat (Сбер).
Принимает массив сообщений и возвращает ответ ИИ.
"""
import json
import os
import urllib.request
import urllib.parse
import ssl


def get_access_token() -> str:
    auth_key = os.environ['GIGACHAT_API_KEY']
    data = urllib.parse.urlencode({'scope': 'GIGACHAT_API_PERS'}).encode('utf-8')
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(
        'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
        data=data,
        headers={
            'Authorization': f'Basic {auth_key}',
            'Content-Type': 'application/x-www-form-urlencoded',
            'RqUID': '6f0b1291-c7f3-43c6-bb2e-9f3efb2dc98e',
        },
        method='POST'
    )
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        result = json.loads(resp.read().decode('utf-8'))
    return result['access_token']


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

    try:
        token = get_access_token()
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': f'Auth failed: {str(e)}'})}

    system_message = {
        'role': 'system',
        'content': 'Ты НейроМакс — дружелюбный и умный ИИ-помощник. Отвечай на русском языке, кратко и по делу.'
    }

    payload = json.dumps({
        'model': 'GigaChat',
        'messages': [system_message] + messages,
        'max_tokens': 1000,
        'temperature': 0.7,
    }).encode('utf-8')

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            result = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': f'GigaChat error: {str(e)}'})}

    reply = result['choices'][0]['message']['content']

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'reply': reply})
    }
