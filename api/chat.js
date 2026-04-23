/**
 * CHATBOT MÉDIAGRAPHIQUE - API ENDPOINT POUR VERCEL
 *
 * Endpoint: /api/chat
 * Méthode: POST
 * Body: { "message": "votre message", "history": [...] }
 *
 * La base de connaissances est lue depuis knowledge-base.json
 * Pour mettre à jour le chatbot, modifiez uniquement knowledge-base.json
 */

import Anthropic from "@anthropic-ai/sdk";
import kb from "../knowledge-base.json" assert { type: "json" };

// ===== CONSTRUCTION DU SYSTEM PROMPT À PARTIR DE LA KNOWLEDGE BASE =====
function buildSystemPrompt(kb) {
  const ag = kb.agence;
  const sv = kb.services;
  const fo = kb.formations;
  const faq = kb.faq;
  const cfg = kb.chatbot_config;

  return `${cfg.system_prompt}

=== IDENTITÉ DE L'AGENCE ===
Nom : ${ag.nom}
Tagline : "${ag.tagline}"
Description : ${ag.description}
Fondateur : ${ag.fondateur.nom} — ${ag.fondateur.titre} (${ag.fondateur.formation})
Adresse : ${ag.contact.adresse}
Téléphone : ${ag.contact.telephone}
Email : ${ag.contact.email}
Site : ${ag.contact.site}
Site formations : ${ag.contact.site_formation}
Zone d'intervention : ${ag.localisation.zone_intervention}
Expérience : ${ag.chiffres_cles.annees_experience} (fondée en ${ag.chiffres_cles.annee_creation})
Note Google : ${ag.chiffres_cles.note_google}

Valeurs clés : ${ag.valeurs.join(" | ")}

Points forts :
${ag.points_forts.map(p => `- ${p}`).join("\n")}

=== SERVICES MÉDIAGRAPHIQUE ===
${sv.introduction}

--- Stratégie de Communication ---
${sv.strategie_communication.description}
Sous-services :
${sv.strategie_communication.sous_services.map(s =>
  `• ${s.nom} : ${s.description}${s.inclut ? " (inclut : " + s.inclut.join(", ") + ")" : ""}`
).join("\n")}

--- Stratégie Web & Numérique ---
${sv.strategie_web.description}
Sous-services :
${sv.strategie_web.sous_services.map(s =>
  `• ${s.nom} : ${s.description}${s.inclut ? " (inclut : " + s.inclut.join(", ") + ")" : ""}`
).join("\n")}

--- Supports de Communication ---
${sv.supports_communication.description}
${sv.supports_communication.sous_services.map(s =>
  `• ${s.nom} : ${s.description}. Exemples : ${(s.exemples || []).join(", ")}`
).join("\n")}

=== FORMATIONS VIA O-PAO ===
${fo.introduction}

Organisme : ${fo.organisme.nom} — ${fo.organisme.site} — ${fo.organisme.email}
Certifications : ${fo.organisme.certifications.join(", ")}

--- Formations PAO & Création Graphique ---
${fo.catalogue.pao_print.formations.map(f =>
  `• ${f.titre} : ${f.description} (${f.niveau || "tous niveaux"}${f.lien ? " — " + f.lien : ""})`
).join("\n")}

--- Formations Web & Réseaux Sociaux ---
${fo.catalogue.web_reseaux_sociaux.formations.map(f =>
  `• ${f.titre} : ${f.description}${f.cpf ? " [Éligible CPF]" : ""}${f.lien ? " — " + f.lien : ""}`
).join("\n")}

--- Formations Intelligence Artificielle ---
${fo.catalogue.intelligence_artificielle.formations.map(f =>
  `• ${f.titre} : ${f.description} | Durée : ${f.duree || "variable"} | Public : ${f.public || "tous"}`
).join("\n")}

--- Formations Bureautique ---
${fo.catalogue.bureautique.formations.map(f =>
  `• ${f.titre} : ${f.description}${f.logiciels ? " (logiciels : " + f.logiciels.join(", ") + ")" : ""}`
).join("\n")}

--- Modalités des formations ---
Formats : ${fo.modalites.formats.map(f => f.nom + " (" + f.description + ")").join(" | ")}
Durée typique : ${fo.modalites.duree_typique}
Prérequis : ${fo.modalites.prerequis}
Inscription : ${fo.modalites.inscription}
Suivi : ${fo.modalites.suivi}

--- Financement des formations ---
${fo.financement.dispositifs.map(d =>
  `• ${d.nom} (pour : ${d.pour_qui}) : ${d.description}`
).join("\n")}

=== FAQ — QUESTIONS FRÉQUENTES ===
${faq.map(f => `Q: ${f.question}\nR: ${f.reponse}`).join("\n\n")}

=== PROCESSUS D'ACCOMPAGNEMENT ===
${kb.processus_accompagnement.etapes.map(e =>
  `Étape ${e.numero} — ${e.titre} : ${e.description}`
).join("\n")}

=== RÈGLES DE CONDUITE ===
${cfg.regles.map(r => `- ${r}`).join("\n")}`;
}

const SYSTEM_PROMPT = buildSystemPrompt(kb);

// ===== OPTION 1: CLAUDE API (RECOMMANDÉ) =====
async function chatWithClaude(userMessage, history = []) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const client = new Anthropic({ apiKey });

  // Construire l'historique de la conversation
  const messages = [
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user',
      content: userMessage,
    }
  ];

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages,
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
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid or empty message' });
    }

    const sanitizedMessage = message.trim().slice(0, 800);

    // Valider l'historique si fourni
    const validHistory = Array.isArray(history)
      ? history.slice(-10) // garder max 10 messages précédents
      : [];

    let reply;
    if (process.env.ANTHROPIC_API_KEY) {
      reply = await chatWithClaude(sanitizedMessage, validHistory);
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
