// Configuration EmailJS (garde synchronisé)
const SERVICE_ID = 'service_8ztokan';
const TEMPLATE_ID = 'template_oa78nlt';
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
function validateEmailJsKeys(serviceId, templateId, publicKey, recipientEmail) {
  const messages = [];
  let ok = true;

  if (!serviceId || typeof serviceId !== 'string' || !/^service_[A-Za-z0-9_-]+$/.test(serviceId)) {
    ok = false;
    messages.push('serviceId invalide (doit commencer par "service_...").');
  }

  if (!templateId || typeof templateId !== 'string' || !/^template_[A-Za-z0-9_-]+$/.test(templateId)) {
    ok = false;
    messages.push('templateId invalide (doit commencer par "template_...").');
  }

  if (!publicKey || typeof publicKey !== 'string' || !/^[A-Za-z0-9_-]{8,}$/.test(publicKey)) {
    ok = false;
    messages.push('publicKey invalide ou trop courte.');
  }

  // recipient facultatif si template contient un destinataire par défaut
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

  // Vérification des clés
  const validation = validateEmailJsKeys(SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY, RECIPIENT_EMAIL);
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

  // Construis les variables selon celles attendues par ton template EmailJS.
  // Assure-toi que les noms (from_name, from_email, to_email, message, etc.) correspondent à ton template.
  const templateParams = {
    from_name: nom,
    from_email: email,
    telephone,
    subject: sujet,
    message
  };

  // Si ton template attend une variable "to_email", fournis-la
  if (RECIPIENT_EMAIL && RECIPIENT_EMAIL.length > 0) {
    templateParams.to_email = RECIPIENT_EMAIL;
  }

  // Fournir reply_to est utile pour que la réponse aille vers l'expéditeur
  templateParams.reply_to = email;

  if (!window.emailjs || !window.emailjs.__initialized) {
    showEmailJsError('EmailJS non initialisé. Vérifie le chargement du SDK et la clé publique.');
    return;
  }

  try {
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi...'; }

    // Envoi via EmailJS
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);

    // EmailJS renvoie souvent { status: 200, text: 'OK' }
    const success = result && (result.status === 200 || result.status === 'OK' || result.text === 'OK');
    if (success) {
      form.reset();
      const successMessage = document.getElementById('successMessage');
      if (successMessage) {
        successMessage.style.display = 'block';
        setTimeout(() => { successMessage.style.display = 'none'; }, 6000);
      }
    } else {
      console.error('Envoi EmailJS échoué (réponse non OK):', result);
      let details = '';
      try { details = JSON.stringify(result); } catch (e) { details = String(result); }
      showEmailJsError("Erreur lors de l'envoi. Détails: " + details);
      alert("Une erreur s'est produite lors de l'envoi. Voir console pour détails.");
    }
  } catch (err) {
    // err peut contenir { status: 422, text: '...' } ou être une exception
    console.error('Erreur EmailJS:', err);
    const status = err && err.status ? err.status : 'no-status';
    const text = err && err.text ? err.text : (err && err.message ? err.message : 'no-text');
    showEmailJsError(`Impossible d'envoyer le message (status: ${status}) : ${text}`);
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