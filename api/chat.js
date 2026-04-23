/**
 * CHATBOT MÉDIAGRAPHIQUE - API ENDPOINT POUR VERCEL
 *
 * Endpoint: /api/chat
 * Méthode: POST
 * Body: { "message": "votre message" }
 *
 * Utilise Groq API (GRATUIT, très rapide)
 */

import Anthropic from '@anthropic-ai/sdk';
import kb from '../knowledge-base.json' assert { type: 'json' };

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
${cfg.regles.join('\n')}

=== LONGUEUR DES RÉPONSES — RÈGLE ABSOLUE ===
- Maximum 4 lignes par réponse, même pour les sujets complexes.
- Par défaut : 1 à 2 phrases courtes et directes. C'est tout.
- Si la question est simple → 1 seule phrase.
- Ne développe JAMAIS sauf si l'utilisateur dit explicitement "explique", "développe", "dis-m'en plus", "comment ça fonctionne" ou équivalent.
- Pas de récapitulatif, pas d'introduction, pas de conclusion. Va droit au but.`;
}

const SYSTEM_PROMPT = buildSystemPrompt(kb);

// ===== CLAUDE API CALL =====
async function chatWithClaude(userMessage, history = []) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured in environment variables');
  }

  const client = new Anthropic({ apiKey });

  const messages = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
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
    const { message, history } = req.body;

    // Vérifier que le message existe et n'est pas vide
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid or empty message' });
    }

    // Limiter la longueur du message (évite les abus)
    const sanitizedMessage = message.trim().slice(0, 500);

    // Appeler Groq pour obtenir une réponse
    const validHistory = Array.isArray(history) ? history.slice(-6) : [];
    const reply = await chatWithClaude(sanitizedMessage, validHistory);

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

