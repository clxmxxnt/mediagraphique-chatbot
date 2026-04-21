[README.md](https://github.com/user-attachments/files/26925834/README.md)
# 🤖 Chatbot IA Médiagraphique - Documentation Complète

## 📚 Sommaire

1. [Aperçu](#aperçu)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Déploiement](#déploiement)
5. [Intégration WordPress](#intégration-wordpress)
6. [Personnalisation](#personnalisation)
7. [FAQ](#faq)

---

## 🎯 Aperçu

Chatbot IA gratuit pour Médiagraphique permettant de:
- ✅ Répondre aux questions sur les services
- ✅ Expliquer les formations O-PAO
- ✅ Qualifier les prospects
- ✅ Améliorer l'expérience utilisateur
- ✅ Disponible 24/7 sur votre site

**Coût:** ~€10/mois (Claude) ou **0€** (Hugging Face gratuit)

---

## 🏗️ Architecture

```
┌─────────────────────────┐
│  WordPress Site (Divi)  │
│  + Widget Chatbot 💬    │
└──────────────┬──────────┘
               │
               ↓ (fetch)
┌─────────────────────────┐
│  Vercel API Endpoint    │
│  /api/chat              │
└──────────────┬──────────┘
               │
               ↓ (appel IA)
        ┌──────┴──────┐
        ↓             ↓
    Claude API   Hugging Face API
   (€10/mois)      (GRATUIT)
```

---

## 📦 Fichiers du Projet

```
mediagraphique-chatbot/
├── api/
│   └── chat.js              # Endpoint API (Vercel)
├── chatbot-widget.js        # Widget frontend (JavaScript)
├── knowledge-base.json      # Base de connaissances
├── package.json             # Dépendances Node
├── vercel.json              # Config Vercel
├── .env.example             # Variables d'env (template)
├── DEPLOYMENT_GUIDE.md      # Guide déploiement détaillé
├── WORDPRESS_INTEGRATION.md # Guide intégration WordPress
└── README.md                # Ce fichier
```

---

## 🚀 Installation Rapide (5 min)

### 1. Télécharger les fichiers
```bash
# Créer un dossier
mkdir mediagraphique-chatbot
cd mediagraphique-chatbot

# Télécharger les fichiers depuis le Google Drive/dossier fourni
```

### 2. Configurer les variables d'env
```bash
# Copier le template
cp .env.example .env

# Ajouter votre clé API:
# Option A: Claude → https://console.anthropic.com
# Option B: Hugging Face → https://huggingface.co/settings/tokens
```

### 3. Déployer sur Vercel
```bash
# Initialiser Git
git init
git add .
git commit -m "Initial: Chatbot Médiagraphique"

# Pusher sur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/mediagraphique-chatbot.git
git push -u origin main

# Dans Vercel: Importer le projet GitHub
# → Ajouter les variables d'env
# → Déployer!
```

### 4. Intégrer sur WordPress
- Aller dans Divi → Theme Settings → Custom Code
- Copier le code fourni dans WORDPRESS_INTEGRATION.md
- Tester sur votre site

---

## 📖 Guides Détaillés

### Setup & Déploiement
→ **Lire:** `DEPLOYMENT_GUIDE.md`

Couvre:
- Setup Vercel
- Configuration Claude/Hugging Face
- Déploiement & tests
- Troubleshooting

### Intégration WordPress
→ **Lire:** `WORDPRESS_INTEGRATION.md`

Couvre:
- 3 étapes simples (5 min)
- Code à copier/coller
- Tests de validation
- Personnalisation couleurs/position

---

## 🎨 Personnalisation

### Modifier la base de connaissances
Éditer `knowledge-base.json`:
```json
{
  "services": [
    {
      "nom": "Mon Service",
      "description": "Description complète..."
    }
  ]
}
```

### Modifier le ton de la réponse
Dans `api/chat.js`, éditer `SYSTEM_PROMPT`:
```javascript
const SYSTEM_PROMPT = `Tu es un expert en...`;
```

### Modifier l'apparence du widget
Dans `chatbot-widget.js`, section STYLES:
```javascript
colors: {
  primary: '#55BFCE',  // Couleur principale
  white: '#FFFFFF',    // Blanc
}
```

---

## 💡 Utilisation

### Pour le visiteur
1. Voir 💬 en bas à droite du site
2. Cliquer pour ouvrir le chat
3. Écrire une question
4. Obtenir une réponse immédiate

### Pour vous
1. Vérifier les questions fréquemment posées
2. Améliorer la base de connaissances
3. Suivre les conversions (via analytics)
4. Ajuster les réponses

---

## 📊 Coûts Estimés

| Solution | Setup | Mensuel | Qualité | Limitation |
|----------|-------|---------|---------|-----------|
| Claude API | 0€ | ~€10 | ⭐⭐⭐⭐⭐ | Peu |
| Hugging Face | 0€ | 0€ | ⭐⭐⭐⭐ | Rate limit |

---

## 🆘 FAQ

### Le widget n'apparaît pas
**Vérifier:**
1. L'URL du script est correcte?
2. Pas d'erreur dans la console (F12)?
3. Vercel a bien déployé?

### Le chatbot ne répond pas
**Vérifier:**
1. Internet fonctionne?
2. Vercel API répond? (tester avec curl)
3. Clé API est bien configurée?

### Les réponses ne sont pas bonnes
**Solutions:**
1. Améliorer le SYSTEM_PROMPT
2. Ajouter plus de contexte dans knowledge-base.json
3. Passer à Claude API pour meilleure qualité

### Comment ajouter plus de langues?
Créer plusieurs SYSTEM_PROMPT et détecter la langue du visiteur.

---

## 🔒 Sécurité

- Les conversations ne sont pas stockées
- Pas d'accès aux données sensibles
- API securisée avec rate-limiting
- CORS configuré pour votre domaine

---

## 📈 Prochaines Étapes

Après déploiement:

1. **Analyser les conversations**
   - Quelles questions reviennent souvent?
   - Comment améliorer les réponses?

2. **Enrichir la base de connaissances**
   - Ajouter cas clients
   - Ajouter témoignages
   - Ajouter pricing

3. **Optimiser les conversions**
   - Ajouter CTA (appel à action)
   - Tracker vers contact/devis
   - A/B tester les messages

4. **Ajouter multilingue**
   - Support FR/EN
   - Détecter langue automatiquement

---

## 📞 Support

**Questions?** Contactez: contact@mediagraphique.com

---

## 📄 License

Propriété de Médiagraphique © 2026

---

**Version:** 1.0.0  
**Dernière mise à jour:** Avril 2026  
**Statut:** ✅ Prêt à l'emploi

