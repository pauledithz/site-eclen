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

// --- Versets dynamiques / API labs.bible.org ---
const WEEKLY_VERSES_KEY = 'weeklyVerses_v1';
const WEEK_START_DAY = 1; // 1 = lundi (début de la semaine pour rotation)

// fallback si l'API est indisponible
const FALLBACK_VERSES = [
  { book: 'Jean', chapter: 3, verse: 16, text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique..." },
  { book: 'Psaumes', chapter: 23, verse: 1, text: "L'Éternel est mon berger: je ne manquerai de rien." },
  { book: 'Philippiens', chapter: 4, verse: 13, text: "Je puis tout par celui qui me fortifie." },
  // ...ajouter quelques versets utiles
];

/*
  Option recommandée pour versets en français :
  - Utiliser d'abord bible-api.com (pas de clé, simple) en demandant la traduction "segond".
  - Si besoin d'une source plus fiable/traductions officielles, utiliser api.scripture.api.bible (nécessite clé).
  Remplace API_BIBLE_KEY et BIBLE_ID si vous choisissez api.bible.
*/

// --- Configuration pour API française ---
const API_BIBLE_KEY = ''; // <-- optionnel : clé pour https://scripture.api.bible (laisser vide si pas utilisée)
const BIBLE_ID = '';      // <-- optionnel : id de la version française (à récupérer via l'API si utilisé)

// Pool de références (format lisible). On tire 7 références au hasard chaque début de semaine.
const REFERENCE_POOL = [
  'Jean 3:16', 'Psaumes 23:1', 'Philippiens 4:13', 'Romains 8:28', 'Proverbes 3:5',
  'Matthieu 11:28', 'Ésaïe 40:31', 'Psaumes 46:1', 'Hébreux 11:1', 'Jacques 1:2-3',
  '1 Corinthiens 13:4-7', 'Luc 6:37', 'Jean 14:6', 'Psaumes 121:1-2', 'Éphésiens 2:8-9',
  'Romains 12:2', 'Galates 5:22-23', 'Actes 1:8', 'Matthieu 6:33', 'Josué 1:9'
];

// utilitaire : décode entités HTML (ex: &quot;, &amp;)
function decodeHtmlEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str || '';
  return txt.value;
}

// formate le texte du verset pour l'injecter en HTML (conserve retours à la ligne)
function formatVerseHtml(raw) {
  if (!raw) return '';
  // décode entités puis remplace retours ligne par <br>
  const decoded = decodeHtmlEntities(String(raw));
  return decoded
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('<br>');
}

// remplace l'ancienne logique fetchRandomVerseFromApi par une version qui récupère le texte en français
async function fetchVerseByReference(ref) {
  // 1) essai bible-api.com (pas de clé). demande la traduction "segond" (tester si disponible)
  try {
    const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=segond`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      // Préférer le tableau 'verses' et conserver les retours à la ligne
      if (Array.isArray(json.verses) && json.verses.length > 0) {
        const book = json.verses[0].book_name || '';
        const chapter = json.verses[0].chapter || null;
        const verse = json.verses[0].verse || null;
        const text = json.verses.map(v => v.text).join('\n'); // <-- join with newline
        if (text) {
          return { book, chapter, verse, text: String(text).trim() };
        }
      }
      // fallback : some responses expose 'text'
      const textAlt = json.text;
      if (textAlt) {
        const first = Array.isArray(json.verses) && json.verses[0];
        const book = first ? first.book_name : (json.reference ? json.reference.split(' ')[0] : '');
        const chapter = first ? first.chapter : null;
        const verse = first ? first.verse : null;
        return { book, chapter, verse, text: String(textAlt).trim() };
      }
    }
  } catch (e) {
    console.warn('bible-api.com failed for', ref, e);
  }

  // 2) essai scripture.api.bible (si clé et id fournis) — structure variable selon l'API
  if (API_BIBLE_KEY && BIBLE_ID) {
    try {
      const url = `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/passages?passage=${encodeURIComponent(ref)}&include-notes=false`;
      const res = await fetch(url, { headers: { 'api-key': API_BIBLE_KEY } });
      if (res.ok) {
        const json = await res.json();
        // La réponse peut contenir du HTML dans data.content ; on nettoie les balises
        // tentative pour extraire un texte lisible
        const raw = (json.data && (json.data.content || (Array.isArray(json.data) && json.data[0]?.content))) || '';
        const clean = String(raw).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (clean) {
          // on renvoie la référence brute si on ne peut pas parser chapitre/verset proprement
          return { book: ref.split(' ')[0], chapter: null, verse: null, text: clean };
        }
      } else {
        console.warn('api.bible responded with', res.status, res.statusText);
      }
    } catch (e) {
      console.warn('api.bible failed for', ref, e);
    }
  }

  // 3) fallback null (appelant doit utiliser FALLBACK_VERSES)
  return null;
}

// crée ou récupère les 7 versets de la semaine en cache (choisit références dans REFERENCE_POOL puis résout le texte via API)
async function ensureWeeklyVerses() {
  const weekKey = getWeekStartIso();
  const stored = JSON.parse(localStorage.getItem(WEEKLY_VERSES_KEY) || 'null');

  if (stored && stored.week === weekKey && Array.isArray(stored.verses) && stored.verses.length === 7) {
    return stored.verses;
  }

  // choisir 7 références aléatoires (évite doublons si possible)
  const pool = [...REFERENCE_POOL];
  const chosenRefs = [];
  for (let i = 0; i < 7 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    chosenRefs.push(pool.splice(idx, 1)[0]);
  }

  const verses = [];
  for (let i = 0; i < chosenRefs.length; i++) {
    const ref = chosenRefs[i];
    const v = await fetchVerseByReference(ref);
    if (v) {
      // si l'API n'a pas renvoyé chapitre/verset, on essaie d'extraire de la référence
      let chapter = v.chapter, verseNum = v.verse;
      if (!chapter || !verseNum) {
        const m = ref.match(/([\d]+):([\d\-–,]+)/);
        if (m) { chapter = Number(m[1]); verseNum = m[2]; }
      }
      verses.push({
        book: v.book || ref.split(' ')[0],
        chapter: chapter || '',
        verse: verseNum || '',
        text: v.text || ''
      });
    } else {
      // fallback local si l'API échoue
      verses.push(FALLBACK_VERSES[i % FALLBACK_VERSES.length]);
    }
    // pause courte pour politesse
    await new Promise(r => setTimeout(r, 120));
  }

  localStorage.setItem(WEEKLY_VERSES_KEY, JSON.stringify({ week: weekKey, verses, createdAt: new Date().toISOString() }));
  return verses;
}

// affiche le verset du jour (index basé sur le jour de la semaine)
async function displayTodayVerse() {
  const verseTextEl = document.getElementById('verseText');
  const verseRefEl = document.getElementById('verseRef');
  if (!verseTextEl || !verseRefEl) return;

  verseTextEl.textContent = 'Chargement du verset...';
  verseRefEl.textContent = '';

  try {
    const verses = await ensureWeeklyVerses();
    const today = new Date();
    const dayIndex = today.getDay(); // 0..6
    const indexForMondayStart = (dayIndex + 6) % 7;
    const verse = verses[indexForMondayStart] || verses[0];

    // utiliser innerHTML pour conserver les retours à la ligne
    verseTextEl.innerHTML = formatVerseHtml(verse.text);
    verseRefEl.textContent = `${verse.book} ${verse.chapter}:${verse.verse}`;
  } catch (e) {
    console.error('Erreur affichage verset:', e);
    const v = FALLBACK_VERSES[0];
    verseTextEl.innerHTML = formatVerseHtml(v.text);
    verseRefEl.textContent = `${v.book} ${v.chapter}:${v.verse}`;
  }
}

// Appel au chargement
document.addEventListener('DOMContentLoaded', () => {
  // afficher le verset dès le load
  displayTodayVerse();

  // optionnel : rafraîchir tous les X ms (ici toutes les 6 heures) si la page reste ouverte
  setInterval(displayTodayVerse, 1000 * 60 * 60 * 6);
});