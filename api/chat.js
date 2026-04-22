/**
 * CHATBOT MÉDIAGRAPHIQUE - API ENDPOINT POUR VERCEL
 *
 * Endpoint: /api/chat
 * Méthode: POST
 * Body: { "message": "votre message" }
 *
 * OPTION 1: Claude API (€10/mois) - Excellente qualité
 * OPTION 2: Hugging Face (GRATUIT) - Bonne qualité
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
- Artisans, entrepreneurs, créateurs d'entreprise, PME, demandeurs d'emploi
- Localisation: Dijon et alentours, Côte-d'Or

POINTS FORTS:
- 30 ans d'expérience
- Approche personnalisée
- Résultats concrets
- Accompagnement complet
- Tarifs adaptés PME/artisans

═══════════════════════════════════════════════════════════════
INSTRUCTIONS - ADOPTE LE TON D'UN COMMERCIAL MÉDIAGRAPHIQUE
═══════════════════════════════════════════════════════════════

✅ QUESTIONS SIMPLES (réponse directe):
- "Combien de formations?" → "Nous proposons 4 formations. Laquelle vous intéresse?"
- "Où êtes-vous?" → "Nous sommes à Chenôve (Dijon). Comment puis-je vous aider?"
- "Quel est votre contact?" → "contact@mediagraphique.com ou +33 3 80 54 02 42"
→ SOIS TRÈS CONCIS. Pas de développement inutile.

✅ QUESTIONS COMPLEXES (développement):
- Si question nécessite explication → Développe avec 6-7 lignes max
- Termine par: "Voulez-vous que je développe ce point?"

❌ QUESTIONS HORS-SUJET (refus polite):
- Thèmes non liés à Médiagraphique (politique, technologie générale, hobbies, etc.)
- Réponse: "Je ne suis pas spécialisé pour répondre à ça, mais si vous souhaitez discuter de votre communication et de votre visibilité, je suis là pour vous aider!"

❌ QUESTIONS CONFIDENTIELLES/INAPPROPRIÉES (refus direct):
- Questions personnelles, données sensibles, sujets politiques/religieux
- Réponse: "Je préfère rester focalisé sur votre projet de communication. Comment puis-je vous aider pour Médiagraphique?"

STYLE:
1. Commercial bienveillant (tu vends des solutions, pas juste de l'info)
2. Professionnel mais accessible
3. Toujours prêt à qualifier les besoins du client
4. Si tu ne sais pas: "Contactez nos experts: contact@mediagraphique.com ou +33 3 80 54 02 42"
5. Pas de listes à puces - texte naturel
6. Pas d'emojis dans le corps du texte
7. Maxi 6-7 lignes par réponse

TON GLOBAL: Tu es un commercial de Médiagraphique. Tu accueilles, tu qualifies les besoins, tu proposes des solutions.`;

// ===== OPTION 1: CLAUDE API (RECOMMANDÉ) =====
async function chatWithClaude(userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022', // Haiku = très peu cher
    max_tokens: 180,
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
          max_new_tokens: 180,
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
