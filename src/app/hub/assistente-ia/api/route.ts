import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { message, agentContext } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        reply: `Olá! Identifiquei sua mensagem, mas o motor de IA (OpenAI) não está configurado no ambiente. Adicione a chave **OPENAI_API_KEY** ao arquivo \`.env.local\` para conversar comigo.`,
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: agentContext || 'Você é um assistente de IA prestativo.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || 'Não consegui processar a resposta.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error in agent API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
