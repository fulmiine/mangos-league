
/**
 * MANGOS LEAGUE - APP CORE LOGIC (v21 Compatible)
 */

const ALL_BADGES = [
  { id: 'muro', name: 'Muro Invalicabile', icon: '🧱', cat: 'dif' },
  { id: 'cingolato', name: 'Il Cingolato', icon: '🚜', cat: 'dif' },
  { id: 'calamita', name: 'Calamita', icon: '🧲', cat: 'dif' },
  { id: 'casello', name: 'Casello Autostradale', icon: '🚧', cat: 'dif' },
  { id: 'borseggiatore', name: 'Il Borseggiatore', icon: '🥷', cat: 'dif' },
  { id: 'ancora', name: 'L\'Ancora', icon: '⚓', cat: 'dif' },
  { id: 'fulmine', name: 'Fulmine', icon: '⚡', cat: 'vel' },
  { id: 'tre_polmoni', name: 'Tre Polmoni', icon: '🫁', cat: 'vel' },
  { id: 'ciao_50', name: 'Il Ciao 50', icon: '🛵', cat: 'vel' },
  { id: 'segugio', name: 'Il Segugio', icon: '🐕', cat: 'vel' },
  { id: 'tornado', name: 'Il Tornado', icon: '🌪️', cat: 'vel' },
  { id: 'scarpetta', name: 'Scarpetta d\'Oro', icon: '👟', cat: 'att' },
  { id: 'cecchino', name: 'Cecchino', icon: '🎯', cat: 'att' },
  { id: 'volpe', name: 'Volpe d\'Area', icon: '🦊', cat: 'att' },
  { id: 'cannoniere', name: 'Cannoniere', icon: '💣', cat: 'att' },
  { id: 'sangue_freddo', name: 'Sangue Cold', icon: '🧊', cat: 'att' },
  { id: 'pizzicaro', name: 'Il Pizzicaro', icon: '🤌', cat: 'att' },
  { id: 'mago', name: 'Il Mago', icon: '🪄', cat: 'tec' },
  { id: 'ubriacante', name: 'Ubriacante', icon: '🌀', cat: 'tec' },
  { id: 'piede_educato', name: 'Piede Educato', icon: '👟', cat: 'tec' },
  { id: 'brasiliano', name: 'Brasiliano', icon: '🇧🇷', cat: 'tec' }
];

// DATABASE DEI 27 GIOCATORI: RIK E SGUMBO COME ATT PREDEFINITI
let players = JSON.parse(localStorage.getItem('mangos_v21_players')) || [
  { id: 1, name: "Davide Senox", role: "DC", ovr: 88, desc: "Muro assurdo invalicabile", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['muro', 'casello'] },
  { id: 2, name: "Francesco", role: "DC", ovr: 88, desc: "Livello Senox, insuperabile", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['muro', 'cingolato'] },
  { id: 3, name: "Antonio", role: "ATT", ovr: 87, desc: "Attaccante forte e spietato", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['cecchino', 'cannoniere'] },
  { id: 4, name: "Rik", role: "ATT", ovr: 87, desc: "Corre tantissimo, spacca le partite", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['fulmine', 'tre_polmoni'] },
  { id: 5, name: "Enrico", role: "ATT", ovr: 85, desc: "Punta molto golosa, sente la porta", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['volpe', 'sangue_freddo'] },
  { id: 6, name: "Matteo", role: "POR", ovr: 84, desc: "Portierone top, all'occorrenza jolly", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['muro', 'calamita'] },
  { id: 7, name: "Sergio", role: "CC", ovr: 84, desc: "Box-to-box sia offensivo che difensivo", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['tre_polmoni', 'mago'] },
  { id: 8, name: "Aldo", role: "CC", ovr: 83, desc: "Dribbling e passaggi d'oro, finalizza poco", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['mago', 'piede_educato'] },
  { id: 9, name: "Nicola", role: "ATT", ovr: 83, desc: "Bell'attaccante, quasi top", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['cannoniere', 'sangue_freddo'] },
  { id: 10, name: "Marco", role: "ATT", ovr: 82, desc: "Nuovo innesto affamato di gol", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['pizzicaro', 'cannoniere'] },
  { id: 11, name: "Peppe", role: "DC", ovr: 82, desc: "Fisico possente, bulldozer", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['cingolato', 'muro'] },
  { id: 12, name: "Dani", role: "DC", ovr: 81, desc: "Difensore pulito ed efficace", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['borseggiatore', 'casello'] },
  { id: 13, name: "Dado", role: "DC", ovr: 81, desc: "Bello tosto in marcatura", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['casello', 'calamita'] },
  { id: 14, name: "Vincy", role: "COC", ovr: 81, desc: "Nanetto veloce che semina il panico", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['ciao_50', 'fulmine'] },
  { id: 15, name: "Sgumbolotto", role: "ATT", ovr: 81, desc: "Piede educato, ritrova smalto", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['piede_educato', 'ubriacante'] },
  { id: 16, name: "Lorenzo", role: "CC", ovr: 80, desc: "Palla incollata tipo Messi, poi si perde", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['ubriacante', 'brasiliano'] },
  { id: 17, name: "Federico", role: "DC", ovr: 79, desc: "Francobollo attaccato dietro gli altri", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['segugio', 'calamita'] },
  { id: 18, name: "Andriix", role: "DC", ovr: 79, desc: "Roccia difensiva, poca agilità", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['casello', 'ancora'] },
  { id: 19, name: "Riccardo", role: "ED", ovr: 79, desc: "Bel centrocampista e incursore", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['ciao_50', 'tre_polmoni'] },
  { id: 20, name: "Belviso", role: "CC", ovr: 78, desc: "Agile e con bella struttura", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['piede_educato', 'tre_polmoni'] },
  { id: 21, name: "Flavio", role: "DC", ovr: 76, desc: "Buon difensore solido sotto Andriix", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['borseggiatore', 'casello'] },
  { id: 22, name: "Sbunghi", role: "CDC", ovr: 75, desc: "35enne: prima attacca, poi arretra e si lamenta", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['ancora', 'tornado'] },
  { id: 23, name: "Alberto", role: "DC", ovr: 74, desc: "Poco agile ma un armadio possente", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['cingolato', 'ancora'] },
  { id: 24, name: "Berto", role: "DC", ovr: 73, desc: "Buono ma a volte si perde l'uomo", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['tornado', 'calamita'] },
  { id: 25, name: "Ale Riolo", role: "TD", ovr: 72, desc: "Terzino di fascia generoso", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['segugio', 'ciao_50'] },
  { id: 26, name: "Giulio", role: "CC", ovr: 71, desc: "Mistero tattico in campo", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['tornado', 'brasiliano'] },
  { id: 27, name: "Sebastian", role: "DC", ovr: 68, desc: "Cuore grande ma difensore arruffone", goals: 0, assists: 0, matches: 0, wins: 0, losses: 0, present: false, badges: ['tornado', 'cingolato'] }
];

// Sanificazione per prevenire undefined
players = players.map(p => ({
  ...p,
  matches: p.matches ?? p.pg ?? 0,
  wins: p.wins ?? p.v ?? 0,
  losses: p.losses ?? p.s ?? 0,
  goals: p.goals ?? 0,
  assists: p.assists ?? 0
}));

let savedMatchdays = JSON.parse(localStorage.getItem('mangos_v21_matchdays')) || [];
let isAdmin = localStorage.getItem('mangos_v21_admin') === 'true';

let activeMatchSavedState = JSON.parse(localStorage.getItem('mangos_active_match')) || null;

let currentWhiteTeam = activeMatchSavedState ? activeMatchSavedState.whiteTeam || [] : [];
let currentBlackTeam = activeMatchSavedState ? activeMatchSavedState.blackTeam || [] : [];
let currentGkWhiteId = activeMatchSavedState ? activeMatchSavedState.gkWhiteId : null;
let currentGkBlackId = activeMatchSavedState ? activeMatchSavedState.gkBlackId : null;
let tacticalOverridesWhite = activeMatchSavedState ? activeMatchSavedState.overridesWhite || {} : {};
let tacticalOverridesBlack = activeMatchSavedState ? activeMatchSavedState.overridesBlack || {} : {};

let swapSelection = null;
let activePitchAction = { team: null, playerId: null, context: 'active' };

let tempSavedOverridesWhite = {};
let tempSavedOverridesBlack = {};
let tempSavedGkWhiteId = null;
let tempSavedGkBlackId = null;

let activeMatchdayId = null;

let statusFilter = 'ALL';
let searchQuery = '';
let statsSearchQuery = '';
let statsRoleFilter = 'ALL';
let currentSort = { col: 'goals', dir: 'desc' };
let currentFutPlayerId = null;
let selectedMatchdayDetailId = null;

let editingPlayerId = null;
let tempSelectedRole = "CC";

let tempGoalsListWhite = [];
let tempGoalsListBlack = [];

const AVAILABLE_ROLES = {
  por: ['POR'],
  dif: ['DC', 'TS', 'TD'],
  cen: ['CDC', 'CC', 'COC', 'ES', 'ED'],
  att: ['AD', 'AS', 'ATT']
};

// FIX REFRESH ICONE DEBOUNCED
let iconRefreshTimeout = null;
function refreshIcons() {
  if (iconRefreshTimeout) clearTimeout(iconRefreshTimeout);
  iconRefreshTimeout = setTimeout(() => {
    if (window.lucide) lucide.createIcons();
  }, 16);
}

function saveState() {
  localStorage.setItem('mangos_v21_players', JSON.stringify(players));
}

function saveActiveMatchState() {
  if (currentWhiteTeam.length === 0 || currentBlackTeam.length === 0) return;
  const state = {
    whiteTeam: currentWhiteTeam,
    blackTeam: currentBlackTeam,
    gkWhiteId: currentGkWhiteId,
    gkBlackId: currentGkBlackId,
    overridesWhite: tacticalOverridesWhite,
    overridesBlack: tacticalOverridesBlack,
    rawDate: document.getElementById('match-date-input').value,
    time: document.getElementById('match-time-input').value,
    place: document.getElementById('match-place-input').value
  };
  localStorage.setItem('mangos_active_match', JSON.stringify(state));
}

function formatIsoDateToItalian(isoDateStr) {
  if (!isoDateStr) return '';
  try {
    const [y, m, d] = isoDateStr.split('-');
    const dt = new Date(y, m - 1, d);
    const formatted = dt.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch (e) {
    return isoDateStr;
  }
}

function syncPublicMatchInfo() {
  const rawDate = document.getElementById('match-date-input')?.value || '';
  const timeVal = document.getElementById('match-time-input')?.value || '';
  const placeVal = document.getElementById('match-place-input')?.value || '';

  const dateStr = formatIsoDateToItalian(rawDate);
  const dtFormatted = (dateStr && timeVal) ? `${dateStr} - ore ${timeVal}` : (dateStr || 'In attesa di programmazione...');

  const pubDt = document.getElementById('public-match-datetime');
  if (pubDt) pubDt.innerText = dtFormatted;
  const pubPl = document.getElementById('public-match-place');
  if (pubPl) pubPl.innerText = placeVal || 'Calcetto Mangos Arena';

  if (currentWhiteTeam.length > 0 && currentBlackTeam.length > 0) {
    saveActiveMatchState();
  }
}

function getPlayerCategory(role) {
  const r = (role || "").toUpperCase();
  if (r === 'POR' || r.includes('POR') || r.includes('PORT')) return 'POR';
  if (['DC', 'TS', 'TD'].includes(r) || r.includes('DIF') || r.includes('TER')) return 'DIF';
  if (['CDC', 'CC', 'COC', 'ES', 'ED'].includes(r) || r.includes('CEN') || r.includes('TRQ') || r.includes('ALA')) return 'CEN';
  if (['ATT', 'AD', 'AS'].includes(r) || r.includes('ATT') || r.includes('PUN')) return 'ATT';
  return 'CEN';
}

// ==================== GESTIONE ADMIN (SENZA LOOP) ====================
function updateAdminVisuals() {
  const lockBtn = document.getElementById('btn-admin-lock');
  const badgeStats = document.getElementById('badge-admin-stats');
  const bannerStats = document.getElementById('leaderboard-header-banner');
  const adminStatsActions = document.getElementById('admin-stats-actions');
  const thAdminActions = document.getElementById('th-admin-actions');
  
  const adminMatchInputs = document.getElementById('admin-match-inputs');
  const adminGenerateContainer = document.getElementById('admin-generate-container');
  const adminMatchActions = document.getElementById('admin-match-actions');
  const adminConvocatiSection = document.getElementById('admin-convocati-section');
  const swapBanner = document.getElementById('swap-banner');

  if (isAdmin) {
    lockBtn.className = "p-2 md:px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 transition active:scale-95 flex items-center gap-1.5";
    lockBtn.innerHTML = '<i data-lucide="unlock" class="w-4 h-4"></i><span id="lock-label" class="text-[10px] md:text-xs font-bold hidden sm:inline">Admin</span>';
    
    badgeStats?.classList.remove('hidden');
    bannerStats?.classList.add('border-emerald-500/40', 'bg-emerald-500/5');
    adminStatsActions?.classList.remove('hidden');
    thAdminActions?.classList.remove('hidden');

    adminMatchInputs?.classList.remove('hidden');
    adminGenerateContainer?.classList.remove('hidden');
    adminMatchActions?.classList.remove('hidden');
    adminConvocatiSection?.classList.remove('hidden');
    swapBanner?.classList.remove('hidden');
  } else {
    lockBtn.className = "p-2 md:px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 transition active:scale-95 flex items-center gap-1.5";
    lockBtn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i><span id="lock-label" class="text-[10px] md:text-xs font-bold hidden sm:inline">Admin</span>';

    badgeStats?.classList.add('hidden');
    bannerStats?.classList.remove('border-emerald-500/40', 'bg-emerald-500/5');
    adminStatsActions?.classList.add('hidden');
    thAdminActions?.classList.add('hidden');

    adminMatchInputs?.classList.add('hidden');
    adminGenerateContainer?.classList.add('hidden');
    adminMatchActions?.classList.add('hidden');
    adminConvocatiSection?.classList.add('hidden');
    swapBanner?.classList.add('hidden');
  }

  refreshIcons();
}

function handleAdminLockClick() {
  if (isAdmin) {
    isAdmin = false;
    localStorage.setItem('mangos_v21_admin', 'false');
    updateAdminVisuals();
    renderLeaderboard();
    renderArchiveList();
    renderTeamsDisplay();
  } else {
    document.getElementById('admin-password-field').value = '';
    document.getElementById('admin-auth-error').classList.add('hidden');
    document.getElementById('modal-admin-auth').classList.remove('hidden');
  }
}

function submitAdminAuth() {
  const p = document.getElementById('admin-password-field').value.trim();
  if (p === 'mangos2026') {
    isAdmin = true;
    localStorage.setItem('mangos_v21_admin', 'true');
    closeModals();
    updateAdminVisuals();
    renderLeaderboard();
    renderArchiveList();
    renderTeamsDisplay();
  } else {
    document.getElementById('admin-auth-error').classList.remove('hidden');
  }
}

// ==================== CREAZIONE NUOVO GIOCATORE ====================
function openAddPlayerModal() {
  if (!isAdmin) return;
  document.getElementById('new-player-name').value = '';
  document.getElementById('new-player-role').value = 'ATT';
  document.getElementById('new-player-ovr').value = '80';
  document.getElementById('new-player-desc').value = '';
  document.getElementById('modal-add-player').classList.remove('hidden');
}

function closeAddPlayerModal() {
  document.getElementById('modal-add-player').classList.add('hidden');
}

function submitNewPlayer() {
  if (!isAdmin) return;
  const name = document.getElementById('new-player-name').value.trim();
  if (!name) return;

  const role = document.getElementById('new-player-role').value;
  const ovr = Math.min(99, Math.max(1, parseInt(document.getElementById('new-player-ovr').value) || 80));
  const desc = document.getElementById('new-player-desc').value.trim() || 'Nuovo innesto Mangos League';

  const newPlayer = {
    id: Date.now(),
    name: name,
    role: role,
    ovr: ovr,
    desc: desc,
    goals: 0,
    assists: 0,
    matches: 0,
    wins: 0,
    losses: 0,
    present: false,
    badges: []
  };

  players.push(newPlayer);
  saveState();
  closeAddPlayerModal();
  renderPlayers();
  renderLeaderboard();
}

// ==================== MODIFICA & ELIMINAZIONE GIOCATORE ====================
function openEditPlayerModal(id) {
  if (!isAdmin) return;
  const p = players.find(x => x.id === id);
  if (!p) return;

  editingPlayerId = id;
  document.getElementById('edit-player-name').value = p.name;
  document.getElementById('edit-player-role').value = p.role;
  document.getElementById('edit-player-ovr').value = p.ovr;
  document.getElementById('edit-player-desc').value = p.desc || '';

  document.getElementById('edit-player-matches').value = p.matches || 0;
  document.getElementById('edit-player-wins').value = p.wins || 0;
  document.getElementById('edit-player-losses').value = p.losses || 0;
  document.getElementById('edit-player-goals').value = p.goals || 0;
  document.getElementById('edit-player-assists').value = p.assists || 0;

  document.getElementById('modal-edit-player').classList.remove('hidden');
}

function closeEditPlayerModal() {
  document.getElementById('modal-edit-player').classList.add('hidden');
  editingPlayerId = null;
}

function saveEditedPlayer() {
  if (!isAdmin || !editingPlayerId) return;
  const p = players.find(x => x.id === editingPlayerId);
  if (!p) return;

  p.name = document.getElementById('edit-player-name').value.trim() || p.name;
  p.role = document.getElementById('edit-player-role').value;
  p.ovr = Math.min(99, Math.max(1, parseInt(document.getElementById('edit-player-ovr').value) || p.ovr));
  p.desc = document.getElementById('edit-player-desc').value.trim() || p.desc;

  p.matches = Math.max(0, parseInt(document.getElementById('edit-player-matches').value) || 0);
  p.wins = Math.max(0, parseInt(document.getElementById('edit-player-wins').value) || 0);
  p.losses = Math.max(0, parseInt(document.getElementById('edit-player-losses').value) || 0);
  p.goals = Math.max(0, parseInt(document.getElementById('edit-player-goals').value) || 0);
  p.assists = Math.max(0, parseInt(document.getElementById('edit-player-assists').value) || 0);

  saveState();
  closeEditPlayerModal();
  renderPlayers();
  renderLeaderboard();
  if (currentWhiteTeam.length) renderTeamsDisplay();
}

function deletePlayerDirect(id) {
  if (!isAdmin) return;
  const p = players.find(x => x.id === id);
  if (!p) return;

  const confirmDel = confirm(`Sei sicuro di voler eliminare definitivamente ${p.name}?`);
  if (!confirmDel) return;

  players = players.filter(x => x.id !== id);
  currentWhiteTeam = currentWhiteTeam.filter(x => x.id !== id);
  currentBlackTeam = currentBlackTeam.filter(x => x.id !== id);

  saveState();
  closeEditPlayerModal();
  renderPlayers();
  renderLeaderboard();
  if (currentWhiteTeam.length) renderTeamsDisplay();
}

// ==================== TAB 2: PARTITA ====================
function handleSearchFilter() {
  searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  renderPlayers();
}

function setStatusFilter(status) {
  statusFilter = status;
  ['ALL', 'IN', 'OUT'].forEach(s => {
    const btn = document.getElementById(`filter-btn-${s}`);
    if (s === status) {
      btn.className = "flex-1 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black border border-amber-400 shadow transition";
    } else {
      const textColor = s === 'IN' ? 'text-emerald-400' : (s === 'OUT' ? 'text-red-400' : 'text-zinc-300');
      btn.className = `flex-1 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 ${textColor} border border-white/10 transition`;
    }
  });
  renderPlayers();
}

function renderPlayers() {
  const container = document.getElementById('players-list');
  if (!container) return;
  container.innerHTML = '';

  const presentCount = players.filter(p => p.present).length;
  const absentCount = players.length - presentCount;
  document.getElementById('count-in').innerText = presentCount;
  document.getElementById('count-total').innerText = players.length;
  document.getElementById('filter-count-all').innerText = players.length;
  document.getElementById('filter-count-in').innerText = presentCount;
  document.getElementById('filter-count-out').innerText = absentCount;

  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery);
    if (statusFilter === 'IN') return matchesSearch && p.present;
    if (statusFilter === 'OUT') return matchesSearch && !p.present;
    return matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full p-6 text-center text-zinc-500 text-xs italic">Nessun giocatore trovato.</div>`;
    return;
  }

  filtered.forEach(p => {
    const item = document.createElement('div');
    item.className = `p-3 rounded-xl border transition flex items-center justify-between cursor-pointer select-none ${
      p.present ? 'bg-white/10 border-amber-500/50' : 'bg-white/5 border-white/5 opacity-50'
    }`;
    item.onclick = () => togglePresence(p.id);

    item.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-xs flex items-center justify-center">${p.ovr}</span>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-sm text-white">${p.name}</span>
            <span class="text-[9px] font-mono uppercase bg-white/10 text-zinc-300 px-1.5 py-0.2 rounded font-bold">${p.role}</span>
          </div>
          <p class="text-[10px] text-zinc-400 italic">${p.desc}</p>
        </div>
      </div>
      <div>
        <span class="text-[10px] font-black px-2.5 py-1 rounded-full ${
          p.present ? 'bg-emerald-500 text-black font-black' : 'bg-zinc-800 text-zinc-500'
        }">
          ${p.present ? 'IN' : 'OUT'}
        </span>
      </div>
    `;
    container.appendChild(item);
  });

  refreshIcons();
}

function togglePresence(id) {
  players = players.map(p => p.id === id ? { ...p, present: !p.present } : p);
  saveState();
  renderPlayers();
}

function selectAll(state) {
  players = players.map(p => ({ ...p, present: state }));
  saveState();
  renderPlayers();
}

function generateTeams() {
  const active = players.filter(p => p.present);
  if (active.length < 2) return;

  swapSelection = null;
  tacticalOverridesWhite = {};
  tacticalOverridesBlack = {};

  const sorted = [...active].sort((a, b) => b.ovr - a.ovr);
  currentWhiteTeam = [];
  currentBlackTeam = [];

  sorted.forEach((p, idx) => {
    if (idx % 4 === 0 || idx % 4 === 3) {
      currentWhiteTeam.push(p);
    } else {
      currentBlackTeam.push(p);
    }
  });

  const porW = currentWhiteTeam.find(p => p.role === 'POR');
  currentGkWhiteId = porW ? porW.id : (currentWhiteTeam[0]?.id || null);

  const porB = currentBlackTeam.find(p => p.role === 'POR');
  currentGkBlackId = porB ? porB.id : (currentBlackTeam[0]?.id || null);

  saveActiveMatchState();
  renderTeamsDisplay();
  window.scrollTo({ top: document.getElementById('teams-container').offsetTop - 70, behavior: 'smooth' });
}

// SCAMBI & TRASFERIMENTI
function handleSwapClick(team, playerId) {
  if (!isAdmin) return;
  if (!swapSelection) {
    swapSelection = { team, id: playerId };
    const p = (team === 'white' ? currentWhiteTeam : currentBlackTeam).find(x => x.id === playerId);
    document.getElementById('swap-banner-text').innerHTML = `Selezionato <b>${p.name}</b>. Ora tocca un avversario per scambiarlo!`;
    document.getElementById('swap-banner').classList.add('bg-amber-500/30');
  } else {
    if (swapSelection.team === team) {
      if (swapSelection.id === playerId) {
        swapSelection = null;
        document.getElementById('swap-banner-text').innerText = "Tocca un giocatore bianco e uno nero per scambiarli!";
        document.getElementById('swap-banner').classList.remove('bg-amber-500/30');
      } else {
        swapSelection = { team, id: playerId };
        const p = (team === 'white' ? currentWhiteTeam : currentBlackTeam).find(x => x.id === playerId);
        document.getElementById('swap-banner-text').innerHTML = `Selezionato <b>${p.name}</b>. Ora tocca un avversario per scambiarlo!`;
      }
    } else {
      const whitePlayerId = swapSelection.team === 'white' ? swapSelection.id : playerId;
      const blackPlayerId = swapSelection.team === 'black' ? swapSelection.id : playerId;

      const idxW = currentWhiteTeam.findIndex(p => p.id === whitePlayerId);
      const idxB = currentBlackTeam.findIndex(p => p.id === blackPlayerId);

      if (idxW !== -1 && idxB !== -1) {
        const temp = currentWhiteTeam[idxW];
        currentWhiteTeam[idxW] = currentBlackTeam[idxB];
        currentBlackTeam[idxB] = temp;
      }

      delete tacticalOverridesWhite[whitePlayerId];
      delete tacticalOverridesBlack[blackPlayerId];

      swapSelection = null;
      document.getElementById('swap-banner-text').innerText = "Scambio effettuato con successo! 🔄";
      document.getElementById('swap-banner').classList.remove('bg-amber-500/30');

      if (!currentWhiteTeam.some(p => p.id === currentGkWhiteId)) currentGkWhiteId = currentWhiteTeam[0]?.id || null;
      if (!currentBlackTeam.some(p => p.id === currentGkBlackId)) currentGkBlackId = currentBlackTeam[0]?.id || null;

      saveActiveMatchState();
    }
  }
  renderTeamsDisplay();
}

function transferPlayer(team, playerId, event) {
  if (!isAdmin) return;
  event.stopPropagation();
  swapSelection = null;
  document.getElementById('swap-banner-text').innerText = "Tocca un giocatore bianco e uno nero per scambiarli!";
  document.getElementById('swap-banner').classList.remove('bg-amber-500/30');

  if (team === 'white') {
    const idx = currentWhiteTeam.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      const [moved] = currentWhiteTeam.splice(idx, 1);
      currentBlackTeam.push(moved);
    }
  } else {
    const idx = currentBlackTeam.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      const [moved] = currentBlackTeam.splice(idx, 1);
      currentWhiteTeam.push(moved);
    }
  }

  currentWhiteTeam = [...new Map(currentWhiteTeam.map(item => [item.id, item])).values()];
  currentBlackTeam = [...new Map(currentBlackTeam.map(item => [item.id, item])).values()];

  delete tacticalOverridesWhite[playerId];
  delete tacticalOverridesBlack[playerId];

  if (!currentWhiteTeam.some(p => p.id === currentGkWhiteId)) currentGkWhiteId = currentWhiteTeam[0]?.id || null;
  if (!currentBlackTeam.some(p => p.id === currentGkBlackId)) currentGkBlackId = currentBlackTeam[0]?.id || null;

  saveActiveMatchState();
  renderTeamsDisplay();
}

function rotateKeeper(team) {
  if (team === 'white') {
    if (currentWhiteTeam.length === 0) return;
    const currIdx = currentWhiteTeam.findIndex(p => p.id === currentGkWhiteId);
    const nextIdx = (currIdx + 1) % currentWhiteTeam.length;
    currentGkWhiteId = currentWhiteTeam[nextIdx].id;
  } else {
    if (currentBlackTeam.length === 0) return;
    const currIdx = currentBlackTeam.findIndex(p => p.id === currentGkBlackId);
    const nextIdx = (currIdx + 1) % currentBlackTeam.length;
    currentGkBlackId = currentBlackTeam[nextIdx].id;
  }
  saveActiveMatchState();
  renderTacticalAndTurns();
}

function setKeeper(team, playerId) {
  if (team === 'white') currentGkWhiteId = playerId;
  else currentGkBlackId = playerId;
  saveActiveMatchState();
  renderTacticalAndTurns();
}

function generateDynamicTactics(team, activeGkId, overrides) {
  if (!team || team.length === 0) return { por: null, dif: [], cc: [], att: [], modulo: "--", desc: "" };

  const gk = team.find(p => p.id === activeGkId) || team[0];
  const outfield = team.filter(p => p.id !== gk.id);

  let dif = [], cc = [], att = [];
  outfield.forEach(p => {
    const cat = getPlayerCategory(p.role);
    const fallbackPos = cat === 'POR' ? 'DIF' : (cat === 'ATT' ? 'ATT' : (cat === 'DIF' ? 'DIF' : 'CC'));
    const pos = overrides[p.id] || fallbackPos;
    if (pos === 'DIF') dif.push(p);
    else if (pos === 'ATT') att.push(p);
    else cc.push(p);
  });

  const modulo = `1-${dif.length}-${cc.length}-${att.length}`;
  let desc = `🔥 ${gk.name} in porta: assetto ${modulo}!`;
  return { por: gk, dif, cc, att, modulo, desc };
}

function renderTacticalAndTurns() {
  const tactW = generateDynamicTactics(currentWhiteTeam, currentGkWhiteId, tacticalOverridesWhite);
  const turnsW = document.getElementById('gk-turns-white');
  if (turnsW) {
    turnsW.innerHTML = '';
    currentWhiteTeam.forEach((p, idx) => {
      const isCurrent = p.id === tactW.por?.id;
      turnsW.innerHTML += `
        <button onclick="setKeeper('white', ${p.id})" class="w-full text-left p-1.5 rounded text-[10px] font-bold flex items-center justify-between border transition active:scale-95 ${
          isCurrent ? 'bg-amber-400 text-black border-amber-300 shadow font-black ring-1 ring-white' : 'bg-white/10 text-zinc-300 border-white/5 hover:bg-white/20'
        }">
          <span class="truncate">${idx+1}° ${p.name}</span>
          <span>${isCurrent ? '🧤' : ''}</span>
        </button>
      `;
    });
    document.getElementById('modulo-tag-white').innerText = `MODULO: ${tactW.modulo}`;
    document.getElementById('tactics-desc-white').innerText = tactW.desc;
    renderPitchLines('tactics-white', 'white', tactW, 'active');
  }

  const tactB = generateDynamicTactics(currentBlackTeam, currentGkBlackId, tacticalOverridesBlack);
  const turnsB = document.getElementById('gk-turns-black');
  if (turnsB) {
    turnsB.innerHTML = '';
    currentBlackTeam.forEach((p, idx) => {
      const isCurrent = p.id === tactB.por?.id;
      turnsB.innerHTML += `
        <button onclick="setKeeper('black', ${p.id})" class="w-full text-left p-1.5 rounded text-[10px] font-bold flex items-center justify-between border transition active:scale-95 ${
          isCurrent ? 'bg-amber-400 text-black border-amber-300 shadow font-black ring-1 ring-white' : 'bg-white/10 text-zinc-300 border-white/5 hover:bg-white/20'
        }">
          <span class="truncate">${idx+1}° ${p.name}</span>
          <span>${isCurrent ? '🧤' : ''}</span>
        </button>
      `;
    });
    document.getElementById('modulo-tag-black').innerText = `MODULO: ${tactB.modulo}`;
    document.getElementById('tactics-desc-black').innerText = tactB.desc;
    renderPitchLines('tactics-black', 'black', tactB, 'active');
  }

  refreshIcons();
}

function renderPitchLines(containerId, teamType, tact, context = 'active') {
  const c = document.getElementById(containerId);
  if (!c) return;
  const row = (icon, arr, dotColor, linePos) => {
    const count = arr ? arr.length : 0;
    const names = (arr || []).map(p => `
      <button onclick="openPitchActionModal('${teamType}', ${p.id}, '${linePos}', '${context}')" class="inline-flex items-center gap-1 bg-black/60 hover:bg-amber-400 hover:text-black px-1.5 py-0.5 rounded text-[9px] text-white font-medium border border-white/10 transition active:scale-95 group">
        <span class="w-1.5 h-1.5 rounded-full ${dotColor} group-hover:bg-black"></span>
        <span class="truncate max-w-[65px] font-bold">${p.name.split(' ')[0]}</span>
        <span class="text-[8px] opacity-60 font-mono">(${p.ovr})</span>
      </button>
    `).join(' ');

    return `
      <div class="flex items-center justify-between bg-black/35 px-1.5 py-1 rounded border border-white/5">
        <span class="text-[9px] font-bold text-zinc-300 shrink-0 flex items-center gap-0.5">
          ${icon} <span class="font-mono text-[8px] text-zinc-400">(${count})</span>
        </span>
        <div class="flex flex-wrap gap-1 justify-end">${names || '<span class="text-[9px] text-zinc-600 italic">Nessuno</span>'}</div>
      </div>
    `;
  };

  const gkHtml = tact.por ? `
    <button onclick="openPitchActionModal('${teamType}', ${tact.por.id}, 'POR', '${context}')" class="font-black text-amber-200 hover:underline flex items-center gap-1 text-[10px]">
      <span>${tact.por.name}</span>
      <span class="text-[8px] font-mono opacity-70">(${tact.por.ovr})</span>
    </button>
  ` : '--';

  c.innerHTML = `
    <div class="flex items-center justify-between bg-amber-400/20 px-1.5 py-1 rounded border border-amber-400/30">
      <span class="text-[9px] font-black text-amber-300">🧤 PORTA</span>
      ${gkHtml}
    </div>
    ${row('🛡️ DIF', tact.dif, 'bg-blue-400', 'DIF')}
    ${row('⚙️ CEN', tact.cc, 'bg-emerald-400', 'CC')}
    ${row('⚡ ATT', tact.att, 'bg-red-400', 'ATT')}
  `;
}

function openPitchActionModal(team, playerId, currentLine, context = 'active') {
  let playerList = [];
  let overrides = {};

  if (context === 'saved') {
    const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
    if (!m) return;
    playerList = team === 'white' ? m.whiteTeam : m.blackTeam;
    overrides = team === 'white' ? tempSavedOverridesWhite : tempSavedOverridesBlack;
  } else {
    playerList = team === 'white' ? currentWhiteTeam : currentBlackTeam;
    overrides = team === 'white' ? tacticalOverridesWhite : tacticalOverridesBlack;
  }

  const p = playerList.find(x => x.id === playerId) || players.find(x => x.id === playerId);
  if (!p) return;

  activePitchAction = { team, playerId, context };
  document.getElementById('pitch-action-name').innerText = p.name;
  document.getElementById('pitch-action-ovr').innerText = p.ovr;
  document.getElementById('pitch-action-role').innerText = `Ruolo: ${p.role} • Linea: ${currentLine}`;

  const activePos = overrides[playerId] || currentLine;

  ['DIF', 'CC', 'ATT'].forEach(pos => {
    const btn = document.getElementById(`btn-pos-${pos}`);
    if (pos === activePos) {
      btn.className = "py-2 rounded-lg border font-black text-xs transition active:scale-95 bg-amber-400 text-black border-amber-300 shadow";
    } else {
      btn.className = "py-2 rounded-lg border font-bold text-xs transition active:scale-95 bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15";
    }
  });

  document.getElementById('modal-pitch-action').classList.remove('hidden');
}

function closePitchActionModal() {
  document.getElementById('modal-pitch-action').classList.add('hidden');
}

function movePlayerPosition(newPos) {
  if (!activePitchAction.team || !activePitchAction.playerId) return;

  if (activePitchAction.context === 'saved') {
    if (activePitchAction.team === 'white') tempSavedOverridesWhite[activePitchAction.playerId] = newPos;
    else tempSavedOverridesBlack[activePitchAction.playerId] = newPos;

    closePitchActionModal();
    renderSavedMatchdayPitch();
  } else {
    if (activePitchAction.team === 'white') tacticalOverridesWhite[activePitchAction.playerId] = newPos;
    else tacticalOverridesBlack[activePitchAction.playerId] = newPos;

    if (isAdmin) saveActiveMatchState();

    closePitchActionModal();
    renderTacticalAndTurns();
  }
}

function viewFutFromPitch() {
  const pid = activePitchAction.playerId;
  closePitchActionModal();
  if (pid) openFutCard(pid);
}

function renderTeamsDisplay() {
  const hasTeams = currentWhiteTeam.length > 0 && currentBlackTeam.length > 0;
  const noTeamsNotice = document.getElementById('public-no-teams');
  const teamsContainer = document.getElementById('teams-container');

  if (!hasTeams) {
    teamsContainer?.classList.add('hidden');
    noTeamsNotice?.classList.remove('hidden');
    return;
  }

  noTeamsNotice?.classList.add('hidden');
  teamsContainer?.classList.remove('hidden');

  const listW = document.getElementById('list-bianca');
  const listB = document.getElementById('list-nera');
  listW.innerHTML = '';
  listB.innerHTML = '';

  currentWhiteTeam.forEach(p => {
    const isSelected = swapSelection && swapSelection.team === 'white' && swapSelection.id === p.id;
    listW.innerHTML += `
      <li ${isAdmin ? `onclick="handleSwapClick('white', ${p.id})"` : ''} class="flex justify-between items-center p-1.5 rounded-lg border border-zinc-200 ${isAdmin ? 'cursor-pointer' : ''} active:scale-95 transition ${isSelected ? 'selected-swap bg-amber-100' : 'bg-white hover:bg-zinc-50'}">
        <span class="font-bold truncate">${p.name} <b class="text-[9px] font-mono text-zinc-500">(${p.role})</b></span>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="font-mono font-black text-xs">${p.ovr}</span>
          ${isAdmin ? `
            <button onclick="transferPlayer('white', ${p.id}, event)" title="Sposta nei Neri" class="text-zinc-400 hover:text-black p-0.5">
              <i data-lucide="arrow-right-left" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>
      </li>`;
  });

  currentBlackTeam.forEach(p => {
    const isSelected = swapSelection && swapSelection.team === 'black' && swapSelection.id === p.id;
    listB.innerHTML += `
      <li ${isAdmin ? `onclick="handleSwapClick('black', ${p.id})"` : ''} class="flex justify-between items-center p-1.5 rounded-lg border border-white/10 ${isAdmin ? 'cursor-pointer' : ''} active:scale-95 transition ${isSelected ? 'selected-swap bg-zinc-800' : 'bg-zinc-900 hover:bg-zinc-800'}">
        <span class="font-bold text-white truncate">${p.name} <b class="text-[9px] font-mono text-zinc-400">(${p.role})</b></span>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="font-mono font-black text-amber-400 text-xs">${p.ovr}</span>
          ${isAdmin ? `
            <button onclick="transferPlayer('black', ${p.id}, event)" title="Sposta nei Bianchi" class="text-zinc-500 hover:text-white p-0.5">
              <i data-lucide="arrow-right-left" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>
      </li>`;
  });

  const avgW = currentWhiteTeam.length ? Math.round(currentWhiteTeam.reduce((acc, x) => acc + x.ovr, 0) / currentWhiteTeam.length) : 0;
  const avgB = currentBlackTeam.length ? Math.round(currentBlackTeam.reduce((acc, x) => acc + x.ovr, 0) / currentBlackTeam.length) : 0;

  document.getElementById('ovr-bianca').innerText = `OVR: ${avgW}`;
  document.getElementById('ovr-nera').innerText = `OVR: ${avgB}`;
  document.getElementById('count-bianca').innerText = currentWhiteTeam.length;
  document.getElementById('count-nera').innerText = currentBlackTeam.length;

  renderTacticalAndTurns();
}

// ==================== RESET COMPLETO & SALVATAGGIO MATCHDAY ====================
function saveMatchdayToArchive() {
  if (!isAdmin) return;
  if (currentWhiteTeam.length === 0 || currentBlackTeam.length === 0) return;

  const rawDate = document.getElementById('match-date-input').value;
  const dateText = formatIsoDateToItalian(rawDate) || rawDate;
  const timeText = document.getElementById('match-time-input').value;
  const placeText = document.getElementById('match-place-input').value;

  if (activeMatchdayId) {
    const idx = savedMatchdays.findIndex(x => x.id === activeMatchdayId);
    if (idx !== -1) {
      savedMatchdays[idx] = {
        ...savedMatchdays[idx],
        rawDate: rawDate,
        date: dateText,
        time: timeText,
        place: placeText,
        whiteTeam: [...currentWhiteTeam],
        blackTeam: [...currentBlackTeam],
        gkWhiteId: currentGkWhiteId,
        gkBlackId: currentGkBlackId,
        overridesWhite: { ...tacticalOverridesWhite },
        overridesBlack: { ...tacticalOverridesBlack }
      };
    }
    activeMatchdayId = null;
  } else {
    const record = {
      id: Date.now(),
      rawDate: rawDate,
      date: dateText,
      time: timeText,
      place: placeText,
      status: 'concluso',
      scoreWhite: 0,
      scoreBlack: 0,
      goalsListWhite: [],
      goalsListBlack: [],
      processedStats: false,
      appliedStats: null,
      whiteTeam: [...currentWhiteTeam],
      blackTeam: [...currentBlackTeam],
      gkWhiteId: currentGkWhiteId,
      gkBlackId: currentGkBlackId,
      overridesWhite: { ...tacticalOverridesWhite },
      overridesBlack: { ...tacticalOverridesBlack }
    };
    savedMatchdays.unshift(record);
  }

  localStorage.setItem('mangos_v21_matchdays', JSON.stringify(savedMatchdays));

  cancelActiveMatchdayEdit();
  players = players.map(p => ({ ...p, present: false }));
  saveState();

  currentWhiteTeam = [];
  currentBlackTeam = [];
  currentGkWhiteId = null;
  currentGkBlackId = null;
  tacticalOverridesWhite = {};
  tacticalOverridesBlack = {};

  document.getElementById('match-date-input').value = '';
  document.getElementById('match-time-input').value = '';

  localStorage.removeItem('mangos_active_match');
  syncPublicMatchInfo();

  document.getElementById('teams-container').classList.add('hidden');
  document.getElementById('public-no-teams').classList.remove('hidden');
  document.getElementById('search-input').value = '';
  searchQuery = '';

  renderPlayers();
  renderTeamsDisplay();
  renderArchiveList();

  switchTab('recenti');
}

function cancelActiveMatchdayEdit() {
  activeMatchdayId = null;
  document.getElementById('active-matchday-banner').classList.add('hidden');
  document.getElementById('btn-save-matchday').innerHTML = '<i data-lucide="save" class="w-4 h-4 text-amber-400"></i> Salva Matchday';
  refreshIcons();
}

// ==================== CALCOLO AUTOMATICO STATISTICHE MATCHDAY ====================
function applyMatchdayStats(m) {
  if (!m) return;

  // 1. Revert delle statistiche precedenti se già applicate
  if (m.processedStats && m.appliedStats) {
    Object.keys(m.appliedStats).forEach(pidStr => {
      const pid = Number(pidStr);
      const p = players.find(x => x.id === pid);
      if (p) {
        const old = m.appliedStats[pidStr];
        p.matches = Math.max(0, (p.matches || 0) - (old.pg || 0));
        p.wins = Math.max(0, (p.wins || 0) - (old.v || 0));
        p.losses = Math.max(0, (p.losses || 0) - (old.s || 0));
        p.goals = Math.max(0, (p.goals || 0) - (old.goals || 0));
        p.assists = Math.max(0, (p.assists || 0) - (old.assists || 0));
      }
    });
    m.appliedStats = null;
    m.processedStats = false;
  }

  if (m.status !== 'concluso') {
    saveState();
    renderLeaderboard();
    return;
  }

  // 2. Calcolo nuove statistiche
  const applied = {};
  const scoreW = Number(m.scoreWhite || 0);
  const scoreB = Number(m.scoreBlack || 0);

  const isWhiteWin = scoreW > scoreB;
  const isBlackWin = scoreB > scoreW;

  (m.whiteTeam || []).forEach(p => {
    applied[p.id] = {
      pg: 1,
      v: isWhiteWin ? 1 : 0,
      s: isBlackWin ? 1 : 0,
      goals: 0,
      assists: 0
    };
  });

  (m.blackTeam || []).forEach(p => {
    applied[p.id] = {
      pg: 1,
      v: isBlackWin ? 1 : 0,
      s: isWhiteWin ? 1 : 0,
      goals: 0,
      assists: 0
    };
  });

  (m.goalsListWhite || []).forEach(g => {
    if (!g.isOwnGoal) {
      const scPlayer = players.find(x => x.name === g.scorer);
      if (scPlayer) {
        if (!applied[scPlayer.id]) applied[scPlayer.id] = { pg: 0, v: 0, s: 0, goals: 0, assists: 0 };
        applied[scPlayer.id].goals = (applied[scPlayer.id].goals || 0) + 1;
      }
      if (g.assist && g.assist !== 'Nessuno') {
        const asPlayer = players.find(x => x.name === g.assist);
        if (asPlayer) {
          if (!applied[asPlayer.id]) applied[asPlayer.id] = { pg: 0, v: 0, s: 0, goals: 0, assists: 0 };
          applied[asPlayer.id].assists = (applied[asPlayer.id].assists || 0) + 1;
        }
      }
    }
  });

  (m.goalsListBlack || []).forEach(g => {
    if (!g.isOwnGoal) {
      const scPlayer = players.find(x => x.name === g.scorer);
      if (scPlayer) {
        if (!applied[scPlayer.id]) applied[scPlayer.id] = { pg: 0, v: 0, s: 0, goals: 0, assists: 0 };
        applied[scPlayer.id].goals = (applied[scPlayer.id].goals || 0) + 1;
      }
      if (g.assist && g.assist !== 'Nessuno') {
        const asPlayer = players.find(x => x.name === g.assist);
        if (asPlayer) {
          if (!applied[asPlayer.id]) applied[asPlayer.id] = { pg: 0, v: 0, s: 0, goals: 0, assists: 0 };
          applied[asPlayer.id].assists = (applied[asPlayer.id].assists || 0) + 1;
        }
      }
    }
  });

  // 3. Applicazione permanente
  Object.keys(applied).forEach(pidStr => {
    const pid = Number(pidStr);
    const p = players.find(x => x.id === pid);
    if (p) {
      const delta = applied[pidStr];
      p.matches = (p.matches || 0) + (delta.pg || 0);
      p.wins = (p.wins || 0) + (delta.v || 0);
      p.losses = (p.losses || 0) + (delta.s || 0);
      p.goals = (p.goals || 0) + (delta.goals || 0);
      p.assists = (p.assists || 0) + (delta.assists || 0);
    }
  });

  m.appliedStats = applied;
  m.processedStats = true;

  saveState();
  renderLeaderboard();
}

// ==================== TAB 1: RECENTI (ARCHIVIO & SCHEDA DETTAGLIATA) ====================
function renderArchiveList() {
  const container = document.getElementById('archive-list');
  if (!container) return;
  container.innerHTML = '';

  let winsW = 0, winsB = 0, draws = 0;
  savedMatchdays.forEach(m => {
    if (m.status === 'concluso' && m.scoreWhite !== null && m.scoreWhite !== undefined && m.scoreBlack !== null && m.scoreBlack !== undefined) {
      const sw = Number(m.scoreWhite);
      const sb = Number(m.scoreBlack);
      if (sw > sb) winsW++;
      else if (sb > sw) winsB++;
      else draws++;
    }
  });

  document.getElementById('stat-wins-white').innerText = winsW;
  document.getElementById('stat-wins-black').innerText = winsB;
  document.getElementById('stat-draws').innerText = draws;

  if (savedMatchdays.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-zinc-500 text-xs italic">
        Nessun Matchday salvato in archivio.
      </div>`;
    return;
  }

  savedMatchdays.forEach(m => {
    const whiteCount = m.whiteTeam ? m.whiteTeam.length : 0;
    const blackCount = m.blackTeam ? m.blackTeam.length : 0;
    const isConcluso = m.status === 'concluso';
    const hasScore = isConcluso && m.scoreWhite !== null && m.scoreWhite !== undefined;

    container.innerHTML += `
      <div onclick="openMatchdayDetail(${m.id})" class="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl p-3.5 md:p-4 space-y-2.5 transition cursor-pointer select-none active:scale-[0.99] shadow">
        <div class="flex justify-between items-start">
          <div>
            <span class="font-black text-xs md:text-sm text-amber-400 block">${m.date} - ${m.time}</span>
            <span class="text-[10px] md:text-xs text-zinc-400">📍 ${m.place}</span>
          </div>
          <span class="text-[9px] md:text-[10px] ${isConcluso ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'} border font-bold px-2 py-0.5 rounded-full uppercase">
            ${isConcluso ? 'Concluso' : 'Programmata'}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[11px] md:text-xs bg-black/40 p-2 md:p-2.5 rounded-xl border border-white/5">
          <div>
            <b class="text-white block mb-0.5">⚪ Bianchi:</b>
            <span class="text-zinc-400 text-[10px] md:text-[11px] truncate block">${m.whiteTeam ? m.whiteTeam.map(p=>p.name).join(', ') : '--'}</span>
          </div>
          <div>
            <b class="text-amber-400 block mb-0.5">⚫ Neri:</b>
            <span class="text-zinc-400 text-[10px] md:text-[11px] truncate block">${m.blackTeam ? m.blackTeam.map(p=>p.name).join(', ') : '--'}</span>
          </div>
        </div>

        <!-- RISULTATO FINALE IN EVIDENZA -->
        ${hasScore ? `
          <div class="bg-black/60 border border-emerald-500/30 rounded-xl py-2 px-3 flex items-center justify-center gap-3 shadow-inner my-1">
            <span class="text-xs md:text-sm font-black text-white">⚪ Bianchi <span class="text-emerald-400 font-mono text-base md:text-lg font-black ml-1">${m.scoreWhite}</span></span>
            <span class="text-zinc-500 font-black text-xs">-</span>
            <span class="text-xs md:text-sm font-black text-amber-400"><span class="text-emerald-400 font-mono text-base md:text-lg font-black mr-1">${m.scoreBlack}</span> Neri ⚫</span>
          </div>
        ` : `
          <div class="bg-white/5 border border-dashed border-white/10 rounded-xl py-1 px-3 text-center text-[10px] text-zinc-500 italic my-1">
            Partita programmata • In attesa di risultato
          </div>
        `}

        <div class="flex justify-between items-center pt-1 text-[10px] text-zinc-500 border-t border-white/5">
          <span class="text-amber-300 font-bold">Tocca per campo e tabellino</span>
          ${isAdmin ? `
            <div class="flex items-center gap-2.5" onclick="event.stopPropagation()">
              <button onclick="openEditMatchdayModalDirect(${m.id})" class="text-amber-400 hover:text-amber-300 font-bold hover:underline flex items-center gap-1">
                ✏️ Modifica / Dati
              </button>
              <button onclick="adminDeleteMatchdayDirect(${m.id})" class="text-red-400 hover:underline flex items-center gap-1">
                Elimina 🗑️
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });
  refreshIcons();
}

function switchMatchdayDetailTab(tabKey) {
  ['tactics', 'turns', 'score'].forEach(k => {
    const btn = document.getElementById(`btn-md-tab-${k}`);
    const sec = document.getElementById(`md-sec-${k}`);
    if (k === tabKey) {
      btn.className = "py-2 px-3 border-b-2 border-amber-400 text-amber-400 transition font-bold";
      sec.classList.remove('hidden');
    } else {
      btn.className = "py-2 px-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition";
      sec.classList.add('hidden');
    }
  });
}

function openMatchdayDetail(id) {
  const m = savedMatchdays.find(x => x.id === id);
  if (!m) return;

  selectedMatchdayDetailId = id;

  tempSavedOverridesWhite = { ...(m.overridesWhite || {}) };
  tempSavedOverridesBlack = { ...(m.overridesBlack || {}) };
  tempSavedGkWhiteId = m.gkWhiteId;
  tempSavedGkBlackId = m.gkBlackId;

  document.getElementById('modal-match-date').innerText = `${m.date} - ${m.time}`;
  document.getElementById('modal-match-place').innerText = `Campo: ${m.place}`;

  const statusBadge = document.getElementById('modal-match-status-badge');
  const scoreBadge = document.getElementById('modal-match-score-badge');
  const pendingBanner = document.getElementById('modal-match-pending-banner');
  const tabsContainer = document.getElementById('modal-match-tabs-container');
  const contentArea = document.getElementById('modal-match-content-area');
  const btnTabScore = document.getElementById('btn-md-tab-score');

  const isProgrammata = m.status === 'programmata';
  const hasRoster = m.whiteTeam && m.whiteTeam.length > 0 && m.blackTeam && m.blackTeam.length > 0;

  if (isProgrammata) {
    statusBadge.innerText = 'PROSSIMO DERBY / PROGRAMMATA';
    statusBadge.className = 'text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black border border-amber-500/40';
    scoreBadge.classList.add('hidden');
    btnTabScore.classList.add('hidden');

    if (!hasRoster) {
      pendingBanner.classList.remove('hidden');
      tabsContainer.classList.add('hidden');
      contentArea.classList.add('hidden');
    } else {
      pendingBanner.classList.add('hidden');
      tabsContainer.classList.remove('hidden');
      contentArea.classList.remove('hidden');
      switchMatchdayDetailTab('tactics');
    }
  } else {
    statusBadge.innerText = 'CONCLUSA';
    statusBadge.className = 'text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black border border-emerald-500/40';
    scoreBadge.innerText = `⚽ Risultato: Bianchi ${m.scoreWhite || 0} - ${m.scoreBlack || 0} Neri`;
    scoreBadge.classList.remove('hidden');
    btnTabScore.classList.remove('hidden');
    pendingBanner.classList.add('hidden');
    tabsContainer.classList.remove('hidden');
    contentArea.classList.remove('hidden');
    switchMatchdayDetailTab('tactics');
  }

  renderSavedMatchdayPitch();
  renderSavedTabellino(m);

  const adminActions = document.getElementById('modal-match-admin-actions');
  const adminLoadPitch = document.getElementById('admin-load-pitch-action');
  if (isAdmin) {
    adminActions.classList.remove('hidden');
    adminLoadPitch.classList.remove('hidden');
  } else {
    adminActions.classList.add('hidden');
    adminLoadPitch.classList.add('hidden');
  }

  document.getElementById('modal-matchday-detail').classList.remove('hidden');
  refreshIcons();
}

function renderSavedTabellino(m) {
  document.getElementById('modal-tabellino-score-header').innerText = `⚪ Bianchi ${m.scoreWhite || 0} - ${m.scoreBlack || 0} Neri ⚫`;

  const containerW = document.getElementById('modal-tabellino-goals-w');
  const containerB = document.getElementById('modal-tabellino-goals-b');
  containerW.innerHTML = '';
  containerB.innerHTML = '';

  const goalsW = m.goalsListWhite || [];
  const goalsB = m.goalsListBlack || [];

  if (goalsW.length === 0) {
    containerW.innerHTML = '<span class="text-zinc-500 italic text-[10px]">Nessun gol registrato per i Bianchi.</span>';
  } else {
    goalsW.forEach(g => {
      containerW.innerHTML += `
        <div class="flex items-center gap-1.5 py-0.5 border-b border-white/5">
          <span>⚽</span>
          <b class="text-white">${g.scorer}</b>
          ${g.isOwnGoal ? '<span class="text-red-400 font-black text-[9px] uppercase">(AG - Autogol)</span>' : (g.assist && g.assist !== 'Nessuno' ? `<span class="text-zinc-400 text-[10px]">(🅰️ ${g.assist})</span>` : '')}
        </div>
      `;
    });
  }

  if (goalsB.length === 0) {
    containerB.innerHTML = '<span class="text-zinc-500 italic text-[10px]">Nessun gol registrato per i Neri.</span>';
  } else {
    goalsB.forEach(g => {
      containerB.innerHTML += `
        <div class="flex items-center gap-1.5 py-0.5 border-b border-white/5">
          <span>⚽</span>
          <b class="text-amber-400">${g.scorer}</b>
          ${g.isOwnGoal ? '<span class="text-red-400 font-black text-[9px] uppercase">(AG - Autogol)</span>' : (g.assist && g.assist !== 'Nessuno' ? `<span class="text-zinc-400 text-[10px]">(🅰️ ${g.assist})</span>` : '')}
        </div>
      `;
    });
  }
}

function renderSavedMatchdayPitch() {
  const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
  if (!m || !m.whiteTeam || !m.blackTeam) return;

  const tactW = generateDynamicTactics(m.whiteTeam, tempSavedGkWhiteId, tempSavedOverridesWhite);
  const tactB = generateDynamicTactics(m.blackTeam, tempSavedGkBlackId, tempSavedOverridesBlack);

  document.getElementById('modal-match-modulo-w').innerText = `MODULO: ${tactW.modulo}`;
  document.getElementById('modal-match-modulo-b').innerText = `MODULO: ${tactB.modulo}`;
  document.getElementById('modal-match-active-gk-w').innerText = tactW.por ? tactW.por.name : '--';
  document.getElementById('modal-match-active-gk-b').innerText = tactB.por ? tactB.por.name : '--';

  renderPitchLines('modal-pitch-lines-w', 'white', tactW, 'saved');
  renderPitchLines('modal-pitch-lines-b', 'black', tactB, 'saved');

  const turnsContainerW = document.getElementById('modal-match-turns-buttons-w');
  const turnsContainerB = document.getElementById('modal-match-turns-buttons-b');
  turnsContainerW.innerHTML = '';
  turnsContainerB.innerHTML = '';

  m.whiteTeam.forEach((p, idx) => {
    const isCurrent = p.id === tactW.por?.id;
    turnsContainerW.innerHTML += `
      <button onclick="setSavedMatchdayKeeper('white', ${p.id})" class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition active:scale-95 ${
        isCurrent ? 'bg-amber-400 text-black border-amber-300 font-black' : 'bg-white/10 text-zinc-300 border-white/10 hover:bg-white/20'
      }">
        ${idx+1}° ${p.name.split(' ')[0]} ${isCurrent ? '🧤' : ''}
      </button>
    `;
  });

  m.blackTeam.forEach((p, idx) => {
    const isCurrent = p.id === tactB.por?.id;
    turnsContainerB.innerHTML += `
      <button onclick="setSavedMatchdayKeeper('black', ${p.id})" class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition active:scale-95 ${
        isCurrent ? 'bg-amber-400 text-black border-amber-300 font-black' : 'bg-black/50 text-zinc-300 border-white/10 hover:bg-white/20'
      }">
        ${idx+1}° ${p.name.split(' ')[0]} ${isCurrent ? '🧤' : ''}
      </button>
    `;
  });
  refreshIcons();
}

function rotateSavedMatchdayKeeper(team) {
  const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
  if (!m) return;

  if (team === 'white') {
    if (!m.whiteTeam || m.whiteTeam.length === 0) return;
    const currIdx = m.whiteTeam.findIndex(p => p.id === tempSavedGkWhiteId);
    const nextIdx = (currIdx + 1) % m.whiteTeam.length;
    tempSavedGkWhiteId = m.whiteTeam[nextIdx].id;
  } else {
    if (!m.blackTeam || m.blackTeam.length === 0) return;
    const currIdx = m.blackTeam.findIndex(p => p.id === tempSavedGkBlackId);
    const nextIdx = (currIdx + 1) % m.blackTeam.length;
    tempSavedGkBlackId = m.blackTeam[nextIdx].id;
  }
  renderSavedMatchdayPitch();
}

function setSavedMatchdayKeeper(team, playerId) {
  if (team === 'white') tempSavedGkWhiteId = playerId;
  else tempSavedGkBlackId = playerId;
  renderSavedMatchdayPitch();
}

function loadSavedMatchdayIntoActivePitch() {
  if (!isAdmin) return;
  const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
  if (!m) return;

  activeMatchdayId = m.id;

  document.getElementById('match-date-input').value = m.rawDate || '';
  document.getElementById('match-time-input').value = m.time || '';
  document.getElementById('match-place-input').value = m.place || 'Calcetto Mangos Arena';

  currentWhiteTeam = [...(m.whiteTeam || [])];
  currentBlackTeam = [...(m.blackTeam || [])];
  currentGkWhiteId = m.gkWhiteId;
  currentGkBlackId = m.gkBlackId;
  tacticalOverridesWhite = { ...(m.overridesWhite || {}) };
  tacticalOverridesBlack = { ...(m.overridesBlack || {}) };

  const presentIds = [...currentWhiteTeam, ...currentBlackTeam].map(p => p.id);
  players = players.map(p => ({ ...p, present: presentIds.includes(p.id) }));
  saveState();

  document.getElementById('active-matchday-banner').classList.remove('hidden');
  document.getElementById('btn-save-matchday').innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 text-amber-400"></i> Aggiorna Matchday';
  refreshIcons();

  closeModals();
  syncPublicMatchInfo();
  document.getElementById('teams-container').classList.remove('hidden');
  renderPlayers();
  renderTeamsDisplay();
  switchTab('match');
}

function openEditMatchdayModalDirect(id) {
  selectedMatchdayDetailId = id;
  openEditMatchdayModal();
}

function openEditMatchdayModal() {
  if (!isAdmin || !selectedMatchdayDetailId) return;
  const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
  if (!m) return;

  tempGoalsListWhite = JSON.parse(JSON.stringify(m.goalsListWhite || []));
  tempGoalsListBlack = JSON.parse(JSON.stringify(m.goalsListBlack || []));

  const todayIso = new Date().toISOString().split('T')[0];
  document.getElementById('edit-match-status-select').value = m.status || 'concluso';
  document.getElementById('edit-match-date-input').value = m.rawDate || todayIso;
  document.getElementById('edit-match-time-input').value = m.time || '21:00';

  populateGoalSelects(m);
  renderTempGoalsList();

  document.getElementById('modal-edit-matchday').classList.remove('hidden');
}

function populateGoalSelects(m) {
  const fill = (selectId, teamPlayers, includeOpponent = false) => {
    const el = document.getElementById(selectId);
    if (!el) return;
    el.innerHTML = '';
    if (selectId.includes('assist')) {
      el.innerHTML += `<option value="Nessuno">Nessun Assist</option>`;
    }
    (teamPlayers || []).forEach(p => {
      el.innerHTML += `<option value="${p.name}">${p.name}</option>`;
    });
    if (includeOpponent) {
      const opponents = selectId.includes('-w') ? m.blackTeam : m.whiteTeam;
      (opponents || []).forEach(p => {
        el.innerHTML += `<option value="${p.name}">${p.name} (Avversario)</option>`;
      });
    }
  };

  fill('add-goal-scorer-w', m.whiteTeam, true);
  fill('add-goal-assist-w', m.whiteTeam);
  fill('add-goal-scorer-b', m.blackTeam, true);
  fill('add-goal-assist-b', m.blackTeam);
}

function renderTempGoalsList() {
  const containerW = document.getElementById('edit-goals-list-w');
  const containerB = document.getElementById('edit-goals-list-b');

  document.getElementById('edit-count-goals-w').innerText = tempGoalsListWhite.length;
  document.getElementById('edit-count-goals-b').innerText = tempGoalsListBlack.length;

  containerW.innerHTML = '';
  containerB.innerHTML = '';

  if (tempGoalsListWhite.length === 0) {
    containerW.innerHTML = `<span class="text-[10px] text-zinc-500 italic">Nessun gol registrato per i Bianchi.</span>`;
  } else {
    tempGoalsListWhite.forEach((g, idx) => {
      containerW.innerHTML += `
        <div class="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-white/5 text-[11px]">
          <div>
            <span>⚽</span>
            <b class="text-white">${g.scorer}</b>
            ${g.isOwnGoal ? '<span class="text-red-400 font-bold text-[9px]">(AG - Autogol)</span>' : (g.assist !== 'Nessuno' ? `<span class="text-zinc-400 text-[10px]">(🅰️ ${g.assist})</span>` : '')}
          </div>
          <button onclick="removeTempGoal('white', ${idx})" class="text-red-400 hover:text-red-300 font-black">✕</button>
        </div>
      `;
    });
  }

  if (tempGoalsListBlack.length === 0) {
    containerB.innerHTML = `<span class="text-[10px] text-zinc-500 italic">Nessun gol registrato per i Neri.</span>`;
  } else {
    tempGoalsListBlack.forEach((g, idx) => {
      containerB.innerHTML += `
        <div class="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-white/5 text-[11px]">
          <div>
            <span>⚽</span>
            <b class="text-amber-400">${g.scorer}</b>
            ${g.isOwnGoal ? '<span class="text-red-400 font-bold text-[9px]">(AG - Autogol)</span>' : (g.assist !== 'Nessuno' ? `<span class="text-zinc-400 text-[10px]">(🅰️ ${g.assist})</span>` : '')}
          </div>
          <button onclick="removeTempGoal('black', ${idx})" class="text-red-400 hover:text-red-300 font-black">✕</button>
        </div>
      `;
    });
  }
}

function addGoalToMatch(team) {
  if (team === 'white') {
    const scorer = document.getElementById('add-goal-scorer-w').value;
    const assist = document.getElementById('add-goal-assist-w').value;
    const isOwnGoal = document.getElementById('add-goal-owngoal-w').checked;
    tempGoalsListWhite.push({ id: Date.now() + Math.random(), scorer, assist, isOwnGoal });
    document.getElementById('add-goal-owngoal-w').checked = false;
  } else {
    const scorer = document.getElementById('add-goal-scorer-b').value;
    const assist = document.getElementById('add-goal-assist-b').value;
    const isOwnGoal = document.getElementById('add-goal-owngoal-b').checked;
    tempGoalsListBlack.push({ id: Date.now() + Math.random(), scorer, assist, isOwnGoal });
    document.getElementById('add-goal-owngoal-b').checked = false;
  }
  renderTempGoalsList();
}

function removeTempGoal(team, idx) {
  if (team === 'white') tempGoalsListWhite.splice(idx, 1);
  else tempGoalsListBlack.splice(idx, 1);
  renderTempGoalsList();
}

function closeEditMatchdayModal() {
  document.getElementById('modal-edit-matchday').classList.add('hidden');
}

function saveEditMatchday() {
  if (!isAdmin || !selectedMatchdayDetailId) return;
  const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
  if (!m) return;

  const rawDate = document.getElementById('edit-match-date-input').value;
  const timeVal = document.getElementById('edit-match-time-input').value;
  const statusVal = document.getElementById('edit-match-status-select').value;

  if (rawDate) {
    m.rawDate = rawDate;
    m.date = formatIsoDateToItalian(rawDate);
  }
  if (timeVal) m.time = timeVal;

  m.status = statusVal;
  m.goalsListWhite = [...tempGoalsListWhite];
  m.goalsListBlack = [...tempGoalsListBlack];
  m.scoreWhite = tempGoalsListWhite.length;
  m.scoreBlack = tempGoalsListBlack.length;

  applyMatchdayStats(m);

  localStorage.setItem('mangos_v21_matchdays', JSON.stringify(savedMatchdays));
  closeEditMatchdayModal();
  openMatchdayDetail(selectedMatchdayDetailId);
  renderArchiveList();
}

function adminDeleteCurrentMatchday() {
  if (!isAdmin || !selectedMatchdayDetailId) return;
  const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
  if (!m) return;

  if (m.processedStats && m.appliedStats) {
    m.status = 'programmata';
    applyMatchdayStats(m);
  }

  savedMatchdays = savedMatchdays.filter(x => x.id !== selectedMatchdayDetailId);
  localStorage.setItem('mangos_v21_matchdays', JSON.stringify(savedMatchdays));
  closeModals();
  renderArchiveList();
}

function adminDeleteMatchdayDirect(id) {
  if (!isAdmin) return;
  const m = savedMatchdays.find(x => x.id === id);
  if (m && m.processedStats && m.appliedStats) {
    m.status = 'programmata';
    applyMatchdayStats(m);
  }

  savedMatchdays = savedMatchdays.filter(x => x.id !== id);
  localStorage.setItem('mangos_v21_matchdays', JSON.stringify(savedMatchdays));
  renderArchiveList();
}

// ==================== TAB 3: STATISTICHE (CON PG, V, S, ASSIST E RE DEGLI ASSIST) ====================
function setStatsRoleFilter(cat) {
  statsRoleFilter = cat;
  ['ALL', 'POR', 'DIF', 'CEN', 'ATT'].forEach(c => {
    const btn = document.getElementById(`role-filter-${c}`);
    if (c === cat) {
      btn.className = "px-2.5 py-1 rounded-lg bg-amber-500 text-black border border-amber-400 shadow transition font-bold shrink-0";
    } else {
      btn.className = "px-2.5 py-1 rounded-lg bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 transition shrink-0";
    }
  });
  renderLeaderboard();
}

function sortTable(col) {
  if (currentSort.col === col) {
    currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.col = col;
    currentSort.dir = (col === 'name' || col === 'role') ? 'asc' : 'desc';
  }
  renderLeaderboard();
}

function changeStat(playerId, stat, delta) {
  if (!isAdmin) return;
  players = players.map(p => {
    if (p.id === playerId) {
      const val = Math.max(0, (p[stat] || 0) + delta);
      return { ...p, [stat]: val };
    }
    return p;
  });
  renderLeaderboard();
}

function saveAllStats() {
  if (!isAdmin) return;
  saveState();
  const btn = document.getElementById('btn-save-stats');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Salvato!`;
  btn.classList.remove('bg-emerald-500');
  btn.classList.add('bg-white', 'text-black');
  refreshIcons();

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.classList.remove('bg-white', 'text-black');
    btn.classList.add('bg-emerald-500');
    refreshIcons();
  }, 1500);
}

function exportBackupJson() {
  if (!isAdmin) return;
  const data = {
    version: 'mangos_v21',
    exportDate: new Date().toISOString(),
    players: players,
    savedMatchdays: savedMatchdays,
    activeMatch: JSON.parse(localStorage.getItem('mangos_active_match')) || null
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mangos_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleImportBackup(event) {
  if (!isAdmin) return;
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && (imported.players || Array.isArray(imported))) {
        const newPlayers = imported.players || imported;
        players = newPlayers.map(p => ({
          ...p,
          matches: p.matches ?? p.pg ?? 0,
          wins: p.wins ?? p.v ?? 0,
          losses: p.losses ?? p.s ?? 0,
          goals: p.goals ?? 0,
          assists: p.assists ?? 0
        }));
        if (imported.savedMatchdays) savedMatchdays = imported.savedMatchdays;
        if (imported.activeMatch) {
          localStorage.setItem('mangos_active_match', JSON.stringify(imported.activeMatch));
          activeMatchSavedState = imported.activeMatch;
        }

        saveState();
        localStorage.setItem('mangos_v21_matchdays', JSON.stringify(savedMatchdays));
        renderPlayers();
        renderLeaderboard();
        renderArchiveList();
        alert("Backup ripristinato con successo! 🥭");
      } else {
        alert("File di backup non valido.");
      }
    } catch (err) {
      alert("Errore durante la lettura del file JSON.");
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  statsSearchQuery = (document.getElementById('stats-search-input')?.value || '').toLowerCase().trim();

  ['name', 'role', 'ovr', 'matches', 'wins', 'losses', 'goals', 'assists'].forEach(c => {
    const icon = document.getElementById(`sort-icon-${c}`);
    if (icon) {
      if (currentSort.col === c) {
        icon.innerText = currentSort.dir === 'asc' ? '▲' : '▼';
        icon.className = 'text-amber-400 font-bold ml-0.5';
      } else {
        icon.innerText = '';
      }
    }
  });

  const maxGoals = Math.max(...players.map(p => p.goals || 0));
  const maxAssists = Math.max(...players.map(p => p.assists || 0));

  const filtered = players.filter(p => {
    const matchesName = p.name.toLowerCase().includes(statsSearchQuery);
    if (!matchesName) return false;
    if (statsRoleFilter === 'ALL') return true;
    const cat = getPlayerCategory(p.role);
    return cat === statsRoleFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[currentSort.col] ?? 0;
    let valB = b[currentSort.col] ?? 0;
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return currentSort.dir === 'asc' ? -1 : 1;
    if (valA > valB) return currentSort.dir === 'asc' ? 1 : -1;
    return (b.ovr || 0) - (a.ovr || 0);
  });

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isAdmin ? 10 : 9}" class="p-4 text-center text-zinc-500 italic">Nessun giocatore corrisponde ai filtri.</td></tr>`;
    return;
  }

  sorted.forEach((p, i) => {
    const isCapocannoniere = p.goals > 0 && p.goals === maxGoals;
    const isAssistKing = p.assists > 0 && p.assists === maxAssists;

    const golContent = isAdmin ? `
      <div class="inline-flex items-center gap-1.5" onclick="event.stopPropagation()">
        <button onclick="changeStat(${p.id}, 'goals', -1)" class="w-5 h-5 bg-white/10 hover:bg-white/20 rounded font-black text-xs text-white">-</button>
        <span class="font-black text-white w-4 text-center">${p.goals}</span>
        <button onclick="changeStat(${p.id}, 'goals', 1)" class="w-5 h-5 bg-amber-500 hover:bg-amber-400 rounded font-black text-xs text-black">+</button>
      </div>
    ` : `<span class="font-black text-white">${p.goals}</span>`;

    const astContent = isAdmin ? `
      <div class="inline-flex items-center gap-1.5" onclick="event.stopPropagation()">
        <button onclick="changeStat(${p.id}, 'assists', -1)" class="w-5 h-5 bg-white/10 hover:bg-white/20 rounded font-black text-xs text-white">-</button>
        <span class="font-mono text-zinc-300 w-4 text-center">${p.assists || 0}</span>
        <button onclick="changeStat(${p.id}, 'assists', 1)" class="w-5 h-5 bg-amber-500 hover:bg-amber-400 rounded font-black text-xs text-black">+</button>
      </div>
    ` : `<span class="font-mono text-zinc-300">${p.assists || 0}</span>`;

    const actionContent = isAdmin ? `
      <td class="text-center py-2.5 md:py-3" onclick="event.stopPropagation()">
        <button onclick="openEditPlayerModal(${p.id})" class="text-zinc-400 hover:text-amber-300 p-1 font-bold text-xs" title="Modifica Giocatore">
          <i data-lucide="edit" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    ` : '';

    tbody.innerHTML += `
      <tr onclick="openFutCard(${p.id})" class="hover:bg-white/10 transition cursor-pointer active:bg-amber-500/20 select-none">
        <td class="p-2.5 md:p-3 font-mono text-zinc-500">${i+1}</td>
        <td class="py-2.5 md:py-3 font-bold text-white flex items-center gap-1.5 truncate">
          <span>${p.name}</span>
          ${isCapocannoniere ? '<span title="Capocannoniere" class="text-xs">👟🥇</span>' : ''}
          ${isAssistKing ? '<span title="Re degli Assist" class="text-xs">🪄🅰️</span>' : ''}
        </td>
        <td class="text-center py-2.5 md:py-3 font-mono text-zinc-300 font-bold">${p.role}</td>
        <td class="text-center py-2.5 md:py-3 font-mono font-black text-amber-400 text-xs md:text-sm">${p.ovr}</td>
        <td class="text-center py-2.5 md:py-3 font-mono text-zinc-300 font-bold">${p.matches || 0}</td>
        <td class="text-center py-2.5 md:py-3 font-mono text-emerald-400 font-bold">${p.wins || 0}</td>
        <td class="text-center py-2.5 md:py-3 font-mono text-red-400 font-bold">${p.losses || 0}</td>
        <td class="text-center py-2.5 md:py-3">${golContent}</td>
        <td class="text-center py-2.5 md:py-3">${astContent}</td>
        ${actionContent}
      </tr>
    `;
  });
  refreshIcons();
}

// ==================== FIGURINA FUT ====================
function calculateDefaultFutStats(player) {
  const ovr = player.ovr;
  const cat = getPlayerCategory(player.role);
  let vel, tir, pas, dri, dif, fis;

  if (cat === 'POR') {
    vel = Math.round(ovr * 0.70);
    tir = Math.round(ovr * 0.45);
    pas = Math.round(ovr * 0.75);
    dri = Math.round(ovr * 0.65);
    dif = Math.min(99, Math.round(ovr * 1.05));
    fis = Math.min(99, Math.round(ovr * 1.02));
  } else if (cat === 'DIF') {
    vel = Math.round(ovr * 0.90);
    tir = Math.round(ovr * 0.65);
    pas = Math.round(ovr * 0.78);
    dri = Math.round(ovr * 0.74);
    dif = Math.min(99, Math.round(ovr * 1.05));
    fis = Math.min(99, Math.round(ovr * 1.02));
  } else if (cat === 'ATT') {
    vel = Math.min(99, Math.round(ovr * 1.03));
    tir = Math.min(99, Math.round(ovr * 1.04));
    pas = Math.round(ovr * 0.82);
    dri = Math.min(99, Math.round(ovr * 1.01));
    dif = Math.round(ovr * 0.55);
    fis = Math.round(ovr * 0.84);
  } else {
    vel = Math.round(ovr * 0.95);
    tir = Math.round(ovr * 0.86);
    pas = Math.min(99, Math.round(ovr * 1.04));
    dri = Math.min(99, Math.round(ovr * 1.02));
    dif = Math.round(ovr * 0.78);
    fis = Math.round(ovr * 0.88);
  }

  return {
    vel: Math.min(99, Math.max(1, vel)),
    tir: Math.min(99, Math.max(1, tir)),
    pas: Math.min(99, Math.max(1, pas)),
    dri: Math.min(99, Math.max(1, dri)),
    dif: Math.min(99, Math.max(1, dif)),
    fis: Math.min(99, Math.max(1, fis))
  };
}

function openFutCard(id) {
  const p = players.find(x => x.id === id);
  if (!p) return;

  currentFutPlayerId = id;

  document.getElementById('fut-card-ovr-input').value = p.ovr;
  document.getElementById('fut-card-role').innerText = p.role;
  document.getElementById('fut-card-name').innerText = p.name;
  
  const descInput = document.getElementById('fut-card-desc-input');
  descInput.value = p.desc || '';
  descInput.disabled = !isAdmin;

  document.getElementById('fut-stat-matches').innerText = p.matches || 0;
  document.getElementById('fut-stat-wins').innerText = p.wins || 0;
  document.getElementById('fut-stat-losses').innerText = p.losses || 0;
  document.getElementById('fut-stat-goals').innerText = p.goals || 0;
  document.getElementById('fut-stat-assists').innerText = p.assists || 0;

  const roleBtn = document.getElementById('fut-card-role-btn');
  const roleEditIcon = document.getElementById('fut-card-role-edit-icon');
  if (isAdmin) {
    roleBtn.classList.add('bg-black/15', 'hover:bg-black/25', 'cursor-pointer');
    roleEditIcon.classList.remove('hidden');
  } else {
    roleBtn.classList.remove('bg-black/15', 'hover:bg-black/25', 'cursor-pointer');
    roleEditIcon.classList.add('hidden');
  }

  const avatars = ["⚡", "🦁", "🎯", "👑", "🔥", "🧱", "🪄", "👟"];
  document.getElementById('fut-card-avatar').innerText = avatars[p.id % avatars.length];

  const s = p.stats || calculateDefaultFutStats(p);
  ['vel', 'dri', 'tir', 'dif', 'pas', 'fis'].forEach(k => {
    const input = document.getElementById(`fut-stat-${k}`);
    input.value = s[k];
    input.disabled = !isAdmin;
  });

  document.getElementById('fut-card-ovr-input').disabled = !isAdmin;

  const addBadgeBtn = document.getElementById('fut-btn-add-badge');
  const saveBtn = document.getElementById('fut-btn-save');
  const editNotice = document.getElementById('fut-edit-notice');

  if (isAdmin) {
    addBadgeBtn.classList.remove('hidden');
    saveBtn.classList.remove('hidden');
    editNotice.innerText = "Modalità Admin Attiva (Modificabile)";
    editNotice.className = "text-[8px] font-black text-emerald-950 uppercase";
  } else {
    addBadgeBtn.classList.add('hidden');
    saveBtn.classList.add('hidden');
    editNotice.innerText = "Sola lettura";
    editNotice.className = "text-[8px] font-bold text-amber-900/60 uppercase";
  }

  toggleBadgePicker(false);
  renderFigurinaBadges(p);
  document.getElementById('modal-fut').classList.remove('hidden');
}

function handleRoleClickFromFigurina() {
  if (!isAdmin || !currentFutPlayerId) return;
  openRoleModal(currentFutPlayerId);
}

function openRoleModal(id) {
  const p = players.find(x => x.id === id);
  if (!p) return;
  editingPlayerId = id;
  tempSelectedRole = p.role;
  document.getElementById('role-modal-player-name').innerText = p.name;

  const renderButtons = (containerId, roleList) => {
    const c = document.getElementById(containerId);
    c.innerHTML = '';
    roleList.forEach(r => {
      const isSelected = r === tempSelectedRole;
      c.innerHTML += `
        <button onclick="selectRoleChoice('${r}')" id="role-btn-${r}" class="py-1.5 rounded-lg border font-mono font-bold text-xs transition active:scale-95 ${
          isSelected ? 'bg-amber-400 text-black border-amber-300 shadow font-black' : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15'
        }">${r}</button>
      `;
    });
  };

  renderButtons('roles-por', AVAILABLE_ROLES.por);
  renderButtons('roles-dif', AVAILABLE_ROLES.dif);
  renderButtons('roles-cen', AVAILABLE_ROLES.cen);
  renderButtons('roles-att', AVAILABLE_ROLES.att);

  document.getElementById('modal-role').classList.remove('hidden');
}

function selectRoleChoice(role) {
  tempSelectedRole = role;
  document.querySelectorAll('#modal-role button[id^="role-btn-"]').forEach(btn => {
    btn.className = "py-1.5 rounded-lg border font-mono font-bold text-xs transition active:scale-95 bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15";
  });
  const activeBtn = document.getElementById(`role-btn-${role}`);
  if (activeBtn) {
    activeBtn.className = "py-1.5 rounded-lg border font-mono font-bold text-xs transition active:scale-95 bg-amber-400 text-black border-amber-300 shadow font-black";
  }
}

function saveRole() {
  players = players.map(p => p.id === editingPlayerId ? { ...p, role: tempSelectedRole } : p);
  if (currentWhiteTeam.length) {
    currentWhiteTeam = currentWhiteTeam.map(p => p.id === editingPlayerId ? { ...p, role: tempSelectedRole } : p);
    currentBlackTeam = currentBlackTeam.map(p => p.id === editingPlayerId ? { ...p, role: tempSelectedRole } : p);
  }
  saveState();
  saveActiveMatchState();
  closeRoleModal();
  renderPlayers();
  if (currentWhiteTeam.length) renderTeamsDisplay();
  if (currentFutPlayerId === editingPlayerId) {
    document.getElementById('fut-card-role').innerText = tempSelectedRole;
  }
}

function closeRoleModal() {
  document.getElementById('modal-role').classList.add('hidden');
  editingPlayerId = null;
}

function renderFigurinaBadges(player) {
  const container = document.getElementById('fut-card-badges');
  container.innerHTML = '';

  const currentBadges = player.badges || [];
  if (currentBadges.length === 0) {
    container.innerHTML = '<span class="text-[10px] text-amber-950/70 italic">Nessun badge assegnato.</span>';
    return;
  }

  currentBadges.forEach(badgeId => {
    const b = ALL_BADGES.find(x => x.id === badgeId);
    if (!b) return;

    const badgeEl = document.createElement('span');
    badgeEl.className = "inline-flex items-center gap-1 bg-amber-950/20 border border-amber-950/30 px-2 py-0.5 rounded-full text-[10px] font-black text-amber-950 shadow-sm";
    badgeEl.innerHTML = `
      <span>${b.icon} ${b.name}</span>
      ${isAdmin ? `<button onclick="removeBadgeFromPlayer('${b.id}')" title="Rimuovi" class="ml-1 text-red-800 hover:text-red-950 font-black text-xs leading-none">✕</button>` : ''}
    `;
    container.appendChild(badgeEl);
  });
}

function removeBadgeFromPlayer(badgeId) {
  if (!isAdmin) return;
  const p = players.find(x => x.id === currentFutPlayerId);
  if (!p) return;
  p.badges = (p.badges || []).filter(b => b !== badgeId);
  renderFigurinaBadges(p);
  renderBadgePickerCategories(p);
}

function addBadgeToPlayer(badgeId) {
  if (!isAdmin) return;
  const p = players.find(x => x.id === currentFutPlayerId);
  if (!p) return;
  p.badges = p.badges || [];
  if (!p.badges.includes(badgeId)) p.badges.push(badgeId);
  renderFigurinaBadges(p);
  renderBadgePickerCategories(p);
}

function toggleBadgePicker(forceState) {
  const dropdown = document.getElementById('badge-picker-dropdown');
  const isHidden = dropdown.classList.contains('hidden');
  const show = forceState !== undefined ? forceState : isHidden;

  if (show && isAdmin) {
    dropdown.classList.remove('hidden');
    const p = players.find(x => x.id === currentFutPlayerId);
    if (p) renderBadgePickerCategories(p);
  } else {
    dropdown.classList.add('hidden');
  }
}

function renderBadgePickerCategories(player) {
  const container = document.getElementById('badge-picker-categories');
  container.innerHTML = '';

  const categories = [
    { key: 'dif', title: '🛡️ Difesa e Grinta' },
    { key: 'vel', title: '⚡ Velocità e Corsa' },
    { key: 'att', title: '🎯 Attacco e Finalizzazione' },
    { key: 'tec', title: '🪄 Tecnica e Dribbling' }
  ];

  const currentBadges = player.badges || [];

  categories.forEach(cat => {
    const badgesInCat = ALL_BADGES.filter(b => b.cat === cat.key);
    let buttonsHtml = '';

    badgesInCat.forEach(b => {
      const alreadyHas = currentBadges.includes(b.id);
      buttonsHtml += `
        <button 
          onclick="${alreadyHas ? '' : `addBadgeToPlayer('${b.id}')`}" 
          class="text-left p-1 rounded border text-[10px] font-bold transition flex items-center justify-between ${
            alreadyHas 
              ? 'bg-white/5 border-white/5 text-zinc-500 opacity-50' 
              : 'bg-white/10 hover:bg-amber-400 hover:text-black border-white/10 text-zinc-200'
          }"
        >
          <span>${b.icon} ${b.name}</span>
          ${alreadyHas ? '<span class="text-[9px]">Presente</span>' : '<span class="text-amber-400 font-black">+</span>'}
        </button>
      `;
    });

    container.innerHTML += `
      <div>
        <span class="text-[9px] font-bold text-amber-300 uppercase tracking-wider block mb-1">${cat.title}</span>
        <div class="grid grid-cols-1 gap-1">${buttonsHtml}</div>
      </div>
    `;
  });
}

function saveFutCardChanges() {
  if (!isAdmin) return;
  const p = players.find(x => x.id === currentFutPlayerId);
  if (!p) return;

  const newOvr = Math.min(99, Math.max(1, parseInt(document.getElementById('fut-card-ovr-input').value) || p.ovr));
  const newDesc = document.getElementById('fut-card-desc-input').value.trim() || p.desc;
  
  const newStats = {
    vel: Math.min(99, Math.max(1, parseInt(document.getElementById('fut-stat-vel').value) || 75)),
    dri: Math.min(99, Math.max(1, parseInt(document.getElementById('fut-stat-dri').value) || 75)),
    tir: Math.min(99, Math.max(1, parseInt(document.getElementById('fut-stat-tir').value) || 75)),
    dif: Math.min(99, Math.max(1, parseInt(document.getElementById('fut-stat-dif').value) || 75)),
    pas: Math.min(99, Math.max(1, parseInt(document.getElementById('fut-stat-pas').value) || 75)),
    fis: Math.min(99, Math.max(1, parseInt(document.getElementById('fut-stat-fis').value) || 75))
  };

  p.ovr = newOvr;
  p.desc = newDesc;
  p.stats = newStats;

  saveState();
  closeModals();
  renderPlayers();
  if (currentWhiteTeam.length) renderTeamsDisplay();
}

function closeModals() {
  document.getElementById('modal-fut')?.classList.add('hidden');
  document.getElementById('modal-pitch-action')?.classList.add('hidden');
  document.getElementById('modal-admin-auth')?.classList.add('hidden');
  document.getElementById('modal-matchday-detail')?.classList.add('hidden');
  document.getElementById('modal-edit-matchday')?.classList.add('hidden');
  document.getElementById('modal-add-player')?.classList.add('hidden');
  document.getElementById('modal-edit-player')?.classList.add('hidden');
  document.getElementById('modal-role')?.classList.add('hidden');
  currentFutPlayerId = null;
  selectedMatchdayDetailId = null;
  editingPlayerId = null;
}

// ==================== NAVIGAZIONE A 4 TAB ====================
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById('tab-' + tab)?.classList.remove('hidden');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-amber-400');
    btn.classList.add('text-zinc-400');
  });
  
  const activeBtn = document.getElementById('btn-tab-' + tab);
  if (activeBtn) {
    activeBtn.classList.add('text-amber-400');
    activeBtn.classList.remove('text-zinc-400');
  }

  if (tab === 'recenti') renderArchiveList();
  if (tab === 'leaderboard') renderLeaderboard();
  if (tab === 'match') renderTeamsDisplay();
}

// ==================== WHATSAPP ====================
function shareWhatsApp() {
  if (!isAdmin) return;
  if (currentWhiteTeam.length === 0 || currentBlackTeam.length === 0) {
    generateTeams();
  }

  const rawDate = document.getElementById('match-date-input').value;
  const dateText = formatIsoDateToItalian(rawDate) || rawDate;
  const timeText = document.getElementById('match-time-input').value.trim();
  const dateTimeStr = timeText ? `${dateText} - ore ${timeText}` : dateText;

  const whiteList = currentWhiteTeam.map(p => p.name).join(', ');
  const blackList = currentBlackTeam.map(p => p.name).join(', ');

  const msg = `🥭 *MANGOS LEAGUE - FORMAZIONI UFFICIALI* ⚽%0A` +
              `📅 *Partita:* ${dateTimeStr}%0A%0A` +
              `⚪ *SQUADRA BIANCA:*%0A${whiteList}%0A%0A` +
              `⚫ *SQUADRA NERA:*%0A${blackList}`;

  window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}

// ==================== AVVIO APPLICAZIONE ====================
window.addEventListener('DOMContentLoaded', () => {
  if (activeMatchSavedState) {
    document.getElementById('match-date-input').value = activeMatchSavedState.rawDate || '';
    document.getElementById('match-time-input').value = activeMatchSavedState.time || '';
    document.getElementById('match-place-input').value = activeMatchSavedState.place || 'Calcetto Mangos Arena';
  } else {
    document.getElementById('match-date-input').value = '';
    document.getElementById('match-time-input').value = '';
  }

  syncPublicMatchInfo();
  renderPlayers();
  renderArchiveList();
  updateAdminVisuals();
});
