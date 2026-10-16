import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicialización directa con tus credenciales
const supabaseUrl = 'https://leefqaybpzrvogrvvxky.supabase.co';
const supabaseAnonKey = 'sb_publishable_7jAJjRt4I_zZs32LaByU2g_Vt7HY6PI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const POSICIONES_POR_CATEGORIA = {
  POR: ['POR'],
  DEF: ['DFC', 'LD', 'LI', 'DFCI', 'DFCD'],
  MED: ['MI', 'MD', 'MC', 'MCO', 'MCD'],
  DEL: ['DC', 'MP', 'EXI', 'EXD']
};

const POSICIONES = [
  { categoria: 'Portero', opciones: ['POR'] },
  { categoria: 'Defensas', opciones: ['DFC', 'LD', 'LI', 'DFCI', 'DFCD'] },
  { categoria: 'Medios', opciones: ['MI', 'MD', 'MC', 'MCO', 'MCD'] },
  { categoria: 'Delanteros', opciones: ['DC', 'MP', 'EXI', 'EXD'] }
];

const estadoInicialJugador = {
  id: null,
  name: '',
  jersey_number: 10,
  age: 25,
  position_primary: 'DC',
  position_secondary: 'MP',
  foot: 'Diestro',
  height: 1.75,
  weight: 70,
  is_captain: false,
  pace: 75,
  shooting: 75,
  passing: 75,
  dribbling: 75,
  technique: 75,
  goals: 0,
  yellow_cards: 0,
  red_cards: 0,
  absences: 0,
};

const estadoInicialPartido = {
  id: null,
  rival: '',
  match_date: '',
  match_time: '23:30',
  location: '',
  referee_cost: 600,
  status: 'scheduled',
  goals_club: 0,
  goals_rival: 0,
};

const ESTRUCTURA_FORMACIONES = {
  'fut7-1321': { def: ['LI', 'DFC', 'LD'], med: ['MC', 'MC'], del: ['DC'] },
  'fut7-1231': { def: ['LI', 'LD'], med: ['MI', 'MC', 'MD'], del: ['DC'] },
  'fut9-1332': { def: ['LI', 'DFC', 'LD'], med: ['MC', 'MC', 'MCO'], del: ['DC', 'DC'] },
  'fut9-1341': { def: ['LI', 'DFC', 'LD'], med: ['MI', 'MC', 'MC', 'MD'], del: ['DC'] },
  'fut10-1333': { def: ['LI', 'DFC', 'LD'], med: ['MC', 'MC', 'MCO'], del: ['EXI', 'DC', 'EXD'] },
  'fut10-1432': { def: ['LI', 'DFC', 'DFC', 'LD'], med: ['MC', 'MC', 'MCO'], del: ['DC', 'DC'] },
  'fut11-1442': { def: ['LI', 'DFC', 'DFC', 'LD'], med: ['MI', 'MC', 'MC', 'MD'], del: ['DC', 'DC'] },
  'fut11-1433': { def: ['LI', 'DFC', 'DFC', 'LD'], med: ['MC', 'MC', 'MCO'], del: ['EXI', 'DC', 'EXD'] },
};

const fichasInicialesLibres = [
  { id: 'f-1', posLabel: 'POR', category: 'POR', top: 88, left: 50, playerId: '' },
  { id: 'f-2', posLabel: 'LI', category: 'DEF', top: 72, left: 18, playerId: '' },
  { id: 'f-3', posLabel: 'DFC', category: 'DEF', top: 75, left: 38, playerId: '' },
  { id: 'f-4', posLabel: 'DFC', category: 'DEF', top: 75, left: 62, playerId: '' },
  { id: 'f-5', posLabel: 'LD', category: 'DEF', top: 72, left: 82, playerId: '' },
  { id: 'f-6', posLabel: 'MI', category: 'MED', top: 48, left: 20, playerId: '' },
  { id: 'f-7', posLabel: 'MC', category: 'MED', top: 50, left: 40, playerId: '' },
  { id: 'f-8', posLabel: 'MC', category: 'MED', top: 50, left: 60, playerId: '' },
  { id: 'f-9', posLabel: 'MD', category: 'MED', top: 48, left: 80, playerId: '' },
  { id: 'f-10', posLabel: 'DC', category: 'DEL', top: 22, left: 38, playerId: '' },
  { id: 'f-11', posLabel: 'DC', category: 'DEL', top: 22, left: 62, playerId: '' },
];

export default function App() {
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('inicio');
  const [club, setClub] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isEditingMatch, setIsEditingMatch] = useState(false);
  const [showCaptainPasswordModal, setShowCaptainPasswordModal] = useState(false);
  const [captainPasswordInput, setCaptainPasswordInput] = useState('');

  // Modal Cierre de Partido
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [matchToFinish, setMatchToFinish] = useState(null);
  const [finishGoalsClub, setFinishGoalsClub] = useState(0);
  const [finishGoalsRival, setFinishGoalsRival] = useState(0);
  const [finishPlayerData, setFinishPlayerData] = useState({});

  // Formularios
  const [playerForm, setPlayerForm] = useState(estadoInicialJugador);
  const [matchForm, setMatchForm] = useState(estadoInicialPartido);
  const [selectedPlayerForAttendance, setSelectedPlayerForAttendance] = useState('');
  
  // Táctica
  const [selectedMatchForTactics, setSelectedMatchForTactics] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('fut7-1321');
  const [newCustomCategory, setNewCustomCategory] = useState('MED');
  const [lineupAssigned, setLineupAssigned] = useState({});
  const [customTokens, setCustomTokens] = useState(fichasInicialesLibres);
  const [draggingTokenId, setDraggingTokenId] = useState(null);
  const fieldRef = useRef(null);

  // Oficina
  const [selectedMatchForOffice, setSelectedMatchForOffice] = useState('');
  const [refereeCostInput, setRefereeCostInput] = useState(600);
  const [paymentsState, setPaymentsState] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: clubData } = await supabase.from('clubs').select('*').limit(1).maybeSingle();
    if (clubData) setClub(clubData);

    const { data: playersData } = await supabase.from('players').select('*').order('created_at', { ascending: false });
    if (playersData) {
      setPlayers(playersData);
      if (playersData.length > 0) setSelectedPlayerForAttendance(playersData[0].id);
    }

    const { data: matchesData } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
    if (matchesData) {
      setMatches(matchesData);
      if (matchesData.length > 0) {
        setSelectedMatchForTactics(matchesData[0].id);
        setSelectedMatchForOffice(matchesData[0].id);
        setRefereeCostInput(matchesData[0].referee_cost || 600);
      }
    }

    const { data: attendancesData } = await supabase.from('match_attendances').select('*');
    if (attendancesData) setAttendances(attendancesData);

    setLoading(false);
  }

  const isCaptain = currentUserRole === 'captain';
  const loggedPlayer = !isCaptain && currentUserRole ? players.find((p) => String(p.id) === String(currentUserRole)) : null;

  // Validación de Contraseña de Capitán
  const handleVerifyCaptainPassword = (e) => {
    e.preventDefault();
    if (captainPasswordInput === 'RealBetis10') {
      setCurrentUserRole('captain');
      setShowCaptainPasswordModal(false);
      setCaptainPasswordInput('');
    } else {
      alert('Contraseña incorrecta.');
    }
  };

  const formatMatchDateTime = (rawDateStr) => {
    if (!rawDateStr) return { dateStr: 'Por definir', timeStr: '--:--' };
    const cleanStr = rawDateStr.replace('T', ' ');
    const parts = cleanStr.split(' ');
    const datePart = parts[0] || '';
    const dateComponents = datePart.split('-');
    let formattedDate = datePart;
    if (dateComponents.length === 3) {
      formattedDate = `${dateComponents[2]}/${dateComponents[1]}/${dateComponents[0]}`;
    }
    let formattedTime = '23:30';
    if (parts[1]) {
      const timeComponents = parts[1].split(':');
      if (timeComponents.length >= 2) formattedTime = `${timeComponents[0]}:${timeComponents[1]}`;
    }
    return { dateStr: formattedDate, timeStr: formattedTime };
  };

  const calculateOVR = (p) => Math.round(((p.pace || 75) + (p.shooting || 75) + (p.passing || 75) + (p.dribbling || 75) + (p.technique || 75)) / 5);

  const isStatusConfirmed = (status) => {
    if (status === true || status === 1 || status === '1') return true;
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s.includes('confirm') || s.includes('presente') || s === 'si' || s === 'true';
  };

  const isStatusDeclined = (status) => {
    if (status === false || status === 0 || status === '0') return true;
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s.includes('declin') || s.includes('rechaz') || s.includes('ausente') || s === 'no' || s === 'false';
  };

  // CIERRE DE PARTIDO
  const handleOpenFinishMatchModal = (match) => {
    setMatchToFinish(match);
    setFinishGoalsClub(match.goals_club || 0);
    setFinishGoalsRival(match.goals_rival || 0);

    const initialData = {};
    players.forEach((p) => {
      initialData[p.id] = {
        goals: 0,
        yellow_cards: 0,
        red_cards: 0,
        absences: 0,
        matchRating: calculateOVR(p),
      };
    });
    setFinishPlayerData(initialData);
    setShowFinishMatchModal(true);
  };

  async function handleSaveFinishedMatch(e) {
    e.preventDefault();
    if (!matchToFinish) return;

    const { error: matchErr } = await supabase
      .from('matches')
      .update({
        status: 'finished',
        goals_club: parseInt(finishGoalsClub),
        goals_rival: parseInt(finishGoalsRival)
      })
      .eq('id', matchToFinish.id);

    if (matchErr) {
      alert('Error al guardar partido: ' + matchErr.message);
      return;
    }

    for (const player of players) {
      const pStats = finishPlayerData[player.id];
      if (pStats) {
        const newGoals = (player.goals || 0) + parseInt(pStats.goals || 0);
        const newYellow = (player.yellow_cards || 0) + parseInt(pStats.yellow_cards || 0);
        const newRed = (player.red_cards || 0) + parseInt(pStats.red_cards || 0);
        const newAbsences = (player.absences || 0) + parseInt(pStats.absences || 0);

        const newRating = parseInt(pStats.matchRating || calculateOVR(player));
        const updatedPace = Math.min(99, Math.max(1, Math.round(((player.pace || 75) + newRating) / 2)));
        const updatedShooting = Math.min(99, Math.max(1, Math.round(((player.shooting || 75) + newRating) / 2)));
        const updatedPassing = Math.min(99, Math.max(1, Math.round(((player.passing || 75) + newRating) / 2)));
        const updatedDribbling = Math.min(99, Math.max(1, Math.round(((player.dribbling || 75) + newRating) / 2)));
        const updatedTechnique = Math.min(99, Math.max(1, Math.round(((player.technique || 75) + newRating) / 2)));

        await supabase
          .from('players')
          .update({
            goals: newGoals,
            yellow_cards: newYellow,
            red_cards: newRed,
            absences: newAbsences,
            pace: updatedPace,
            shooting: updatedShooting,
            passing: updatedPassing,
            dribbling: updatedDribbling,
            technique: updatedTechnique,
          })
          .eq('id', player.id);
      }
    }

    setShowFinishMatchModal(false);
    fetchData();
  }

  // JUGADORES
  const handleOpenCreatePlayerModal = () => {
    setIsEditingPlayer(false);
    setPlayerForm(estadoInicialJugador);
    setShowPlayerModal(true);
  };

  const handleOpenEditPlayerModal = (player) => {
    setIsEditingPlayer(true);
    setPlayerForm({
      id: player.id,
      name: player.name || '',
      jersey_number: player.jersey_number || 10,
      age: player.age || 25,
      position_primary: player.position_primary || 'DC',
      position_secondary: player.position_secondary || '',
      foot: player.foot || 'Diestro',
      height: player.height || 1.75,
      weight: player.weight || 70,
      is_captain: player.is_captain || false,
      pace: player.pace || 75,
      shooting: player.shooting || 75,
      passing: player.passing || 75,
      dribbling: player.dribbling || 75,
      technique: player.technique || 75,
      goals: player.goals || 0,
      yellow_cards: player.yellow_cards || 0,
      red_cards: player.red_cards || 0,
      absences: player.absences || 0,
    });
    setShowPlayerModal(true);
  };

  async function handleSavePlayer(e) {
    e.preventDefault();
    if (!playerForm.name.trim()) return;

    let payload;
    if (isCaptain) {
      payload = {
        name: playerForm.name,
        jersey_number: parseInt(playerForm.jersey_number) || 10,
        position_primary: playerForm.position_primary,
        position_secondary: playerForm.position_secondary || null,
        foot: playerForm.foot,
        club_id: club ? club.id : null,
        age: parseInt(playerForm.age),
        height: parseFloat(playerForm.height),
        weight: parseFloat(playerForm.weight),
        is_captain: playerForm.is_captain,
        pace: parseInt(playerForm.pace),
        shooting: parseInt(playerForm.shooting),
        passing: parseInt(playerForm.passing),
        dribbling: parseInt(playerForm.dribbling),
        technique: parseInt(playerForm.technique),
        goals: parseInt(playerForm.goals || 0),
        yellow_cards: parseInt(playerForm.yellow_cards || 0),
        red_cards: parseInt(playerForm.red_cards || 0),
        absences: parseInt(playerForm.absences || 0),
      };
    } else {
      payload = {
        name: playerForm.name,
        jersey_number: parseInt(playerForm.jersey_number) || 10,
        age: parseInt(playerForm.age),
        position_primary: playerForm.position_primary,
        position_secondary: playerForm.position_secondary || null,
        foot: playerForm.foot,
      };
    }

    if (isEditingPlayer) {
      const { data, error } = await supabase.from('players').update(payload).eq('id', playerForm.id).select();
      if (error) alert('Error: ' + error.message);
      else if (data && data.length > 0) {
        setPlayers((prev) => prev.map((p) => (p.id === playerForm.id ? data[0] : p)));
        setShowPlayerModal(false);
      }
    } else if (isCaptain) {
      const { data, error } = await supabase.from('players').insert([payload]).select();
      if (error) alert('Error: ' + error.message);
      else if (data && data.length > 0) {
        setPlayers((prev) => [data[0], ...prev]);
        setShowPlayerModal(false);
      }
    }
  }

  async function handleDeletePlayer(id, name) {
    if (!isCaptain) return;
    if (!window.confirm(`¿Eliminar a ${name}?`)) return;
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  // PARTIDOS
  const handleOpenCreateMatchModal = () => {
    if (!isCaptain) return;
    setIsEditingMatch(false);
    setMatchForm(estadoInicialPartido);
    setShowMatchModal(true);
  };

  const handleOpenEditMatchModal = (match) => {
    if (!isCaptain) return;
    setIsEditingMatch(true);
    const cleanStr = (match.match_date || '').replace('T', ' ');
    const parts = cleanStr.split(' ');
    setMatchForm({
      id: match.id,
      rival: match.rival || '',
      match_date: parts[0] || '',
      match_time: parts[1] ? parts[1].substring(0, 5) : '23:30',
      location: match.location || '',
      referee_cost: match.referee_cost || 600,
      status: match.status || 'scheduled',
      goals_club: match.goals_club || 0,
      goals_rival: match.goals_rival || 0,
    });
    setShowMatchModal(true);
  };

  async function handleSaveMatch(e) {
    e.preventDefault();
    if (!isCaptain) return;
    if (!matchForm.rival.trim()) return;
    const dateStr = matchForm.match_time ? `${matchForm.match_date} ${matchForm.match_time}` : matchForm.match_date;
    const payload = {
      club_id: club ? club.id : null,
      rival: matchForm.rival,
      match_date: dateStr,
      location: matchForm.location || 'Por definir',
      referee_cost: parseFloat(matchForm.referee_cost) || 600,
      status: matchForm.status || 'scheduled',
      goals_club: parseInt(matchForm.goals_club) || 0,
      goals_rival: parseInt(matchForm.goals_rival) || 0,
    };

    if (isEditingMatch) {
      const { data, error } = await supabase.from('matches').update(payload).eq('id', matchForm.id).select();
      if (error) alert('Error: ' + error.message);
      else if (data && data.length > 0) {
        setMatches((prev) => prev.map((m) => (m.id === matchForm.id ? data[0] : m)));
        setShowMatchModal(false);
        setMatchForm(estadoInicialPartido);
      }
    } else {
      const { data, error } = await supabase.from('matches').insert([payload]).select();
      if (error) alert('Error: ' + error.message);
      else if (data && data.length > 0) {
        setMatches((prev) => [data[0], ...prev]);
        setShowMatchModal(false);
        setMatchForm(estadoInicialPartido);
        if (!selectedMatchForTactics) setSelectedMatchForTactics(data[0].id);
        if (!selectedMatchForOffice) setSelectedMatchForOffice(data[0].id);
      }
    }
  }

  async function handleDeleteMatch(id, rival) {
    if (!isCaptain) return;
    if (!window.confirm(`¿Eliminar partido contra ${rival}?`)) return;
    const { error } = await supabase.from('matches').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleToggleAttendance(matchId, isConfirming) {
    const targetPlayerId = isCaptain ? selectedPlayerForAttendance : loggedPlayer?.id;
    if (!targetPlayerId) {
      alert('Selecciona o identifica un jugador.');
      return;
    }
    const statusVal = isConfirming ? 'confirmed' : 'declined';
    const existingIndex = attendances.findIndex((a) => a.match_id === matchId && a.player_id === targetPlayerId);
    let updatedAttendances = [...attendances];
    if (existingIndex >= 0) {
      updatedAttendances[existingIndex] = { ...updatedAttendances[existingIndex], status: statusVal };
    } else {
      updatedAttendances.push({ id: 'temp-' + Date.now(), match_id: matchId, player_id: targetPlayerId, status: statusVal });
    }
    setAttendances(updatedAttendances);

    const existing = attendances.find((a) => a.match_id === matchId && a.player_id === targetPlayerId);
    let res;
    if (existing && !String(existing.id).startsWith('temp-')) {
      res = await supabase.from('match_attendances').update({ status: statusVal }).eq('id', existing.id).select();
    } else {
      res = await supabase.from('match_attendances').insert([{ match_id: matchId, player_id: targetPlayerId, status: statusVal }]).select();
    }
    if (res.data && res.data.length > 0) {
      const saved = res.data[0];
      setAttendances((prev) => prev.map((a) => (a.match_id === matchId && a.player_id === targetPlayerId ? saved : a)));
    }
  }

  const handleAssignSlotPlayer = (slotKey, playerId) => {
    if (!isCaptain) return;
    setLineupAssigned((prev) => ({ ...prev, [slotKey]: playerId }));
  };

  const handleSlotPosChange = (slotKey, newPos) => {
    if (!isCaptain) return;
    setLineupAssigned((prev) => ({
      ...prev,
      [`pos_${slotKey}`]: newPos
    }));
  };

  // Arrastre Táctica
  const handleTouchOrMouseDown = (tokenId) => {
    if (!isCaptain) return;
    setDraggingTokenId(tokenId);
  };

  const handleFieldMouseMove = (e) => {
    if (!isCaptain || !draggingTokenId || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const leftPercent = Math.max(8, Math.min(92, (x / rect.width) * 100));
    const topPercent = Math.max(8, Math.min(92, (y / rect.height) * 100));
    setCustomTokens((prev) => prev.map((t) => (t.id === draggingTokenId ? { ...t, top: topPercent, left: leftPercent } : t)));
  };

  const handleMouseUpOrLeave = () => setDraggingTokenId(null);

  const handleAddCustomToken = () => {
    if (!isCaptain) return;
    const defaultLabel = POSICIONES_POR_CATEGORIA[newCustomCategory]?.[0] || 'MC';
    const newToken = {
      id: 'f-' + Date.now(),
      posLabel: defaultLabel,
      category: newCustomCategory,
      top: newCustomCategory === 'POR' ? 88 : newCustomCategory === 'DEF' ? 70 : newCustomCategory === 'MED' ? 48 : 22,
      left: 50,
      playerId: ''
    };
    setCustomTokens((prev) => [...prev, newToken]);
  };

  const handleRemoveCustomToken = (tokenId) => {
    if (!isCaptain) return;
    setCustomTokens((prev) => prev.filter((t) => t.id !== tokenId));
  };

  const handleUpdateCustomTokenPlayer = (tokenId, playerId) => {
    if (!isCaptain) return;
    setCustomTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, playerId } : t)));
  };

  const handleChangeCustomTokenPos = (tokenId, newPos) => {
    if (!isCaptain) return;
    let cat = 'MED';
    if (newPos === 'POR') cat = 'POR';
    else if (POSICIONES_POR_CATEGORIA.DEF.includes(newPos)) cat = 'DEF';
    else if (POSICIONES_POR_CATEGORIA.MED.includes(newPos)) cat = 'MED';
    else if (POSICIONES_POR_CATEGORIA.DEL.includes(newPos)) cat = 'DEL';

    setCustomTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, posLabel: newPos, category: cat } : t))
    );
  };

  const renderDynamicSlot = (slotKey, defaultPos, categoryKey) => {
    const currentPos = lineupAssigned[`pos_${slotKey}`] || defaultPos;
    const assignedPlayerId = lineupAssigned[slotKey] || '';
    const assignedPlayer = players.find((p) => String(p.id) === String(assignedPlayerId));
    const allowedOptions = POSICIONES_POR_CATEGORIA[categoryKey] || POSICIONES_POR_CATEGORIA.MED;

    return (
      <div key={slotKey} className="flex flex-col items-center relative group">
        {isCaptain && (
          <select
            value={assignedPlayerId}
            onChange={(e) => handleAssignSlotPlayer(slotKey, e.target.value)}
            className="absolute inset-x-0 top-6 w-full h-10 opacity-0 cursor-pointer z-30"
          >
            <option value="" className="bg-gray-900 text-gray-400">-- Sin asignar --</option>
            {players.map((p) => (
              <option key={p.id} value={p.id} className="bg-gray-900 text-white font-bold">
                #{p.jersey_number || 10} {p.name} ({p.position_primary})
              </option>
            ))}
          </select>
        )}

        {isCaptain ? (
          <select
            value={currentPos}
            onChange={(e) => handleSlotPosChange(slotKey, e.target.value)}
            title="Cambiar posición"
            className="bg-black/80 text-emerald-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/50 mb-1 z-20 cursor-pointer"
          >
            {allowedOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-gray-900 text-white">{opt}</option>
            ))}
          </select>
        ) : (
          <span className="bg-black/80 text-emerald-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/50 mb-1">
            {currentPos}
          </span>
        )}

        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-xl transition-all ${
          assignedPlayer ? 'bg-emerald-500 border-white text-black scale-105' : 'bg-gray-900/90 border-emerald-500/60 text-emerald-400'
        }`}>
          {assignedPlayer ? `#${assignedPlayer.jersey_number || 10}` : currentPos}
        </div>

        <span className="text-[9px] font-bold bg-black/80 px-1.5 py-0.5 rounded text-gray-200 mt-1">
          {assignedPlayer ? assignedPlayer.name : 'Vacío'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans antialiased pb-12">
      {/* HEADER PRINCIPAL */}
      <header className="bg-gray-900/80 backdrop-blur border-b border-gray-800 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-black shadow-lg shadow-emerald-500/20">
            PG
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-none text-white">
              {club ? club.name : 'PlayGame'}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">
              {currentUserRole === 'captain' ? 'Modo Capitán' : loggedPlayer ? `Jugador: ${loggedPlayer.name}` : 'Modo Espectador'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {currentUserRole === 'captain' ? (
            <button
              onClick={() => setCurrentUserRole(null)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg border border-gray-700 font-semibold transition"
            >
              Salir Capitán
            </button>
          ) : (
            <button
              onClick={() => setShowCaptainPasswordModal(true)}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold transition"
            >
              Acceso Capitán
            </button>
          )}
        </div>
      </header>

      {/* NAVEGACIÓN PRINCIPAL */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-2 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {[
            { id: 'inicio', label: 'Inicio' },
            { id: 'plantilla', label: 'Plantilla' },
            { id: 'partidos', label: 'Partidos' },
            { id: 'tactica', label: 'Pizarra Táctica' },
            { id: 'oficina', label: 'Oficina' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold">Cargando datos de PlayGame...</p>
          </div>
        ) : (
          <>
            {/* PESTAÑA INICIO */}
            {activeTab === 'inicio' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/20 border border-emerald-500/30 rounded-2xl p-6">
                  <h2 className="text-xl font-black text-white mb-1">¡Bienvenido a PlayGame!</h2>
                  <p className="text-xs text-gray-300">
                    Administra tu club amateur, controla asistencias, arma tus alineaciones tácticas y gestiona los pagos del equipo.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                    <p className="text-xs text-gray-400">Jugadores</p>
                    <p className="text-2xl font-black text-emerald-400">{players.length}</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                    <p className="text-xs text-gray-400">Partidos</p>
                    <p className="text-2xl font-black text-teal-400">{matches.length}</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                    <p className="text-xs text-gray-400">Capitán</p>
                    <p className="text-sm font-bold text-white mt-1">{isCaptain ? 'Activo' : 'No'}</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                    <p className="text-xs text-gray-400">Estado Liga</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">En Competencia</p>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA PLANTILLA */}
            {activeTab === 'plantilla' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white">Jugadores del Club</h2>
                  {isCaptain && (
                    <button
                      onClick={handleOpenCreatePlayerModal}
                      className="bg-emerald-500 text-black px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-400 transition"
                    >
                      + Nuevo Jugador
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {players.map((p) => (
                    <div key={p.id} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400">
                          #{p.jersey_number || 10}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{p.name}</h3>
                          <p className="text-xs text-gray-400">{p.position_primary} • OVR {calculateOVR(p)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditPlayerModal(p)}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-700"
                        >
                          Editar
                        </button>
                        {isCaptain && (
                          <button
                            onClick={() => handleDeletePlayer(p.id, p.name)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-lg border border-red-500/30"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PESTAÑA PARTIDOS */}
            {activeTab === 'partidos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white">Calendario de Partidos</h2>
                  {isCaptain && (
                    <button
                      onClick={handleOpenCreateMatchModal}
                      className="bg-emerald-500 text-black px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-400 transition"
                    >
                      + Agendar Partido
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {matches.map((m) => {
                    const { dateStr, timeStr } = formatMatchDateTime(m.match_date);
                    return (
                      <div key={m.id} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-emerald-400 px-2 py-0.5 rounded">
                            {m.status === 'finished' ? 'Finalizado' : 'Programado'}
                          </span>
                          <h3 className="font-black text-base text-white mt-1">vs {m.rival}</h3>
                          <p className="text-xs text-gray-400">{dateStr} a las {timeStr} hrs • {m.location}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {m.status !== 'finished' && isCaptain && (
                            <button
                              onClick={() => handleOpenFinishMatchModal(m)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 font-bold"
                            >
                              Cerrar Partido
                            </button>
                          )}
                          {isCaptain && (
                            <>
                              <button
                                onClick={() => handleOpenEditMatchModal(m)}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-2.5 py-1.5 rounded-lg border border-gray-700"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteMatch(m.id, m.rival)}
                                className="bg-red-500/10 text-red-400 text-xs px-2 py-1.5 rounded-lg border border-red-500/30"
                              >
                                ×
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PESTAÑA TÁCTICA */}
            {activeTab === 'tactica' && (
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                  <h2 className="text-lg font-black text-white mb-2">Pizarra Táctica interactiva</h2>
                  <p className="text-xs text-gray-400 mb-4">Alinea a tu equipo y ajusta las posiciones arrastrando o seleccionando fichas.</p>
                  
                  <div
                    ref={fieldRef}
                    onMouseMove={handleFieldMouseMove}
                    onTouchMove={handleFieldMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onTouchEnd={handleMouseUpOrLeave}
                    className="w-full h-96 bg-emerald-800/40 rounded-2xl border-2 border-emerald-500/40 relative overflow-hidden flex items-center justify-center select-none"
                  >
                    <div className="absolute inset-x-0 top-1/2 border-t-2 border-emerald-500/30"></div>
                    <div className="w-28 h-28 border-2 border-emerald-500/30 rounded-full absolute"></div>
                    
                    {customTokens.map((t) => {
                      const assignedP = players.find((p) => String(p.id) === String(t.playerId));
                      return (
                        <div
                          key={t.id}
                          onMouseDown={() => handleTouchOrMouseDown(t.id)}
                          onTouchStart={() => handleTouchOrMouseDown(t.id)}
                          style={{ top: `${t.top}%`, left: `${t.left}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing flex flex-col items-center"
                        >
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                            assignedP ? 'bg-emerald-400 border-white text-black' : 'bg-gray-900 border-emerald-400 text-emerald-400'
                          }`}>
                            {assignedP ? `#${assignedP.jersey_number || 10}` : t.posLabel}
                          </div>
                          <span className="text-[9px] bg-black/80 text-white px-1 rounded mt-0.5 whitespace-nowrap">
                            {assignedP ? assignedP.name : t.posLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA OFICINA */}
            {activeTab === 'oficina' && (
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
                <h2 className="text-lg font-black text-white">Administración y Finanzas</h2>
                <p className="text-xs text-gray-400">Control de cuotas arbitrales y aportaciones de los jugadores.</p>
                <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400">Costo promedio de arbitraje:</p>
                  <p className="text-xl font-black text-emerald-400">${refereeCostInput} MXN</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL CONTRASEÑA CAPITÁN */}
      {showCaptainPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleVerifyCaptainPassword} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-xs w-full space-y-4">
            <h3 className="font-extrabold text-base text-white">Ingresa como Capitán</h3>
            <input
              type="password"
              placeholder="Contraseña"
              value={captainPasswordInput}
              onChange={(e) => setCaptainPasswordInput(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowCaptainPasswordModal(false)}
                className="w-1/2 bg-gray-800 text-gray-300 py-2 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 bg-emerald-500 text-black py-2 rounded-xl text-xs font-bold"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
