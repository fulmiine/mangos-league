
/**
 * MANGOS LEAGUE - APP CORE LOGIC (v21 Compatible)
 */

const ALL_BADGES = [
  { id: 'muro', name: 'Muro Invalicabile', icon: '🧱', cat: 'dif' },
  { id: 'cingolato', name: 'Il Trattore', icon: '🚜', cat: 'dif' },
  { id: 'calamita', name: 'Calamita', icon: '🧲', cat: 'dif' },
  { id: 'casello', name: 'Casello Autostradale', icon: '🚧', cat: 'dif' },
  { id: 'borseggiatore', name: 'Pickpocket', icon: '🥷', cat: 'dif' },
  { id: 'ancora', name: 'L\'Ancora', icon: '⚓', cat: 'dif' },
  { id: 'fulmine', name: 'Fulmine', icon: '⚡', cat: 'vel' },
  { id: 'tre_polmoni', name: 'Tre Polmoni', icon: '🫁', cat: 'vel' },
  { id: 'ciao_50', name: 'Il Motorino', icon: '🛵', cat: 'vel' },
  { id: 'segugio', name: 'Boost R2', icon: '🐕', cat: 'vel' },
  { id: 'tornado', name: 'Treno Merci', icon: '🌪️', cat: 'vel' },
  { id: 'scarpetta', name: 'Bomber', icon: '👟', cat: 'att' },
  { id: 'cecchino', name: 'Cecchino', icon: '🎯', cat: 'att' },
  { id: 'volpe', name: 'Rapace d\'Area', icon: '🦅', cat: 'att' },
  { id: 'cannoniere', name: 'Cannoniere', icon: '💣', cat: 'att' },
  { id: 'sangue_freddo', name: 'Sangue Cold', icon: '🧊', cat: 'att' },
  { id: 'pizzicaro', name: 'Clutch Player', icon: '🤌', cat: 'att' },
  { id: 'mago', name: 'Il Mago', icon: '🪄', cat: 'tec' },
  { id: 'ubriacante', name: 'Ubriacante', icon: '🌀', cat: 'tec' },
  { id: 'piede_educato', name: 'Piede Educato', icon: '👟', cat: 'tec' },
  { id: 'brasiliano', name: 'Brasiliano', icon: '🇧🇷', cat: 'tec' }
];

const GITHUB_BACKUP_REPOSITORY = {
  owner: 'fulmiine',
  name: 'mangos-league',
  branch: 'main',
  directory: ''
};

let players = [];

function normalizePlayers(playerList) {
  if (!Array.isArray(playerList)) {
    throw new Error('data.json deve contenere un array di giocatori');
  }

  return playerList.map(p => ({
    ...p,
    matches: p.matches ?? p.pg ?? 0,
    wins: p.wins ?? p.v ?? 0,
    losses: p.losses ?? p.s ?? 0,
    goals: p.goals ?? 0,
    assists: p.assists ?? 0
  }));
}

async function loadPlayers() {
  let dataSource;
  try {
    const response = await fetch('./data.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Caricamento di data.json non riuscito (${response.status})`);
    }
    dataSource = await response.text();
  } catch (error) {
    const storedPlayers = localStorage.getItem('mangos_v21_players');
    if (storedPlayers !== null) {
      players = normalizePlayers(JSON.parse(storedPlayers));
    }
    return;
  }

  const filePlayers = JSON.parse(dataSource);
  const storedPlayers = localStorage.getItem('mangos_v21_players');
  const previousDataSource = localStorage.getItem('mangos_v21_data_source');
  const savedPlayers = storedPlayers === null ? [] : normalizePlayers(JSON.parse(storedPlayers));
  if (storedPlayers !== null && previousDataSource === dataSource) {
    players = savedPlayers;
  } else {
    const savedById = new Map(savedPlayers.map(player => [player.id, player]));
    players = filePlayers.map(player => {
      const savedPlayer = savedById.get(player.id);
      if (!savedPlayer) return player;

      const refreshedPlayer = { ...player };
      refreshedPlayer.present = savedPlayer.present ?? player.present;
      if (savedPlayer.avatarImage) refreshedPlayer.avatarImage = savedPlayer.avatarImage;
      const defaultStats = calculateDefaultFutStats(savedPlayer);
      const hasCustomStats = savedPlayer.stats &&
        Object.keys(defaultStats).some(stat => savedPlayer.stats[stat] !== defaultStats[stat]);
      if (hasCustomStats) {
        refreshedPlayer.stats = savedPlayer.stats;
      }
      return refreshedPlayer;
    });
  }

  players = normalizePlayers(players);
  localStorage.setItem('mangos_v21_players', JSON.stringify(players));
  localStorage.setItem('mangos_v21_data_source', dataSource);
}

let savedMatchdays = JSON.parse(localStorage.getItem('mangos_v21_matchdays')) || [];
let isAdmin = localStorage.getItem('mangos_v21_admin') === 'true';

let activeMatchSavedState = JSON.parse(localStorage.getItem('mangos_active_match')) || null;

function resetGoalAssistDataOnce() {
  const resetKey = 'mangos_v21_goal_assist_reset_v1';
  if (localStorage.getItem(resetKey) === 'true') return;

  const storedPlayers = localStorage.getItem('mangos_v21_players');
  if (storedPlayers !== null) {
    const parsedPlayers = JSON.parse(storedPlayers);
    if (!Array.isArray(parsedPlayers)) {
      throw new Error('Dati giocatori salvati non validi: impossibile azzerare gol e assist');
    }
    localStorage.setItem('mangos_v21_players', JSON.stringify(parsedPlayers.map(player => ({
      ...player,
      goals: 0,
      assists: 0
    }))));
  }

  savedMatchdays = savedMatchdays.map(matchday => {
    const appliedStats = matchday.appliedStats
      ? Object.fromEntries(Object.entries(matchday.appliedStats).map(([id, stats]) => [
        id,
        { ...stats, goals: 0, assists: 0 }
      ]))
      : matchday.appliedStats;
    return {
      ...matchday,
      goalsListWhite: [],
      goalsListBlack: [],
      appliedStats,
      whiteTeam: (matchday.whiteTeam || []).map(player => ({ ...player, goals: 0, assists: 0 })),
      blackTeam: (matchday.blackTeam || []).map(player => ({ ...player, goals: 0, assists: 0 }))
    };
  });
  localStorage.setItem('mangos_v21_matchdays', JSON.stringify(savedMatchdays));

  if (activeMatchSavedState) {
    activeMatchSavedState = {
      ...activeMatchSavedState,
      whiteTeam: (activeMatchSavedState.whiteTeam || []).map(player => ({ ...player, goals: 0, assists: 0 })),
      blackTeam: (activeMatchSavedState.blackTeam || []).map(player => ({ ...player, goals: 0, assists: 0 }))
    };
    localStorage.setItem('mangos_active_match', JSON.stringify(activeMatchSavedState));
  }

  localStorage.setItem(resetKey, 'true');
}

let currentWhiteTeam = activeMatchSavedState ? activeMatchSavedState.whiteTeam || [] : [];
let currentBlackTeam = activeMatchSavedState ? activeMatchSavedState.blackTeam || [] : [];
let currentGkWhiteId = activeMatchSavedState ? activeMatchSavedState.gkWhiteId : null;
let currentGkBlackId = activeMatchSavedState ? activeMatchSavedState.gkBlackId : null;
let tacticalOverridesWhite = activeMatchSavedState ? activeMatchSavedState.overridesWhite || {} : {};
let tacticalOverridesBlack = activeMatchSavedState ? activeMatchSavedState.overridesBlack || {} : {};
let temporaryTurnOrderWhite = [];
let temporaryTurnOrderBlack = [];
let turnOrderManagement = { white: false, black: false };
let turnOrderSelection = { white: null, black: null };

let swapSelection = null;
let activePitchAction = { team: null, playerId: null, context: 'active' };

let tempSavedOverridesWhite = {};
let tempSavedOverridesBlack = {};
let tempSavedGkWhiteId = null;
let tempSavedGkBlackId = null;
let temporarySavedTurnOrderWhite = [];
let temporarySavedTurnOrderBlack = [];
let savedTurnOrderManagement = { white: false, black: false };
let savedTurnOrderSelection = { white: null, black: null };

let activeMatchdayId = null;
let scheduledMatchdaysExpanded = false;

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
    document.getElementById('admin-password-field').type = 'password';
    const visibilityButton = document.getElementById('admin-password-visibility');
    visibilityButton.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
    visibilityButton.setAttribute('aria-label', 'Mostra password');
    visibilityButton.title = 'Mostra password';
    document.getElementById('admin-auth-error').classList.add('hidden');
    document.getElementById('modal-admin-auth').classList.remove('hidden');
    refreshIcons();
  }
}

function toggleAdminPasswordVisibility() {
  const passwordInput = document.getElementById('admin-password-field');
  const visibilityButton = document.getElementById('admin-password-visibility');
  const showPassword = passwordInput.type === 'password';

  passwordInput.type = showPassword ? 'text' : 'password';
  visibilityButton.innerHTML = `<i data-lucide="${showPassword ? 'eye-off' : 'eye'}" class="w-4 h-4"></i>`;
  visibilityButton.setAttribute('aria-label', showPassword ? 'Nascondi password' : 'Mostra password');
  visibilityButton.title = showPassword ? 'Nascondi password' : 'Mostra password';
  refreshIcons();
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
  temporaryTurnOrderWhite = [];
  temporaryTurnOrderBlack = [];
  turnOrderSelection = { white: null, black: null };
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
  const turnOrder = getTemporaryTurnOrder(team);
  if (turnOrder.length === 0) return;
  if (team === 'white') {
    const currIdx = turnOrder.findIndex(p => p.id === currentGkWhiteId);
    currentGkWhiteId = turnOrder[(currIdx + 1) % turnOrder.length].id;
  } else {
    const currIdx = turnOrder.findIndex(p => p.id === currentGkBlackId);
    currentGkBlackId = turnOrder[(currIdx + 1) % turnOrder.length].id;
  }
  saveActiveMatchState();
  renderTacticalAndTurns();
}

function getTemporaryTurnOrder(team) {
  const playersForTeam = team === 'white' ? currentWhiteTeam : currentBlackTeam;
  const order = team === 'white' ? temporaryTurnOrderWhite : temporaryTurnOrderBlack;
  const samePlayers = order.length === playersForTeam.length &&
    order.every((player, index) => player.id === playersForTeam[index]?.id);
  if (samePlayers) return order;

  const playerById = new Map(playersForTeam.map(player => [player.id, player]));
  const retainedOrder = order.map(player => playerById.get(player.id)).filter(Boolean);
  const retainedIds = new Set(retainedOrder.map(player => player.id));
  const updatedOrder = [...retainedOrder, ...playersForTeam.filter(player => !retainedIds.has(player.id))];

  if (team === 'white') temporaryTurnOrderWhite = updatedOrder;
  else temporaryTurnOrderBlack = updatedOrder;
  return updatedOrder;
}

function toggleTurnOrderManagement(team) {
  if (!turnOrderManagement[team]) getTemporaryTurnOrder(team);
  turnOrderManagement[team] = !turnOrderManagement[team];
  turnOrderSelection[team] = null;
  renderTacticalAndTurns();
}

function finishTurnOrderManagement(team) {
  turnOrderManagement[team] = false;
  turnOrderSelection[team] = null;
  renderTacticalAndTurns();
}

function handleTurnOrderClick(team, playerId) {
  if (!turnOrderManagement[team]) {
    setKeeper(team, playerId);
    return;
  }

  const selectedId = turnOrderSelection[team];
  if (selectedId === null) {
    turnOrderSelection[team] = playerId;
  } else if (selectedId === playerId) {
    turnOrderSelection[team] = null;
  } else {
    const order = getTemporaryTurnOrder(team);
    const firstIndex = order.findIndex(player => player.id === selectedId);
    const secondIndex = order.findIndex(player => player.id === playerId);
    if (firstIndex !== -1 && secondIndex !== -1) {
      [order[firstIndex], order[secondIndex]] = [order[secondIndex], order[firstIndex]];
    }
    turnOrderSelection[team] = null;
  }

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
    const order = getTemporaryTurnOrder('white');
    order.forEach((p, idx) => {
      const isCurrent = p.id === tactW.por?.id;
      const isSelected = turnOrderSelection.white === p.id;
      turnsW.innerHTML += `
        <button onclick="handleTurnOrderClick('white', ${p.id})" class="w-full text-left p-1.5 rounded text-[10px] font-bold flex items-center justify-between border transition active:scale-95 ${
          isSelected ? 'bg-sky-400 text-black border-sky-300 shadow ring-1 ring-white' :
          isCurrent ? 'bg-amber-400 text-black border-amber-300 shadow font-black ring-1 ring-white' : 'bg-white/10 text-zinc-300 border-white/5 hover:bg-white/20'
        }">
          <span class="inline-flex min-w-0 items-center gap-1 truncate">
            <span class="truncate">${idx+1}° ${p.name}</span>
            ${turnOrderManagement.white ? '<span class="shrink-0 text-sky-300 text-sm leading-none" title="Seleziona per scambiare turno">⇄</span>' : ''}
          </span>
          <span>${isSelected ? '↔️' : isCurrent ? '🧤' : ''}</span>
        </button>
      `;
    });
    document.getElementById('manage-turns-white').classList.toggle('hidden', turnOrderManagement.white);
    document.getElementById('finish-turns-white').classList.toggle('hidden', !turnOrderManagement.white);
    document.getElementById('turns-temporary-white').classList.toggle('hidden', !turnOrderManagement.white);
    document.getElementById('turns-temporary-white').innerText = 'Seleziona due turni per scambiarli · non salvato';
    document.getElementById('modulo-tag-white').innerText = `MODULO: ${tactW.modulo}`;
    document.getElementById('tactics-desc-white').innerText = tactW.desc;
    renderPitchLines('tactics-white', 'white', tactW, 'active');
  }

  const tactB = generateDynamicTactics(currentBlackTeam, currentGkBlackId, tacticalOverridesBlack);
  const turnsB = document.getElementById('gk-turns-black');
  if (turnsB) {
    turnsB.innerHTML = '';
    const order = getTemporaryTurnOrder('black');
    order.forEach((p, idx) => {
      const isCurrent = p.id === tactB.por?.id;
      const isSelected = turnOrderSelection.black === p.id;
      turnsB.innerHTML += `
        <button onclick="handleTurnOrderClick('black', ${p.id})" class="w-full text-left p-1.5 rounded text-[10px] font-bold flex items-center justify-between border transition active:scale-95 ${
          isSelected ? 'bg-sky-400 text-black border-sky-300 shadow ring-1 ring-white' :
          isCurrent ? 'bg-amber-400 text-black border-amber-300 shadow font-black ring-1 ring-white' : 'bg-white/10 text-zinc-300 border-white/5 hover:bg-white/20'
        }">
          <span class="inline-flex min-w-0 items-center gap-1 truncate">
            <span class="truncate">${idx+1}° ${p.name}</span>
            ${turnOrderManagement.black ? '<span class="shrink-0 text-sky-300 text-sm leading-none" title="Seleziona per scambiare turno">⇄</span>' : ''}
          </span>
          <span>${isSelected ? '↔️' : isCurrent ? '🧤' : ''}</span>
        </button>
      `;
    });
    document.getElementById('manage-turns-black').classList.toggle('hidden', turnOrderManagement.black);
    document.getElementById('finish-turns-black').classList.toggle('hidden', !turnOrderManagement.black);
    document.getElementById('turns-temporary-black').classList.toggle('hidden', !turnOrderManagement.black);
    document.getElementById('turns-temporary-black').innerText = 'Seleziona due turni per scambiarli · non salvato';
    document.getElementById('modulo-tag-black').innerText = `MODULO: ${tactB.modulo}`;
    document.getElementById('tactics-desc-black').innerText = tactB.desc;
    renderPitchLines('tactics-black', 'black', tactB, 'active');
  }

  refreshIcons();
}

function renderPitchLines(containerId, teamType, tact, context = 'active') {
  const c = document.getElementById(containerId);
  if (!c) return;
  const avatars = ['⚡', '🦁', '🎯', '👑', '🔥', '🧱', '🪄', '👟'];
  const card = (player, position) => {
    if (!player) return '';
    const fullPlayer = players.find(item => item.id === player.id) || player;
    const avatar = fullPlayer.avatarImage && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(fullPlayer.avatarImage)
      ? `<img src="${fullPlayer.avatarImage}" alt="" class="mini-fut-card-photo">`
      : `<span class="mini-fut-card-emoji">${avatars[player.id % avatars.length]}</span>`;
    return `
      <button type="button" onclick="openPitchActionModal('${teamType}', ${player.id}, '${position}', '${context}')" class="mini-fut-card group" title="${player.name} • ${position}">
        <span class="mini-fut-card-top">
          <span class="mini-fut-card-ovr">${player.ovr}</span>
          <span class="mini-fut-card-position">${position}</span>
        </span>
        <span class="mini-fut-card-avatar">${avatar}</span>
        <span class="mini-fut-card-name">${player.name}</span>
      </button>
    `;
  };
  const line = (label, players, position) => `
    <div class="mini-fut-line mini-fut-line--${position === 'POR' ? 'keeper' : position.toLowerCase()}">
      <span class="mini-fut-line-label">${label}</span>
      <div class="mini-fut-line-cards">${(players || []).map(player => card(player, position)).join('') || '<span class="mini-fut-empty">Nessuno</span>'}</div>
    </div>
  `;

  c.className = 'mini-fut-pitch';
  c.innerHTML = `
    ${line('ATTACCO', tact.att, 'ATT')}
    ${line('CENTROCAMPO', tact.cc, 'CC')}
    ${line('DIFESA', tact.dif, 'DIF')}
    ${line('🧤 PORTIERE', tact.por ? [tact.por] : [], 'POR')}
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
    renderUpcomingScheduledMatchday();
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
      status: 'programmata',
      scoreWhite: null,
      scoreBlack: null,
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
      if (g.assist && g.assist !== 'Nessuno' && g.assist !== g.scorer) {
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
      if (g.assist && g.assist !== 'Nessuno' && g.assist !== g.scorer) {
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
  renderUpcomingScheduledMatchday();

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

function renderUpcomingScheduledMatchday() {
  const container = document.getElementById('public-scheduled-matchdays');
  const list = document.getElementById('public-scheduled-matchdays-list');
  const toggle = document.getElementById('public-scheduled-matchdays-toggle');
  const emptyNotice = document.getElementById('public-no-teams');
  if (!container || !list || !toggle || !emptyNotice) return;

  const hasActiveTeams = currentWhiteTeam.length > 0 && currentBlackTeam.length > 0;
  const scheduledMatchdays = savedMatchdays.filter(matchday => matchday.status === 'programmata');
  emptyNotice.classList.toggle('hidden', hasActiveTeams || scheduledMatchdays.length > 0);
  if (scheduledMatchdays.length === 0) {
    container.classList.add('hidden');
    list.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');
  toggle.classList.toggle('hidden', scheduledMatchdays.length === 1);
  document.getElementById('public-scheduled-matchdays-count').innerText = scheduledMatchdays.length;
  list.innerHTML = '';

  if (scheduledMatchdays.length === 1) {
    const matchday = scheduledMatchdays[0];
    list.classList.remove('hidden');
    list.innerHTML = `
      <button type="button" onclick="openMatchdayDetail(${Number(matchday.id)})" class="w-full bg-white/5 border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-5 text-center space-y-2 transition">
        <div class="text-2xl">⏳</div>
        <span class="block font-bold text-white text-sm md:text-base">Formazioni in preparazione</span>
        <span class="block text-amber-300 text-xs md:text-sm font-bold">${matchday.date || 'Data da definire'}${matchday.time ? ` - ore ${matchday.time}` : ''}</span>
        <span class="block text-xs text-zinc-400">📍 ${matchday.place || 'Calcetto Mangos Arena'}</span>
        <span class="block text-[10px] text-zinc-500">Tocca per vedere formazioni e riassunto</span>
      </button>
    `;
    return;
  }

  scheduledMatchdays.forEach(matchday => {
    const card = document.createElement('div');
    card.className = 'bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2';

    const details = document.createElement('div');
    details.className = 'min-w-0';
    const date = document.createElement('p');
    date.className = 'text-amber-300 text-xs font-bold';
    date.textContent = `${matchday.date || 'Data da definire'}${matchday.time ? ` - ore ${matchday.time}` : ''}`;
    const place = document.createElement('p');
    place.className = 'text-zinc-400 text-[10px] mt-1';
    place.textContent = `📍 ${matchday.place || 'Calcetto Mangos Arena'}`;
    details.append(date, place);

    const actions = document.createElement('div');
    actions.className = 'flex gap-2 shrink-0';
    const viewButton = document.createElement('button');
    viewButton.type = 'button';
    viewButton.className = 'px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold';
    viewButton.textContent = 'Formazioni / Riassunto';
    viewButton.addEventListener('click', () => openMatchdayDetail(matchday.id));
    actions.appendChild(viewButton);

    if (isAdmin) {
      const loadButton = document.createElement('button');
      loadButton.type = 'button';
      loadButton.className = 'px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black';
      loadButton.textContent = 'Carica nel Campo Tattico';
      loadButton.addEventListener('click', () => loadScheduledMatchdayIntoPitch(matchday.id));
      actions.appendChild(loadButton);
    }

    card.append(details, actions);
    list.appendChild(card);
  });
  list.classList.toggle('hidden', !scheduledMatchdaysExpanded);
}

function toggleScheduledMatchdays() {
  const list = document.getElementById('public-scheduled-matchdays-list');
  scheduledMatchdaysExpanded = !scheduledMatchdaysExpanded;
  list.classList.toggle('hidden', !scheduledMatchdaysExpanded);
}

function loadScheduledMatchdayIntoPitch(id) {
  if (!isAdmin) return;
  selectedMatchdayDetailId = id;
  loadSavedMatchdayIntoActivePitch();
}

function switchMatchdayDetailTab(tabKey) {
  const isFormations = tabKey === 'formations';
  const formationsTab = document.getElementById('btn-md-tab-formations');
  const summaryTab = document.getElementById('btn-md-tab-summary');
  const formationsSection = document.getElementById('md-sec-formations');
  const summarySection = document.getElementById('md-sec-summary');

  formationsTab.className = isFormations
    ? "py-2 px-3 border-b-2 border-amber-400 text-amber-400 transition font-bold"
    : "py-2 px-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition";
  summaryTab.className = isFormations
    ? "py-2 px-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition"
    : "py-2 px-3 border-b-2 border-amber-400 text-amber-400 transition font-bold";
  formationsSection.classList.toggle('hidden', !isFormations);
  summarySection.classList.toggle('hidden', isFormations);
}

function openMatchdayDetail(id) {
  const m = savedMatchdays.find(x => x.id === id);
  if (!m) return;

  selectedMatchdayDetailId = id;

  tempSavedOverridesWhite = { ...(m.overridesWhite || {}) };
  tempSavedOverridesBlack = { ...(m.overridesBlack || {}) };
  tempSavedGkWhiteId = m.gkWhiteId;
  tempSavedGkBlackId = m.gkBlackId;
  temporarySavedTurnOrderWhite = [...(m.whiteTeam || [])];
  temporarySavedTurnOrderBlack = [...(m.blackTeam || [])];
  savedTurnOrderManagement = { white: false, black: false };
  savedTurnOrderSelection = { white: null, black: null };

  document.getElementById('modal-match-date').innerText = `${m.date} - ${m.time}`;
  document.getElementById('modal-match-place').innerText = `Campo: ${m.place}`;

  const statusBadge = document.getElementById('modal-match-status-badge');
  const scoreBadge = document.getElementById('modal-match-score-badge');
  const pendingBanner = document.getElementById('modal-match-pending-banner');
  const tabsContainer = document.getElementById('modal-match-tabs-container');
  const formationsTab = document.getElementById('btn-md-tab-formations');
  const summaryTab = document.getElementById('btn-md-tab-summary');
  const contentArea = document.getElementById('modal-match-content-area');
  const formationsPending = document.getElementById('md-sec-formations-pending');
  const formationsRoster = document.getElementById('md-sec-formations-roster');
  const summaryScheduled = document.getElementById('md-sec-summary-scheduled');
  const summaryScore = document.getElementById('md-sec-summary-score');
  const isProgrammata = m.status === 'programmata';
  const hasRoster = m.whiteTeam && m.whiteTeam.length > 0 && m.blackTeam && m.blackTeam.length > 0;
  tabsContainer.insertBefore(isProgrammata ? formationsTab : summaryTab, tabsContainer.firstChild);

  formationsPending.classList.toggle('hidden', hasRoster);
  formationsRoster.classList.toggle('hidden', !hasRoster);
  summaryScheduled.classList.toggle('hidden', !isProgrammata);
  summaryScore.classList.toggle('hidden', isProgrammata);

  if (isProgrammata) {
    statusBadge.innerText = 'PROSSIMO DERBY / PROGRAMMATA';
    statusBadge.className = 'text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black border border-amber-500/40';
    scoreBadge.classList.add('hidden');
    pendingBanner.classList.add('hidden');
    tabsContainer.classList.remove('hidden');
    contentArea.classList.remove('hidden');
    switchMatchdayDetailTab('formations');
  } else {
    statusBadge.innerText = 'CONCLUSA';
    statusBadge.className = 'text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black border border-emerald-500/40';
    scoreBadge.innerText = `⚽ Risultato: Bianchi ${m.scoreWhite || 0} - ${m.scoreBlack || 0} Neri`;
    scoreBadge.classList.remove('hidden');
    pendingBanner.classList.add('hidden');
    tabsContainer.classList.remove('hidden');
    contentArea.classList.remove('hidden');
    switchMatchdayDetailTab('summary');
  }

  renderSavedMatchdayPitch();
  renderSavedTabellino(m);

  const adminActions = document.getElementById('modal-match-admin-actions');
  const editAction = document.getElementById('modal-match-edit-action');
  const summaryAdminActions = document.getElementById('summary-admin-actions');
  const adminLoadPitch = document.getElementById('admin-load-pitch-action');
  if (isAdmin) {
    adminActions.classList.remove('hidden');
    editAction.classList.remove('hidden');
    summaryAdminActions.classList.toggle('hidden', isProgrammata);
    summaryAdminActions.classList.toggle('flex', !isProgrammata);
    adminLoadPitch.classList.remove('hidden');
  } else {
    adminActions.classList.add('hidden');
    editAction.classList.add('hidden');
    summaryAdminActions.classList.add('hidden');
    summaryAdminActions.classList.remove('flex');
    adminLoadPitch.classList.add('hidden');
  }

  document.getElementById('modal-matchday-detail').classList.remove('hidden');
  refreshIcons();
}

function renderSavedTabellino(m) {
  const score = getMatchScoreFromGoalLists(m);
  document.getElementById('modal-tabellino-score-header').innerText = `⚪ Bianchi ${m.scoreWhite ?? score.white} - ${m.scoreBlack ?? score.black} Neri ⚫`;

  const containerW = document.getElementById('modal-tabellino-goals-w');
  const containerB = document.getElementById('modal-tabellino-goals-b');
  containerW.innerHTML = '';
  containerB.innerHTML = '';

  const goalsW = m.goalsListWhite || [];
  const goalsB = m.goalsListBlack || [];

  if (goalsW.length === 0) {
    containerW.innerHTML = '<span class="text-zinc-400 italic text-xs md:text-sm">Nessun gol registrato per i Bianchi.</span>';
  } else {
    goalsW.forEach(g => {
      containerW.innerHTML += `
        <div class="flex items-center gap-1.5 py-0.5 border-b border-white/5">
          <span>⚽</span>
          <b class="text-white">${g.scorer}</b>
          ${g.isOwnGoal ? '<span class="text-red-400 font-black text-[9px] uppercase">(AG - gol ai Bianchi)</span>' : (g.assist && g.assist !== 'Nessuno' && g.assist !== g.scorer ? `<span class="text-zinc-400 text-[10px]">(🅰️ ${g.assist})</span>` : '')}
          ${g.isPenalty ? '<span class="text-amber-300 font-black text-[9px] uppercase">(Rigore)</span>' : ''}
        </div>
      `;
    });
  }

  if (goalsB.length === 0) {
    containerB.innerHTML = '<span class="text-zinc-400 italic text-xs md:text-sm">Nessun gol registrato per i Neri.</span>';
  } else {
    goalsB.forEach(g => {
      containerB.innerHTML += `
        <div class="flex items-center gap-1.5 py-0.5 border-b border-white/5">
          <span>⚽</span>
          <b class="text-amber-400">${g.scorer}</b>
          ${g.isOwnGoal ? '<span class="text-red-400 font-black text-[9px] uppercase">(AG - gol ai Neri)</span>' : (g.assist && g.assist !== 'Nessuno' && g.assist !== g.scorer ? `<span class="text-zinc-400 text-[10px]">(🅰️ ${g.assist})</span>` : '')}
          ${g.isPenalty ? '<span class="text-amber-300 font-black text-[9px] uppercase">(Rigore)</span>' : ''}
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

  getSavedTemporaryTurnOrder('white', m).forEach((p, idx) => {
    const isCurrent = p.id === tactW.por?.id;
    const isSelected = savedTurnOrderSelection.white === p.id;
    turnsContainerW.innerHTML += `
      <button onclick="handleSavedTurnOrderClick('white', ${p.id})" class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition active:scale-95 ${
        isSelected ? 'bg-sky-400 text-black border-sky-300 shadow' :
        isCurrent ? 'bg-amber-400 text-black border-amber-300 font-black' : 'bg-white/10 text-zinc-300 border-white/10 hover:bg-white/20'
      }">
        ${idx+1}° ${p.name.split(' ')[0]} ${savedTurnOrderManagement.white ? '<span class="text-sky-300 text-sm" title="Seleziona per scambiare turno">⇄</span>' : isSelected ? '↔️' : isCurrent ? '🧤' : ''}
      </button>
    `;
  });

  getSavedTemporaryTurnOrder('black', m).forEach((p, idx) => {
    const isCurrent = p.id === tactB.por?.id;
    const isSelected = savedTurnOrderSelection.black === p.id;
    turnsContainerB.innerHTML += `
      <button onclick="handleSavedTurnOrderClick('black', ${p.id})" class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition active:scale-95 ${
        isSelected ? 'bg-sky-400 text-black border-sky-300 shadow' :
        isCurrent ? 'bg-amber-400 text-black border-amber-300 font-black' : 'bg-black/50 text-zinc-300 border-white/10 hover:bg-white/20'
      }">
        ${idx+1}° ${p.name.split(' ')[0]} ${savedTurnOrderManagement.black ? '<span class="text-sky-300 text-sm" title="Seleziona per scambiare turno">⇄</span>' : isSelected ? '↔️' : isCurrent ? '🧤' : ''}
      </button>
    `;
  });
  document.getElementById('modal-manage-turns-w').classList.toggle('hidden', savedTurnOrderManagement.white);
  document.getElementById('modal-finish-turns-w').classList.toggle('hidden', !savedTurnOrderManagement.white);
  document.getElementById('modal-turns-temporary-w').classList.toggle('hidden', !savedTurnOrderManagement.white);
  document.getElementById('modal-turns-temporary-w').innerText = 'Seleziona due turni per scambiarli · non salvato';
  document.getElementById('modal-manage-turns-b').classList.toggle('hidden', savedTurnOrderManagement.black);
  document.getElementById('modal-finish-turns-b').classList.toggle('hidden', !savedTurnOrderManagement.black);
  document.getElementById('modal-turns-temporary-b').classList.toggle('hidden', !savedTurnOrderManagement.black);
  document.getElementById('modal-turns-temporary-b').innerText = 'Seleziona due turni per scambiarli · non salvato';
  refreshIcons();
}

function getSavedTemporaryTurnOrder(team, matchday) {
  const teamPlayers = team === 'white' ? matchday.whiteTeam || [] : matchday.blackTeam || [];
  const order = team === 'white' ? temporarySavedTurnOrderWhite : temporarySavedTurnOrderBlack;
  const playerById = new Map(teamPlayers.map(player => [player.id, player]));
  const retainedOrder = order.map(player => playerById.get(player.id)).filter(Boolean);
  const retainedIds = new Set(retainedOrder.map(player => player.id));
  const updatedOrder = [...retainedOrder, ...teamPlayers.filter(player => !retainedIds.has(player.id))];
  if (team === 'white') temporarySavedTurnOrderWhite = updatedOrder;
  else temporarySavedTurnOrderBlack = updatedOrder;
  return updatedOrder;
}

function toggleSavedTurnOrderManagement(team) {
  const matchday = savedMatchdays.find(item => item.id === selectedMatchdayDetailId);
  if (!matchday) return;
  getSavedTemporaryTurnOrder(team, matchday);
  savedTurnOrderManagement[team] = !savedTurnOrderManagement[team];
  savedTurnOrderSelection[team] = null;
  renderSavedMatchdayPitch();
}

function finishSavedTurnOrderManagement(team) {
  savedTurnOrderManagement[team] = false;
  savedTurnOrderSelection[team] = null;
  renderSavedMatchdayPitch();
}

function handleSavedTurnOrderClick(team, playerId) {
  if (!savedTurnOrderManagement[team]) {
    setSavedMatchdayKeeper(team, playerId);
    return;
  }

  const selectedId = savedTurnOrderSelection[team];
  if (selectedId === null) {
    savedTurnOrderSelection[team] = playerId;
  } else if (selectedId === playerId) {
    savedTurnOrderSelection[team] = null;
  } else {
    const matchday = savedMatchdays.find(item => item.id === selectedMatchdayDetailId);
    if (!matchday) return;
    const order = getSavedTemporaryTurnOrder(team, matchday);
    const firstIndex = order.findIndex(player => player.id === selectedId);
    const secondIndex = order.findIndex(player => player.id === playerId);
    if (firstIndex !== -1 && secondIndex !== -1) {
      [order[firstIndex], order[secondIndex]] = [order[secondIndex], order[firstIndex]];
    }
    savedTurnOrderSelection[team] = null;
  }
  renderSavedMatchdayPitch();
}

function rotateSavedMatchdayKeeper(team) {
  const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
  if (!m) return;

  if (team === 'white') {
    if (!m.whiteTeam || m.whiteTeam.length === 0) return;
    const order = getSavedTemporaryTurnOrder('white', m);
    const currIdx = order.findIndex(p => p.id === tempSavedGkWhiteId);
    tempSavedGkWhiteId = order[(currIdx + 1) % order.length].id;
  } else {
    if (!m.blackTeam || m.blackTeam.length === 0) return;
    const order = getSavedTemporaryTurnOrder('black', m);
    const currIdx = order.findIndex(p => p.id === tempSavedGkBlackId);
    tempSavedGkBlackId = order[(currIdx + 1) % order.length].id;
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
  temporaryTurnOrderWhite = [...currentWhiteTeam];
  temporaryTurnOrderBlack = [...currentBlackTeam];
  turnOrderManagement = { white: false, black: false };
  turnOrderSelection = { white: null, black: null };
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

  tempGoalsListWhite = JSON.parse(JSON.stringify(m.goalsListWhite || []))
    .map(goal => goal.assist === goal.scorer ? { ...goal, assist: 'Nessuno' } : goal);
  tempGoalsListBlack = JSON.parse(JSON.stringify(m.goalsListBlack || []))
    .map(goal => goal.assist === goal.scorer ? { ...goal, assist: 'Nessuno' } : goal);

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

  document.getElementById('add-goal-scorer-w').onchange = () => updateGoalAssistOptions('white');
  document.getElementById('add-goal-scorer-b').onchange = () => updateGoalAssistOptions('black');
  updateGoalAssistOptions('white');
  updateGoalAssistOptions('black');
}

function updateGoalAssistOptions(team) {
  const m = savedMatchdays.find(x => x.id === selectedMatchdayDetailId);
  if (!m) return;

  const suffix = team === 'white' ? 'w' : 'b';
  const scorer = document.getElementById(`add-goal-scorer-${suffix}`).value;
  const assistSelect = document.getElementById(`add-goal-assist-${suffix}`);
  const previousAssist = assistSelect.value;
  const teamPlayers = team === 'white' ? m.whiteTeam : m.blackTeam;

  assistSelect.innerHTML = '<option value="Nessuno">Nessun Assist</option>';
  (teamPlayers || []).filter(player => player.name !== scorer).forEach(player => {
    assistSelect.add(new Option(player.name, player.name));
  });
  assistSelect.value = previousAssist !== scorer && [...assistSelect.options].some(option => option.value === previousAssist)
    ? previousAssist
    : 'Nessuno';
}

function renderTempGoalsList() {
  const containerW = document.getElementById('edit-goals-list-w');
  const containerB = document.getElementById('edit-goals-list-b');

  document.getElementById('edit-count-goals-w').innerText = tempGoalsListWhite.length;
  document.getElementById('edit-count-goals-b').innerText = tempGoalsListBlack.length;

  containerW.innerHTML = '';
  containerB.innerHTML = '';

  if (tempGoalsListWhite.length === 0) {
    containerW.innerHTML = `<span class="text-xs md:text-sm text-zinc-400 italic">Nessun gol registrato per i Bianchi.</span>`;
  } else {
    tempGoalsListWhite.forEach((g, idx) => {
      containerW.innerHTML += `
        <div class="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-white/5 text-[11px]">
          <div>
            <span>⚽</span>
            <b class="text-white">${g.scorer}</b>
            ${g.isOwnGoal ? '<span class="text-red-400 font-bold text-[9px]">(AG - gol ai Bianchi)</span>' : (g.assist !== 'Nessuno' && g.assist !== g.scorer ? `<span class="text-zinc-400 text-[10px]">(🅰️ ${g.assist})</span>` : '')}
            ${g.isPenalty ? '<span class="text-amber-300 font-bold text-[9px]">(Rigore)</span>' : ''}
          </div>
          <button onclick="removeTempGoal('white', ${idx})" class="text-red-400 hover:text-red-300 font-black">✕</button>
        </div>
      `;
    });
  }

  if (tempGoalsListBlack.length === 0) {
    containerB.innerHTML = `<span class="text-xs md:text-sm text-zinc-400 italic">Nessun gol registrato per i Neri.</span>`;
  } else {
    tempGoalsListBlack.forEach((g, idx) => {
      containerB.innerHTML += `
        <div class="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-white/5 text-[11px]">
          <div>
            <span>⚽</span>
            <b class="text-amber-400">${g.scorer}</b>
            ${g.isOwnGoal ? '<span class="text-red-400 font-bold text-[9px]">(AG - gol ai Neri)</span>' : (g.assist !== 'Nessuno' && g.assist !== g.scorer ? `<span class="text-zinc-400 text-[10px]">(🅰️ ${g.assist})</span>` : '')}
            ${g.isPenalty ? '<span class="text-amber-300 font-bold text-[9px]">(Rigore)</span>' : ''}
          </div>
          <button onclick="removeTempGoal('black', ${idx})" class="text-red-400 hover:text-red-300 font-black">✕</button>
        </div>
      `;
    });
  }
}

function getGoalScoringTeam(team, scorer, isOwnGoal) {
  if (!isOwnGoal) return team;

  const matchday = savedMatchdays.find(match => match.id === selectedMatchdayDetailId);
  if (!matchday) return team;

  const scorerPlayer = players.find(player => player.name === scorer);
  const inWhiteTeam = (matchday.whiteTeam || []).some(player =>
    player.name === scorer || (scorerPlayer && player.id === scorerPlayer.id)
  );
  const inBlackTeam = (matchday.blackTeam || []).some(player =>
    player.name === scorer || (scorerPlayer && player.id === scorerPlayer.id)
  );
  if (inWhiteTeam === inBlackTeam) return team;
  return inWhiteTeam ? 'black' : 'white';
}

function addGoalToMatch(team) {
  if (team === 'white') {
    const scorer = document.getElementById('add-goal-scorer-w').value;
    const selectedAssist = document.getElementById('add-goal-assist-w').value;
    const isOwnGoal = document.getElementById('add-goal-owngoal-w').checked;
    const isPenalty = document.getElementById('add-goal-penalty-w').checked;
    const assist = isOwnGoal || selectedAssist === scorer ? 'Nessuno' : selectedAssist;
    const goal = { id: Date.now() + Math.random(), scorer, assist, isOwnGoal, isPenalty };
    const scoringTeam = getGoalScoringTeam(team, scorer, isOwnGoal);
    (scoringTeam === 'white' ? tempGoalsListWhite : tempGoalsListBlack).push(goal);
    document.getElementById('add-goal-owngoal-w').checked = false;
    document.getElementById('add-goal-penalty-w').checked = false;
  } else {
    const scorer = document.getElementById('add-goal-scorer-b').value;
    const selectedAssist = document.getElementById('add-goal-assist-b').value;
    const isOwnGoal = document.getElementById('add-goal-owngoal-b').checked;
    const isPenalty = document.getElementById('add-goal-penalty-b').checked;
    const assist = isOwnGoal || selectedAssist === scorer ? 'Nessuno' : selectedAssist;
    const goal = { id: Date.now() + Math.random(), scorer, assist, isOwnGoal, isPenalty };
    const scoringTeam = getGoalScoringTeam(team, scorer, isOwnGoal);
    (scoringTeam === 'white' ? tempGoalsListWhite : tempGoalsListBlack).push(goal);
    document.getElementById('add-goal-owngoal-b').checked = false;
    document.getElementById('add-goal-penalty-b').checked = false;
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

function getMatchScoreFromGoalLists(matchday) {
  return {
    white: (matchday.goalsListWhite || []).length,
    black: (matchday.goalsListBlack || []).length
  };
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

  const hasRegisteredGoals = tempGoalsListWhite.length > 0 || tempGoalsListBlack.length > 0;
  m.status = hasRegisteredGoals ? 'concluso' : statusVal;
  m.goalsListWhite = [...tempGoalsListWhite];
  m.goalsListBlack = [...tempGoalsListBlack];
  const score = getMatchScoreFromGoalLists({
    goalsListWhite: tempGoalsListWhite,
    goalsListBlack: tempGoalsListBlack
  });
  m.scoreWhite = score.white;
  m.scoreBlack = score.black;

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

function applySharedBackup(imported) {
  if (!imported || !Array.isArray(imported.players)) {
    throw new Error('Il backup GitHub non contiene un elenco giocatori valido');
  }

  players = normalizePlayers(imported.players);
  if (Array.isArray(imported.savedMatchdays)) {
    savedMatchdays = imported.savedMatchdays;
  }

  if (Object.prototype.hasOwnProperty.call(imported, 'activeMatch')) {
    activeMatchSavedState = imported.activeMatch || null;
    currentWhiteTeam = activeMatchSavedState?.whiteTeam || [];
    currentBlackTeam = activeMatchSavedState?.blackTeam || [];
    currentGkWhiteId = activeMatchSavedState?.gkWhiteId ?? null;
    currentGkBlackId = activeMatchSavedState?.gkBlackId ?? null;
    tacticalOverridesWhite = activeMatchSavedState?.overridesWhite || {};
    tacticalOverridesBlack = activeMatchSavedState?.overridesBlack || {};
    localStorage.setItem('mangos_active_match', JSON.stringify(activeMatchSavedState));
  }

  saveState();
  localStorage.setItem('mangos_v21_matchdays', JSON.stringify(savedMatchdays));
}

async function loadLatestGitHubBackup() {
  const { owner, name, branch, directory } = GITHUB_BACKUP_REPOSITORY;
  const contentsPath = directory ? `/contents/${directory}` : '/contents';
  const apiUrl = new URL(
    `https://api.github.com/repos/${owner}/${name}${contentsPath}?ref=${encodeURIComponent(branch)}`
  );
  const contentsResponse = await fetch(apiUrl, {
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!contentsResponse.ok) {
    throw new Error(`GitHub non raggiungibile (${contentsResponse.status})`);
  }

  const contents = await contentsResponse.json();
  if (!Array.isArray(contents)) {
    throw new Error('GitHub non ha restituito un elenco di file valido');
  }

  const backupFiles = contents
    .filter(file =>
      file.type === 'file' &&
      /^mangos_backup_.*\.json$/i.test(file.name) &&
      typeof file.download_url === 'string'
    )
    .sort((a, b) => b.name.localeCompare(a.name, 'en'));
  if (backupFiles.length === 0) {
    throw new Error('Nessun file mangos_backup_*.json trovato nella cartella configurata');
  }

  const backupResponse = await fetch(backupFiles[0].download_url, { cache: 'no-store' });
  if (!backupResponse.ok) {
    throw new Error(`Impossibile scaricare ${backupFiles[0].name} (${backupResponse.status})`);
  }

  applySharedBackup(await backupResponse.json());
  console.info(`Backup condiviso caricato da GitHub: ${backupFiles[0].name}`);
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
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      const importedPlayers = Array.isArray(imported) ? imported : imported?.players;
      if (Array.isArray(importedPlayers)) {
        players = importedPlayers.map(player => ({
          ...player,
          matches: player.matches ?? player.pg ?? 0,
          wins: player.wins ?? player.v ?? 0,
          losses: player.losses ?? player.s ?? 0,
          goals: player.goals ?? 0,
          assists: player.assists ?? 0,
        }));

        if (Array.isArray(imported.savedMatchdays)) {
          savedMatchdays = imported.savedMatchdays;
        }

        if (imported && !Array.isArray(imported) && Object.prototype.hasOwnProperty.call(imported, 'activeMatch')) {
          activeMatchSavedState = imported.activeMatch || null;
          currentWhiteTeam = activeMatchSavedState?.whiteTeam || [];
          currentBlackTeam = activeMatchSavedState?.blackTeam || [];
          currentGkWhiteId = activeMatchSavedState?.gkWhiteId ?? null;
          currentGkBlackId = activeMatchSavedState?.gkBlackId ?? null;
          tacticalOverridesWhite = activeMatchSavedState?.overridesWhite || {};
          tacticalOverridesBlack = activeMatchSavedState?.overridesBlack || {};
          localStorage.setItem('mangos_active_match', JSON.stringify(activeMatchSavedState));

          const dateInput = document.getElementById('match-date-input');
          const timeInput = document.getElementById('match-time-input');
          const placeInput = document.getElementById('match-place-input');
          if (dateInput) dateInput.value = activeMatchSavedState?.rawDate || '';
          if (timeInput) timeInput.value = activeMatchSavedState?.time || '';
          if (placeInput) placeInput.value = activeMatchSavedState?.place || 'Calcetto Mangos Arena';
          activeMatchdayId = null;
        }

        saveState();
        localStorage.setItem('mangos_v21_matchdays', JSON.stringify(savedMatchdays));
        syncPublicMatchInfo();
        renderPlayers();
        renderLeaderboard();
        renderArchiveList();
        renderTeamsDisplay();
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
  updateFutCardTierFromInput();
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
  renderFutRecentMatches(p);

  const roleBtn = document.getElementById('fut-card-role-btn');
  const roleEditIcon = document.getElementById('fut-card-role-edit-icon');
  if (isAdmin) {
    roleBtn.classList.add('bg-black/15', 'hover:bg-black/25', 'cursor-pointer');
    roleEditIcon.classList.remove('hidden');
  } else {
    roleBtn.classList.remove('bg-black/15', 'hover:bg-black/25', 'cursor-pointer');
    roleEditIcon.classList.add('hidden');
  }

  renderFutCardAvatar(p);

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

function updateFutCardTierFromInput() {
  const card = document.querySelector('#modal-fut .fut-card');
  const input = document.getElementById('fut-card-ovr-input');
  if (!card || !input) return;

  const ovr = Number(input.value);
  const rating = Number.isFinite(ovr) ? ovr : 0;
  const tier = rating >= 74 && rating <= 79
    ? 'silver'
    : rating >= 80 && rating <= 85
      ? 'gold'
      : Math.min(90, Math.max(10, Math.floor(rating / 10) * 10));
  [...card.classList].filter(className => className.startsWith('fut-card--tier-') || className.startsWith('fut-card--ovr-'))
    .forEach(className => card.classList.remove(className));
  card.classList.add(typeof tier === 'string' ? `fut-card--ovr-${tier}` : `fut-card--tier-${tier}`);
}

function renderFutRecentMatches(player) {
  const container = document.getElementById('fut-recent-matches');
  if (!container) return;
  container.innerHTML = '';

  const recentMatches = savedMatchdays
    .filter(matchday => matchday.status === 'concluso')
    .sort((a, b) => {
      const dateA = a.rawDate ? new Date(`${a.rawDate}T00:00:00`).getTime() : Number(a.id) || 0;
      const dateB = b.rawDate ? new Date(`${b.rawDate}T00:00:00`).getTime() : Number(b.id) || 0;
      return dateB - dateA || (Number(b.id) || 0) - (Number(a.id) || 0);
    })
    .slice(0, 5);

  if (recentMatches.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'py-2 text-center text-[9px] font-semibold italic text-amber-900/60';
    empty.textContent = 'Nessuna partita conclusa';
    container.appendChild(empty);
    return;
  }

  recentMatches.forEach(matchday => {
    const whiteTeam = matchday.whiteTeam || [];
    const blackTeam = matchday.blackTeam || [];
    const inWhiteTeam = whiteTeam.some(member => member.id === player.id || member.name === player.name);
    const inBlackTeam = blackTeam.some(member => member.id === player.id || member.name === player.name);
    const played = inWhiteTeam || inBlackTeam;
    const playerTeam = inWhiteTeam ? 'white' : (inBlackTeam ? 'black' : null);
    const goals = [...(matchday.goalsListWhite || []), ...(matchday.goalsListBlack || [])];
    const goalCount = played
      ? goals.filter(goal => !goal.isOwnGoal && goal.scorer === player.name).length
      : 0;
    const assistCount = played
      ? goals.filter(goal => !goal.isOwnGoal && goal.assist === player.name && goal.scorer !== player.name).length
      : 0;
    const scoreWhite = Number(matchday.scoreWhite || 0);
    const scoreBlack = Number(matchday.scoreBlack || 0);
    const playerScore = playerTeam === 'white' ? scoreWhite : scoreBlack;
    const opponentScore = playerTeam === 'white' ? scoreBlack : scoreWhite;
    const result = !played
      ? null
      : playerScore > opponentScore ? 'V' : playerScore < opponentScore ? 'S' : 'P';
    const [year, month, day] = (matchday.rawDate || '').split('-');
    const date = year && month && day
      ? `${day}.${month}.${year.slice(-2)}`
      : (matchday.date || '--');

    const row = document.createElement('div');
    row.className = 'grid grid-cols-[40px_minmax(0,1fr)_32px_18px_18px] sm:grid-cols-[48px_minmax(0,1fr)_38px_24px_24px] md:grid-cols-[68px_minmax(0,1fr)_54px_32px_32px] items-center gap-1 rounded-md bg-white/55 px-1 py-1 text-[9px] md:text-xs font-bold text-amber-950';

    const dateCell = document.createElement('span');
    dateCell.className = 'font-mono text-[8px] md:text-[10px] text-amber-950/70';
    dateCell.textContent = date;
    row.appendChild(dateCell);

    const resultCell = document.createElement('span');
    resultCell.className = 'flex min-w-0 items-center gap-1';
    const score = document.createElement('span');
    score.className = 'truncate';
    score.textContent = `⚪ ${scoreWhite} - ${scoreBlack} ⚫`;
    resultCell.appendChild(score);
    if (result) {
      const outcome = document.createElement('span');
      outcome.className = `shrink-0 rounded px-1 text-[8px] md:text-[10px] font-black text-white ${
        result === 'V' ? 'bg-emerald-600' : result === 'S' ? 'bg-red-600' : 'bg-amber-600'
      }`;
      outcome.textContent = result;
      resultCell.appendChild(outcome);
    }
    row.appendChild(resultCell);

    const presence = document.createElement('span');
    presence.className = `rounded px-1 py-0.5 text-center text-[8px] md:text-[10px] font-black text-white ${
      played ? 'bg-emerald-600' : 'bg-red-600'
    }`;
    presence.textContent = played ? 'IN' : 'OUT';
    presence.title = played ? 'Ha giocato' : 'Non ha giocato';
    row.appendChild(presence);

    [goalCount, assistCount].forEach(count => {
      const stat = document.createElement('span');
      stat.className = 'text-center font-mono md:text-xs';
      stat.textContent = played ? String(count) : '–';
      row.appendChild(stat);
    });

    container.appendChild(row);
  });
}

function renderFutCardAvatar(player) {
  const avatars = ["⚡", "🦁", "🎯", "👑", "🔥", "🧱", "🪄", "👟"];
  const avatarEmoji = document.getElementById('fut-card-avatar');
  const avatarImage = document.getElementById('fut-card-avatar-image');
  const validAvatarImage = player.avatarImage && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(player.avatarImage);
  avatarEmoji.innerText = avatars[player.id % avatars.length];
  avatarEmoji.classList.toggle('hidden', Boolean(validAvatarImage));
  avatarImage.classList.toggle('hidden', !validAvatarImage);
  if (validAvatarImage) avatarImage.src = player.avatarImage;
  document.getElementById('fut-card-avatar-upload').classList.toggle('hidden', !isAdmin);
  document.getElementById('fut-card-avatar-remove').classList.toggle('hidden', !isAdmin || !validAvatarImage);
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
  const currentStats = p.stats || calculateDefaultFutStats(p);
  const statsWereEdited = Object.keys(newStats).some(key => newStats[key] !== currentStats[key]);

  p.ovr = newOvr;
  p.desc = newDesc;
  p.stats = newOvr !== p.ovr && !statsWereEdited
    ? calculateDefaultFutStats({ ...p, ovr: newOvr })
    : newStats;

  saveState();
  closeModals();
  renderPlayers();
  if (currentWhiteTeam.length) renderTeamsDisplay();
}

function saveFutCardAvatar(event) {
  if (!isAdmin) return;
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    window.alert('Seleziona un file immagine valido.');
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => window.alert('Non è stato possibile leggere l’immagine selezionata.');
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => window.alert('Il file selezionato non è un’immagine valida.');
    image.onload = () => {
      const maxSize = 480;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

      const player = players.find(item => item.id === currentFutPlayerId);
      if (!player) return;
      const previousImage = player.avatarImage;
      player.avatarImage = canvas.toDataURL('image/jpeg', 0.82);
      try {
        saveState();
      } catch (error) {
        player.avatarImage = previousImage;
        console.error('Impossibile salvare la foto del giocatore:', error);
        window.alert('Non è stato possibile salvare la foto. Prova con un’immagine più piccola.');
        return;
      }

      renderFutCardAvatar(player);
      if (currentWhiteTeam.length || currentBlackTeam.length) renderTeamsDisplay();
      savedMatchdays.forEach(matchday => {
        if ([...(matchday.whiteTeam || []), ...(matchday.blackTeam || [])].some(item => item.id === player.id)) {
          renderSavedMatchdayPitchIfOpen(matchday.id);
        }
      });
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function removeFutCardAvatar() {
  if (!isAdmin) return;
  const player = players.find(item => item.id === currentFutPlayerId);
  if (!player) return;
  delete player.avatarImage;
  saveState();
  renderFutCardAvatar(player);
  if (currentWhiteTeam.length || currentBlackTeam.length) renderTeamsDisplay();
}

function renderSavedMatchdayPitchIfOpen(matchdayId) {
  if (document.getElementById('modal-matchday-detail')?.classList.contains('hidden')) return;
  if (selectedMatchdayDetailId !== matchdayId) return;
  renderSavedMatchdayPitch();
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
window.addEventListener('DOMContentLoaded', async () => {
  try {
    resetGoalAssistDataOnce();
    await loadPlayers();
  } catch (error) {
    console.error('Impossibile caricare i giocatori da data.json:', error);
  }
  try {
    await loadLatestGitHubBackup();
  } catch (error) {
    console.warn('Backup condiviso GitHub non caricato; uso i dati locali disponibili:', error);
  }

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
