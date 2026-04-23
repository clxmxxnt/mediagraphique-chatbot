/**
 * CHATBOT MÉDIAGRAPHIQUE - API ENDPOINT POUR VERCEL
 *
 * Endpoint: /api/chat
 * Méthode: POST
 * Body: { "message": "votre message" }
 *
 * Utilise Groq API (GRATUIT, très rapide)
 */

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

// ===== GROQ API CALL =====
async function chatWithGroq(userMessage) {
  const apiKey = process.env.GROQ_API_KEY;
  
  // Vérification: Est-ce que la clé est configurée?
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured in environment variables');
  }

  // Appel à l'API Groq
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', // Modèle puissant et gratuit de Groq
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 180,
      temperature: 0.7,
    }),
  });

  // Vérification: L'API a-t-elle répondu correctement?
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  // Extraction de la réponse
  const data = await response.json();
  
  // Vérification: Y a-t-il une réponse?
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('No response from Groq API');
  }

  return data.choices[0].message.content;
}

// ===== ENDPOINT PRINCIPAL =====
export default async function handler(req, res) {
  // Configuration CORS (autoriser les requêtes du site)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Gérer les requêtes OPTIONS (obligatoire pour CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extraire le message du corps de la requête
    const { message } = req.body;

    // Vérifier que le message existe et n'est pas vide
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid or empty message' });
    }

    // Limiter la longueur du message (évite les abus)
    const sanitizedMessage = message.trim().slice(0, 500);

    // Appeler Groq pour obtenir une réponse
    const reply = await chatWithGroq(sanitizedMessage);

    // Retourner la réponse au chatbot
    return res.status(200).json({
      success: true,
      reply: reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Afficher l'erreur dans les logs Vercel (très utile pour déboguer)
    console.error('Chatbot Error:', error);

    // Retourner une erreur au chatbot
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue. Contactez-nous à contact@mediagraphique.com',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

