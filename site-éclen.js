// Configuration EmailJS (garde synchronisé)
const SERVICE_ID = 'service_8ztokan';
const TEMPLATE_ADMIN = 'template_8a34wag';   // <-- template notify_admin (admin)
const TEMPLATE_USER = 'template_oa78nlt';    // <-- template auto-reply (utilisateur)
const PUBLIC_KEY = 'EKTxooE41vGfUcK9u';

// Si ton template EmailJS nécessite une variable destinataire (to_email), renseigne-la ici.
// Option 1 (recommandée pour debug) : mettre ton email de réception ici.
// Option 2 : laisser vide et configurer un destinataire par défaut dans le template EmailJS dashboard.
const RECIPIENT_EMAIL = 'ro2srecord@gmail.com'; // <-- remplace par ton email ou laisse vide si template définit le destinataire

function showSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const heroSection = document.getElementById('hero-section');
    if (sectionName === 'accueil') {
        if (heroSection) heroSection.style.display = 'block';
    } else {
        if (heroSection) heroSection.style.display = 'none';
    }

    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Affiche une erreur visible dans la zone contact
function showEmailJsError(text) {
  const formContainer = document.querySelector('.contact-form') || document.body;
  let el = document.getElementById('emailjsError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'emailjsError';
    el.style.background = '#ffe6e6';
    el.style.border = '1px solid #ff9090';
    el.style.color = '#8a1f1f';
    el.style.padding = '10px';
    el.style.marginBottom = '10px';
    el.style.borderRadius = '4px';
    el.style.fontSize = '0.95rem';
    formContainer.insertBefore(el, formContainer.firstChild);
  }
  el.textContent = 'Erreur EmailJS : ' + text;
}

// Validation simple des identifiants
function validateEmailJsKeys(serviceId, templateAdminId, templateUserId, publicKey, recipientEmail) {
  const messages = [];
  let ok = true;

  if (!serviceId || typeof serviceId !== 'string' || !/^service_[A-Za-z0-9_-]+$/.test(serviceId)) {
    ok = false;
    messages.push('serviceId invalide (doit commencer par "service_...").');
  }

  if (!templateAdminId || typeof templateAdminId !== 'string' || !/^template_[A-Za-z0-9_-]+$/.test(templateAdminId)) {
    ok = false;
    messages.push('templateAdminId invalide (doit commencer par "template_...").');
  }

  if (!templateUserId || typeof templateUserId !== 'string' || !/^template_[A-Za-z0-9_-]+$/.test(templateUserId)) {
    ok = false;
    messages.push('templateUserId invalide (doit commencer par "template_...").');
  }

  if (!publicKey || typeof publicKey !== 'string' || !/^[A-Za-z0-9_-]{8,}$/.test(publicKey)) {
    ok = false;
    messages.push('publicKey invalide ou trop courte.');
  }

  if (recipientEmail && typeof recipientEmail === 'string' && recipientEmail.length > 0) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(recipientEmail)) {
      ok = false;
      messages.push('RECIPIENT_EMAIL n\'est pas une adresse email valide.');
    }
  }

  return { ok, messages };
}

// Charge le SDK EmailJS si nécessaire et initialise
function loadEmailJsAndInit() {
  function initEmailJs() {
    if (window.emailjs && !window.emailjs.__initialized) {
      try {
        emailjs.init(PUBLIC_KEY);
        window.emailjs.__initialized = true;
        console.log('EmailJS initialisé');
      } catch (e) {
        console.error('Erreur init EmailJS:', e);
        showEmailJsError("Erreur lors de l'initialisation EmailJS.");
      }
    }
  }

  if (window.emailjs) {
    initEmailJs();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.emailjs.com/sdk/3.2.0/email.min.js';
  script.async = true;
  script.onload = initEmailJs;
  script.onerror = function () {
    console.error('Échec chargement EmailJS SDK');
    showEmailJsError('Échec chargement du SDK EmailJS. Vérifie la connexion ou les bloqueurs.');
  };
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
  const successMessage = document.getElementById('successMessage');
  if (successMessage) successMessage.style.display = 'none';

  // Vérification des clés (mise à jour pour 2 templates)
  const validation = validateEmailJsKeys(SERVICE_ID, TEMPLATE_ADMIN, TEMPLATE_USER, PUBLIC_KEY, RECIPIENT_EMAIL);
  if (!validation.ok) {
    console.error('EmailJS configuration invalide:', validation.messages);
    showEmailJsError(validation.messages.join(' | '));
  }

  // Charge et initialise EmailJS (si nécessaire)
  loadEmailJsAndInit();
});

async function handleSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('contactForm');
  if (!form) {
    showEmailJsError('Formulaire introuvable (id="contactForm").');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  const nomEl = document.getElementById('nom');
  const emailEl = document.getElementById('email');
  const telephoneEl = document.getElementById('telephone');
  const sujetEl = document.getElementById('sujet');
  const messageEl = document.getElementById('message');

  if (!nomEl || !emailEl || !messageEl) {
    showEmailJsError('Champs manquants dans le formulaire (nom, email, message requis).');
    return;
  }

  const nom = nomEl.value.trim();
  const email = emailEl.value.trim();
  const telephone = telephoneEl ? telephoneEl.value.trim() : '';
  const sujet = sujetEl ? sujetEl.value.trim() : '';
  const message = messageEl.value.trim();

  // Paramètres pour le template admin (affiche le message complet aux responsables)
  const adminParams = {
    from_name: nom,
    from_email: email,
    telephone,
    subject: sujet,
    message,
    date: new Date().toLocaleString(),
    reply_to: email
  };

  // si le template admin utilise {{to_email}} on le fournit
  if (RECIPIENT_EMAIL && RECIPIENT_EMAIL.length > 0) {
    adminParams.to_email = RECIPIENT_EMAIL;
  }

  // Paramètres pour le template utilisateur (confirmation)
  const userParams = {
    to_name: nom,
    to_email: email,
    from_name: 'Église Éclen',
    message: `Bonjour ${nom},\n\nMerci pour votre message (Sujet : ${sujet}). Nous l'avons bien reçu et reviendrons vers vous bientôt.\n\nMessage reçu :\n${message}\n\n— Église Éclen`,
    reply_to: RECIPIENT_EMAIL || 'contact@eglisegrace.fr'
  };

  if (!window.emailjs || !window.emailjs.__initialized) {
    showEmailJsError('EmailJS non initialisé. Vérifie le chargement du SDK et la clé publique.');
    return;
  }

  try {
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi...'; }

    // Envoi email aux admins
    try {
      const resAdmin = await emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, adminParams);
      console.log('Email admin envoyé', resAdmin);
    } catch (errAdmin) {
      console.error('Échec envoi email admin:', errAdmin);
      showEmailJsError('Impossible d\'envoyer l\'email aux responsables. Voir console.');
    }

    // Envoi email de confirmation à l'utilisateur
    try {
      const resUser = await emailjs.send(SERVICE_ID, TEMPLATE_USER, userParams);
      console.log('Email utilisateur envoyé', resUser);
    } catch (errUser) {
      console.error('Échec envoi email utilisateur:', errUser);
      showEmailJsError('Impossible d\'envoyer l\'email de confirmation à l\'utilisateur. Voir console.');
    }

    // Succès UI
    form.reset();
    const successMessageEl = document.getElementById('successMessage');
    if (successMessageEl) {
      successMessageEl.style.display = 'block';
      setTimeout(() => { successMessageEl.style.display = 'none'; }, 6000);
    }
  } catch (err) {
    console.error('Erreur lors du processus d\'envoi:', err);
    showEmailJsError('Erreur inattendue lors de l\'envoi.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Envoyer le message'; }
  }
}

// Fallback : attacher handleSubmit si le formulaire existe et qu'il n'utilise pas déjà onsubmit inline
document.addEventListener('DOMContentLoaded', () => {
  const formEl = document.getElementById('contactForm');
  if (formEl && !formEl.hasAttribute('onsubmit')) {
    formEl.addEventListener('submit', handleSubmit);
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}