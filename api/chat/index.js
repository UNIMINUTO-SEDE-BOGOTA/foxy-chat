const { app } = require('@azure/functions');

app.http('chat', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'chat',
  handler: async (request, context) => {

    // Responde el preflight del navegador
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      };
    }

    const body = await request.text();

    // Llama a n8n desde el servidor (sin CORS)
    const n8nResponse = await fetch(
      'https://n8necosystem-amdxgsdnd3dgewaj.centralus-01.azurewebsites.net/webhook/foxy-chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body || '{}',
      }
    );

    const data = await n8nResponse.text();

    return {
      status: n8nResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: data,
    };
  },
});