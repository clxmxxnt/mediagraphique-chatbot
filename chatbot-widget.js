/**
 * CHATBOT MÉDIAGRAPHIQUE - Widget Frontend
 * À ajouter sur votre site WordPress via Divi > Custom Code
 *
 * Variables à configurer:
 * - API_URL: URL de votre API déployée (voir config)
 * - COLORS: Couleurs du branding Médiagraphique
 */

(function() {
  'use strict';

  // ===== CONFIGURATION =====
  const CONFIG = {
    apiUrl: 'https://mediagraphique-chatbot.vercel.app/api/chat', // À remplacer par votre URL Vercel
    apiKey: '', // Optionnel si vous sécurisez l'API
    colors: {
      primary: '#55BFCE', // Turquoise Médiagraphique
      white: '#FFFFFF',
      light_gray: '#F9F9F9',
      dark_text: '#333333',
      border: '#E0E0E0',
    },
    fonts: {
      primary: '"Montserrat", sans-serif',
      secondary: '"Nunito Sans", sans-serif',
    }
  };

  // ===== STYLES =====
  const styles = `
    * {
      box-sizing: border-box;
    }

    .mediagraphique-chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;  /* ← Distance du bord droit */
      font-family: ${CONFIG.fonts.primary};
      z-index: 9999;
      max-width: 400px;
      width: calc(100vw - 40px);
    }

    .chatbot-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${CONFIG.colors.primary};
      color: ${CONFIG.colors.white};
      border: none;
      cursor: pointer;
      font-size: 28px;
      box-shadow: 0 4px 12px rgba(85, 191, 206, 0.3);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;  /* ✅ AJOUTE CETTE LIGNE */
      right: 0;           /* ✅ AJOUTE CETTE LIGNE */
      bottom: 0;          /* ✅ AJOUTE CETTE LIGNE */
    }

    .chatbot-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(85, 191, 206, 0.4);
    }

    .chatbot-toggle.hidden {
      display: none;
    }

    .chatbot-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 100%;
      max-width: 400px;
      height: 500px;
      background: ${CONFIG.colors.white};
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    .chatbot-window.hidden {
      display: none;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

  .chatbot-header {
      background: rgba(85, 191, 206, 0.3);
      color: ${CONFIG.colors.white};
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid ${CONFIG.colors.border};
      gap: 10px;
    }
    
    .chatbot-header-logo {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
    
    .chatbot-header h3 {
      margin: 0;
      padding: 0;
      font-size: 14px;
      font-weight: 600;
      color: #000000;
      flex: 1;
    }

    .chatbot-header .chatbot-close-btn {
      background: none !important;
      border: none !important;
      color: #000000 !important;
      font-size: 24px !important;
      cursor: pointer !important;
      padding: 0 !important;
      width: 30px !important;
      height: 30px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    .chatbot-header .chatbot-close-btn:hover {
      opacity: 0.8 !important;
      transform: scale(1.1) !important;
      transition: all 0.2s ease !important;
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: ${CONFIG.colors.light_gray};
    }

    .message {
      margin-bottom: 12px;
      display: flex;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      justify-content: flex-end;
    }

    .message-content {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
      font-family: ${CONFIG.fonts.secondary};
    }

    .message-bot-logo {
      width: 20px;
      height: 20px;
      margin-right: 6px;
      object-fit: contain;
      flex-shrink: 0;
    }
    
    .message.bot {
      display: flex;
      align-items: flex-start;
      gap: 4px;
    }

    .message.bot .message-content {
      background: ${CONFIG.colors.white};
      color: ${CONFIG.colors.dark_text};
      border: 1px solid ${CONFIG.colors.border};
    }

    .message.user .message-content {
      background: ${CONFIG.colors.primary};
      color: ${CONFIG.colors.white};
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
    }

    .typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${CONFIG.colors.primary};
      animation: typing 1.4s infinite;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        opacity: 0.3;
      }
      30% {
        opacity: 1;
      }
    }

    .chatbot-input-area {
      padding: 12px;
      border-top: 1px solid ${CONFIG.colors.border};
      display: flex;
      gap: 8px;
    }

    .chatbot-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid ${CONFIG.colors.border};
      border-radius: 6px;
      font-family: ${CONFIG.fonts.secondary};
      font-size: 14px;
      resize: none;
    }

    .chatbot-input:focus {
      outline: none;
      border-color: ${CONFIG.colors.primary};
      box-shadow: 0 0 0 3px rgba(85, 191, 206, 0.1);
    }

    .chatbot-send {
      background: ${CONFIG.colors.primary};
      color: ${CONFIG.colors.white};
      border: none;
      border-radius: 6px;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .chatbot-send:hover {
      background: #4A9AB8;
    }

    .chatbot-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Mobile responsif */
    @media (max-width: 480px) {
      .chatbot-window {
        height: 70vh;
        max-width: calc(100vw - 20px);
        bottom: 80px;
      }

      .chatbot-container {
        bottom: 10px;
        right: 10px;
      }
    }

    /* Scrollbar personnalisée */
    .chatbot-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chatbot-messages::-webkit-scrollbar-track {
      background: ${CONFIG.colors.light_gray};
    }

    .chatbot-messages::-webkit-scrollbar-thumb {
      background: ${CONFIG.colors.primary};
      border-radius: 3px;
    }

    .chatbot-messages::-webkit-scrollbar-thumb:hover {
      background: #4A9AB8;
    }
    
    /* Questions suggérées */
    
    .suggested-questions {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .suggested-btn {
      background: ${CONFIG.colors.light_gray};
      color: ${CONFIG.colors.dark_text};
      border: 1px solid ${CONFIG.colors.border};
      border-radius: 6px;
      padding: 10px 12px;
      font-family: ${CONFIG.fonts.secondary};
      font-size: 13px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      line-height: 1.3;
    }
    
    .suggested-btn:hover {
      background: ${CONFIG.colors.primary};
      color: ${CONFIG.colors.white};
      border-color: ${CONFIG.colors.primary};
    }
    
    .suggested-btn:active {
      transform: scale(0.98);
    }
    
    .suggested-questions.hidden {
      display: none;
    }
  `;

  // ===== HTML =====
  const htmlTemplate = `
    <div class="mediagraphique-chatbot-container">
      <button class="chatbot-toggle" title="Ouvrir le chat">
        💬
      </button>

      <div class="chatbot-window hidden">
        <div class="chatbot-header">
          <img src="https://raw.githubusercontent.com/clxmxxnt/mediagraphique-chatbot/main/public/M mediagraphique noir.png" alt="Médiagraphique" class="chatbot-header-logo">
          <h3>Besoin d'aide ?</h3>
          <button class="chatbot-close-btn" title="Fermer">×</button>
        </div>

        <div class="chatbot-messages">
          <div class="message bot">
            <div class="message-content">
              Bonjour 👋 Je suis l'assistant Médiagraphique. Comment puis-je vous aider?
            </div>
          </div>
          
          <div class="suggested-questions">
            <button class="suggested-btn" data-question="Quels services proposez-vous exactement?">Quels services proposez-vous exactement?</button>
            <button class="suggested-btn" data-question="Combien coûte une formation?">Combien coûte une formation?</button>
            <button class="suggested-btn" data-question="Quelles formations proposez-vous?">Quelles formations proposez-vous?</button>
            <button class="suggested-btn" data-question="Depuis combien de temps vous existez? Avez-vous des références?">Depuis combien de temps vous existez? Avez-vous des références?</button>
          </div>
        </div>

        <div class="chatbot-input-area">
          <input
            type="text"
            class="chatbot-input"
            placeholder="Écrivez votre message..."
            maxlength="500"
          />
          <button class="chatbot-send" title="Envoyer">📤</button>
        </div>
      </div>
    </div>
  `;

  // ===== LOGIQUE =====
  function initChatbot() {
    // Injecter les styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Injecter l'HTML
    const container = document.createElement('div');
    container.innerHTML = htmlTemplate;
    document.body.appendChild(container);

    // Récupérer les éléments
    const toggleBtn = container.querySelector('.chatbot-toggle');
    const window_ = container.querySelector('.chatbot-window');
    const closeBtn = container.querySelector('.chatbot-close-btn');
    const messagesDiv = container.querySelector('.chatbot-messages');
    const inputField = container.querySelector('.chatbot-input');
    const sendBtn = container.querySelector('.chatbot-send');
    const suggestedQuestionsDiv = container.querySelector('.suggested-questions');
    const suggestedBtns = container.querySelectorAll('.suggested-btn');

    // Événements
    toggleBtn.addEventListener('click', () => {
      window_.classList.toggle('hidden');
      toggleBtn.classList.toggle('hidden');
      if (!window_.classList.contains('hidden')) {
        inputField.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      window_.classList.add('hidden');
      toggleBtn.classList.remove('hidden');
    });

    // Envoyer message
    function sendMessage() {
      const message = inputField.value.trim();
      if (!message) return;

      // Ajouter message utilisateur
      addMessage(message, 'user');
      inputField.value = '';

      // Afficher indicateur de typing
      showTypingIndicator();

      // Appeler l'API
      fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })
        .then(res => res.json())
        .then(data => {
          removeTypingIndicator();
          if (data.success) {
            addMessage(data.reply, 'bot');
          } else {
            addMessage('Désolé, je n\'ai pas pu répondre. Contactez nos experts: contact@mediagraphique.com', 'bot');
          }
        })
        .catch(err => {
          removeTypingIndicator();
          console.error('Error:', err);
          addMessage('Erreur de connexion. Essayez plus tard ou appelez-nous au +33 3 80 54 02 42', 'bot');
        });
    }

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Événements des questions suggérées
    suggestedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.getAttribute('data-question');
        inputField.value = question;
        sendMessage();
        suggestedQuestionsDiv.classList.add('hidden');
      });
    });

    // Fonctions utilitaires
    function addMessage(text, sender) {
      const messageEl = document.createElement('div');
      messageEl.className = `message ${sender}`;
      
      if (sender === 'bot') {
        messageEl.innerHTML = `
          <img src="https://raw.githubusercontent.com/clxmxxnt/mediagraphique-chatbot/main/public/M mediagraphique noir.png" alt="Bot" class="message-bot-logo">
          <div class="message-content">${escapeHtml(text)}</div>
        `;
      } else {
        messageEl.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
      }
      
      messagesDiv.appendChild(messageEl);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function showTypingIndicator() {
      const typingEl = document.createElement('div');
      typingEl.className = 'message bot typing-indicator-message';
      typingEl.innerHTML = `
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
      messagesDiv.appendChild(typingEl);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function removeTypingIndicator() {
      const typingEl = messagesDiv.querySelector('.typing-indicator-message');
      if (typingEl) typingEl.remove();
    }

    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }
  }

  // Initialiser quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
