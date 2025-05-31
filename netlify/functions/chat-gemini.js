export async function handler(event, context) {
  // Usa tu API Key de HuggingFace aquí o como variable de entorno
  const HF_API_KEY = process.env.HF_API_KEY;
  if (!HF_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key no configurada" }),
      headers: { "Content-Type": "application/json" },
    };
  }
  let body = JSON.parse(event.body);
  const prompt = body.messages?.map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n') + '\nAsistente:';

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const data = await response.json();
    let aiText = data?.[0]?.generated_text || data?.generated_text || 'Sin respuesta de HuggingFace.';
    // Formato OpenAI compatible para el frontend
    const result = {
      choices: [
        { message: { role: 'assistant', content: aiText } }
      ]
    };
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { "Content-Type": "application/json" },
    };
  }
} 