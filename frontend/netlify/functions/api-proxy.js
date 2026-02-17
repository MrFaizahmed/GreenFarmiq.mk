export const handler = async (event) => {
  try {
    const backendOrigin = (process.env.BACKEND_URL || 'https://greenfarmiq-1.onrender.com').replace(/\/$/, '');
    if (!backendOrigin) {
      return { statusCode: 500, body: 'BACKEND_URL not set on Netlify' };
    }
    const qs = event.queryStringParameters
      ? '?' + new URLSearchParams(event.queryStringParameters).toString()
      : '';
    const url = backendOrigin + event.path + qs;

    const incomingHeaders = { ...event.headers };
    delete incomingHeaders.host;
    delete incomingHeaders['content-length'];
    delete incomingHeaders['x-forwarded-for'];
    delete incomingHeaders['x-forwarded-host'];
    delete incomingHeaders['x-forwarded-proto'];

    let body;
    if (event.body) {
      body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    }

    const resp = await fetch(url, {
      method: event.httpMethod || 'GET',
      headers: incomingHeaders,
      body: ['GET', 'HEAD'].includes((event.httpMethod || 'GET').toUpperCase()) ? undefined : body,
    });

    const headers = {};
    resp.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key)) {
        headers[key] = value;
      }
    });

    const text = await resp.text();
    return {
      statusCode: resp.status,
      headers,
      body: text,
    };
  } catch (e) {
    return { statusCode: 502, body: 'Proxy error: ' + (e?.message || 'unknown') };
  }
};
