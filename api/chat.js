/**
 * CHATBOT MÉDIAGRAPHIQUE - API ENDPOINT POUR VERCEL
 *
 * Endpoint: /api/chat
 * Méthode: POST
 * Body: { "message": "votre message" }
 *
 * Utilise Groq API (GRATUIT, très rapide)
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const kb = require('../knowledge-base.json');

function buildSystemPrompt(kb) {
  const ag = kb.agence;
  const sv = kb.services;
  const fo = kb.formations;
  const cfg = kb.chatbot_config;

  return `${cfg.system_prompt}

=== IDENTITÉ ===
${ag.nom} | "${ag.tagline}" | Fondé en ${ag.chiffres_cles.annee_creation} par ${ag.fondateur.nom} (${ag.fondateur.formation})
Adresse : ${ag.contact.adresse} | Tél : ${ag.contact.telephone} | Email : ${ag.contact.email}
Site : ${ag.contact.site} | Formations : ${ag.contact.site_formation}
Zone : ${ag.localisation.zone_intervention}
Points forts : ${ag.points_forts.join(' | ')}

=== SERVICES ===
${sv.strategie_communication.sous_services.map(s => `• ${s.nom} : ${s.description}`).join('\n')}
${sv.strategie_web.sous_services.map(s => `• ${s.nom} : ${s.description}`).join('\n')}
${sv.supports_communication.sous_services.map(s => `• ${s.nom} : ${s.description}`).join('\n')}
- ${sv.decoration_entreprise.nom} : ${sv.decoration_entreprise.description}

=== FORMATIONS O-PAO (${fo.organisme.site}) ===
Organisme certifié : ${fo.organisme.certifications.join(', ')}
PAO & Graphisme : ${fo.catalogue.pao_print.formations.map(f => f.titre).join(', ')}
Intelligence Artificielle : ${fo.catalogue.ia.formations.map(f => f.titre).join(', ')}
Web & Réseaux Sociaux : ${fo.catalogue.web_reseaux_sociaux.formations.map(f => f.titre).join(', ')}
Bureautique : ${fo.catalogue.bureautique.formations.map(f => f.titre).join(', ')}
Financement possible : ${fo.financement.dispositifs.map(d => d.nom).join(', ')}
Modalités : ${fo.modalites.duree_typique} | Présentiel ou distanciel | Réponse sous 48h

=== FAQ CLÉS ===
${kb.faq.map(f => `Q: ${f.question}\nR: ${f.reponse}`).join('\n\n')}

=== RÈGLES DE CONDUITE ===
${cfg.regles.join('\n')}`;
}

const SYSTEM_PROMPT = buildSystemPrompt(kb);

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
      max_tokens: 400,
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

