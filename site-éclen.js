// Configuration EmailJS
const SERVICE_ID = 'service_8ztokan';
const TEMPLATE_ADMIN = 'template_8a34wag';
const TEMPLATE_USER = 'template_oa78nlt';
const PUBLIC_KEY = 'EKTxooE41vGfUcK9u';
const RECIPIENT_EMAIL = 'mdavygael@yahoo.fr';

// Utilitaires
function showEmailJsError(text) {
  const formContainer = document.querySelector('.contact-form');
  let el = document.getElementById('emailjsError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'emailjsError';
    el.style.cssText = `
      background: #ffe6e6;
      border: 1px solid #ff9090;
      color: #8a1f1f;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 4px;
      font-size: 0.95rem;
    `;
    formContainer.insertBefore(el, formContainer.firstChild);
  }
  el.textContent = 'Erreur : ' + text;
}

// Gestion du formulaire
async function handleSubmit(event) {
  event.preventDefault();
  
  const form = document.getElementById('contactForm');
  if (!form) {
    showEmailJsError('Formulaire introuvable');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  const nom = document.getElementById('nom')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const telephone = document.getElementById('telephone')?.value?.trim();
  const sujet = document.getElementById('sujet')?.value?.trim();
  const message = document.getElementById('message')?.value?.trim();

  if (!nom || !email || !message) {
    showEmailJsError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Envoi...';
    }

    // Email à l'admin
    await emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, {
      from_name: nom,
      from_email: email,
      telephone,
      subject: sujet,
      message,
      to_email: RECIPIENT_EMAIL,
      reply_to: email
    });

    // Email à l'utilisateur
    await emailjs.send(SERVICE_ID, TEMPLATE_USER, {
      to_name: nom,
      to_email: email,
      subject: 'Confirmation - Église Éclen',
      message: `Bonjour ${nom},\n\nNous avons bien reçu votre message.\nNous vous répondrons dans les plus brefs délais.\n\nCordialement,\nÉglise Éclen`,
      reply_to: RECIPIENT_EMAIL
    });

    // Succès
    form.reset();
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
      successMessage.style.display = 'block';
      setTimeout(() => successMessage.style.display = 'none', 5000);
    }

  } catch (err) {
    console.error('Erreur:', err);
    showEmailJsError('Erreur lors de l\'envoi. Veuillez réessayer.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Envoyer le message';
    }
  }
}

// Navigation
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    heroSection.style.display = sectionId === 'accueil' ? 'block' : 'none';
  }
  
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
    const heading = target.querySelector('.section-title');
    if (heading) heading.focus();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Validation des clés EmailJS
  function validateEmailJsConfig() {
    if (!/^[A-Za-z0-9_-]{8,}$/.test(PUBLIC_KEY)) {
      console.error('EmailJS: PUBLIC_KEY invalide');
      return false;
    }
    if (!/^service_[A-Za-z0-9_-]+$/.test(SERVICE_ID)) {
      console.error('EmailJS: SERVICE_ID invalide');
      return false;
    }
    if (!/^template_[A-Za-z0-9_-]+$/.test(TEMPLATE_ADMIN)) {
      console.error('EmailJS: TEMPLATE_ADMIN invalide');
      return false;
    }
    if (!/^template_[A-Za-z0-9_-]+$/.test(TEMPLATE_USER)) {
      console.error('EmailJS: TEMPLATE_USER invalide');
      return false;
    }
    return true;
  }

  if (!validateEmailJsConfig()) {
    showEmailJsError('Configuration EmailJS invalide. Vérifiez les clés.');
    return;
  }
  
  // Init EmailJS
  emailjs.init(PUBLIC_KEY);

  // Form handler
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // Navigation
  document.querySelectorAll('.nav-links a[data-section]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showSection(a.dataset.section);
    });
  });

  // Versets
  displayTodayVerse();
  setInterval(displayTodayVerse, 1000 * 60 * 60 * 6);
});

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

// Utilitaires pour les versets
function getWeekStartIso() {
  const now = new Date();
  const day = now.getDay(); // 0-6 (dimanche-samedi)
  const diff = (day + 6) % 7; // Ajustement pour commencer le lundi
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

// Placer cette fonction avant ensureWeeklyVerses()

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

// Gestion des sections (navigation)
(function () {
    function showSection(id) {
        const prev = document.querySelector('.section.active');
        if (prev) prev.classList.remove('active');
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('active');
            // focus pour accessibilité
            const h = target.querySelector('.section-title') || target.querySelector('h2');
            if (h) h.focus?.();
        }
    }

    // nav links
    document.querySelectorAll('.nav-links a[data-section]').forEach(a => {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const sec = this.dataset.section;
            showSection(sec);
        });
    });

    // Verset de la semaine (liste courte en local)
    const verses = [
        { text: "L'Éternel est mon berger: je ne manquerai de rien.", ref: "Psaume 23:1" },
        { text: "Je puis tout par celui qui me fortifie.", ref: "Philippiens 4:13" },
        { text: "Car Dieu a tant aimé le monde...", ref: "Jean 3:16" },
        { text: "Cherchez premièrement le royaume de Dieu...", ref: "Matthieu 6:33" }
    ];
    (function renderVerse() {
        const r = Math.floor(Math.random() * verses.length);
        const v = verses[r];
        const textEl = document.getElementById('verseText');
        const refEl = document.getElementById('verseRef');
        if (textEl) textEl.textContent = v.text;
        if (refEl) refEl.textContent = v.ref;
    })();

    // Formulaire de contact
    const form = document.getElementById('contactForm');
    const success = document.getElementById('successMessage');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // validation simple
            const required = [...form.querySelectorAll('[required]')];
            for (const el of required) {
                if (!el.value.trim()) {
                    el.focus();
                    return;
                }
            }

            // Si EmailJS est configuré
            if (window.emailjs) {
                emailjs.init(PUBLIC_KEY);
                emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, {
                    nom: form.nom.value,
                    email: form.email.value,
                    telephone: form.telephone.value,
                    sujet: form.sujet.value,
                    message: form.message.value
                }).then(
                    function() { 
                        showSuccess();
                    },
                    function(error) {
                        console.error('EmailJS error:', error);
                        showEmailJsError('Erreur lors de l\'envoi. Veuillez réessayer.');
                    }
                );
                return;
            }

            // Comportement par défaut si EmailJS non disponible
            showSuccess();
        });
    }

    function showSuccess() {
        if (success) {
            success.style.display = 'block';
            setTimeout(() => { success.style.display = 'none'; }, 5000);
        }
        if (form) form.reset();
    }

    // Exposer la fonction showSection globalement si nécessaire
    window.showSection = showSection;
})();

