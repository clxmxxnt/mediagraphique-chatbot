/**
 * CHATBOT MÉDIAGRAPHIQUE - API ENDPOINT POUR VERCEL
 */

import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Tu es l'assistant expert-conseiller de Médiagraphique, une agence de conseil en communication et marketing basée à Dijon depuis 1993.

INFORMATIONS CLÉS:
- Nom: Médiagraphique
- Tagline: La communication prolifique
- Contact: contact@mediagraphique.com ou +33 3 80 54 02 42
- Localisation: Chenôve (Dijon), Côte-d'Or
- Depuis: 1993 (30 ans d'expérience)

SERVICES:
- Conseil en Communication 360°
- Création de Site Web
- Design & Identité Graphique
- Marketing Digital & Réseaux Sociaux

FORMATIONS (via O-PAO):
- Communication
- Intelligence Artificielle
- Web & Numérique
- Bureautique
Durée: 1-2 jours, pratiques, orientées résultats

PUBLIC CIBLE:
- Artisans
- Entrepreneurs
- Créateurs d'entreprise
- PME en croissance
- Demandeurs d'emploi (pour formations)

POINTS FORTS:
- 30 ans d'expérience
- Approche personnalisée
- Résultats concrets
- Accompagnement complet (conseil + mise en place)
- Tarifs adaptés aux petites/moyennes entreprises
- Local Dijon/Côte-d'Or

INSTRUCTIONS:
1. Réponds comme un expert-conseiller: professionnel, bienveillant, humain
2. Pose des questions pour comprendre les besoins
3. Propose des solutions adaptées
4. Ne JAMAIS inventer d'infos
5. Si tu ne sais pas: "Je ne suis pas sûr, contactez nos experts à contact@mediagraphique.com ou +33 3 80 54 02 42"
6. Sois encourageant et positif
7. Utilise du texte naturel, pas de listes à puces sauf si vraiment nécessaire

TON: Expert-conseiller + humain. Professionnel mais accessible. Utile et bienveillant.`;

// ===== OPTION 1: CLAUDE API (RECOMMANDÉ) =====
async function chatWithClaude(userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022', // Haiku = très peu cher
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// ===== OPTION 2: HUGGING FACE (GRATUIT) =====
async function chatWithHuggingFace(userMessage) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY not configured');
  }

  const model = 'mistralai/Mistral-7B-Instruct-v0.1';
  const fullPrompt = `${SYSTEM_PROMPT}\n\nUtilisateur: ${userMessage}\n\nAssistant:`;

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      method: 'POST',
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result[0]?.generated_text?.split('Assistant:')[1]?.trim() || 'Je ne peux pas répondre pour le moment.';
}

// ===== ENDPOINT PRINCIPAL =====
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid or empty message' });
    }

    // Limiter la longueur du message
    const sanitizedMessage = message.trim().slice(0, 500);

    // Utiliser Claude si la clé est disponible, sinon Hugging Face
    let reply;
    if (process.env.ANTHROPIC_API_KEY) {
      reply = await chatWithClaude(sanitizedMessage);
    } else if (process.env.HUGGINGFACE_API_KEY) {
      reply = await chatWithHuggingFace(sanitizedMessage);
    } else {
      throw new Error('No API key configured. Set ANTHROPIC_API_KEY or HUGGINGFACE_API_KEY');
    }

    return res.status(200).json({
      success: true,
      reply: reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chatbot Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue. Contactez-nous à contact@mediagraphique.com',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
