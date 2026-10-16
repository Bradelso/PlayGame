import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicialización de Supabase
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
  'fut7-1321': { name: 'Fut 7 (1-3-2-1)', def: ['LI', 'DFC', 'LD'], med: ['MC', 'MC'], del: ['DC'] },
  'fut7-1231': { name: 'Fut 7 (1-2-3-1)', def: ['LI', 'LD'], med: ['MI', 'MC', 'MD'], del: ['DC'] },
  'fut9-1332': { name: 'Fut 9 (1-3-3-2)', def: ['LI', 'DFC', 'LD'], med: ['MC', 'MC', 'MCO'], del: ['DC', 'DC'] },
  'fut9-1341': { name: 'Fut 9 (1-3-4-1)', def: ['LI', 'DFC', 'LD'], med: ['MI', 'MC', 'MC', 'MD'], del: ['DC'] },
  'fut10-1333': { name: 'Fut 10 (1-3-3-3)', def: ['LI', 'DFC', 'LD'], med: ['MC', 'MC', 'MCO'], del: ['EXI', 'DC', 'EXD'] },
  'fut10-1432': { name: 'Fut 10 (1-4-3-2)', def: ['LI', 'DFC', 'DFC', 'LD'], med: ['MC', 'MC', 'MCO'], del: ['DC', 'DC'] },
  'fut11-1442': { name: 'Fut 11 (1-4-4-2)', def: ['LI', 'DFC', 'DFC', 'LD'], med: ['MI', 'MC', 'MC', 'MD'], del: ['DC', 'DC'] },
  'fut11-1433': { name: 'Fut 11 (1-4-3-3)', def: ['LI', 'DFC', 'DFC', 'LD'], med: ['MC', 'MC', 'MCO'], del: ['EXI', 'DC', 'EXD'] },
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
  const [currentUserRole, setCurrentUserRole] = useState(null); // 'captain' | player_id | null
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
  const [selectedPlayerStatsModal, setSelectedPlayerStatsModal] = useState(null);

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
  const [selectedFormation, setSelectedFormation] = useState('fut7-1321');
  const [useFreeBoard, setUseFreeBoard] = useState(false);
  const [lineupAssigned, setLineupAssigned] = useState({});
  const [customTokens, setCustomTokens] = useState(fichasInicialesLibres);
  const [newCustomCategory, setNewCustomCategory] = useState('MED');
  const [draggingTokenId, setDraggingTokenId] = useState(null);
  const fieldRef = useRef(null);

  // Oficina
  const [refereeCostInput, setRefereeCostInput] = useState(600);

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
      if (matchesData.length > 0) setRefereeCostInput(matchesData[0].referee_cost || 600);
    }

    const { data: attendancesData } = await supabase.from('match_attendances').select('*');
    if (attendancesData) setAttendances(attendancesData);

    setLoading(false);
  }

  const isCaptain = currentUserRole === 'captain';
  const loggedPlayer = !isCaptain && currentUserRole ? players.find((p) => String(p.id) === String(currentUserRole)) : null;

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

  const getGoogleMapsUrl = (location) => {
    if (!location) return 'https://maps.google.com';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  // Cierre de partido
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

  // Jugadores
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

    let payload = {
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

    if (isEditingPlayer) {
      const { data, error } = await supabase.from('players').update(payload).eq('id', playerForm.id).select();
      if (error) alert('Error: ' + error.message);
      else if (data && data.length > 0) {
        setPlayers((prev) => prev.map((p) => (p.id === playerForm.id ? data[0] : p)));
        setShowPlayerModal(false);
      }
    } else {
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

  // Partidos
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

  // Asistencias
  async function handleToggleAttendance(matchId, isConfirming) {
    const targetPlayerId = isCaptain ? selectedPlayerForAttendance : loggedPlayer?.id;
    if (!targetPlayerId) {
      alert('Selecciona o identifica tu jugador.');
      return;
    }
    const statusVal = isConfirming ? 'confirmed' : 'declined';
    const existingIndex = attendances.findIndex((a) => String(a.match_id) === String(matchId) && String(a.player_id) === String(targetPlayerId));
    let updatedAttendances = [...attendances];
    
    if (existingIndex >= 0) {
      updatedAttendances[existingIndex] = { ...updatedAttendances[existingIndex], status: statusVal };
    } else {
      updatedAttendances.push({ id: 'temp-' + Date.now(), match_id: matchId, player_id: targetPlayerId, status: statusVal });
    }
    setAttendances(updatedAttendances);

    const existing = attendances.find((a) => String(a.match_id) === String(matchId) && String(a.player_id) === String(targetPlayerId));
    let res;
    if (existing && !String(existing.id).startsWith('temp-')) {
      res = await supabase.from('match_attendances').update({ status: statusVal }).eq('id', existing.id).select();
    } else {
      res = await supabase.from('match_attendances').insert([{ match_id: matchId, player_id: targetPlayerId, status: statusVal }]).select();
    }
    if (res.data && res.data.length > 0) {
      const saved = res.data[0];
      setAttendances((prev) => prev.map((a) => (String(a.match_id) === String(matchId) && String(a.player_id) === String(targetPlayerId) ? saved : a)));
    }
  }

  // Táctica
  const handleAssignSlotPlayer = (slotKey, playerId) => {
    if (!isCaptain) return;
    setLineupAssigned((prev) => ({ ...prev, [slotKey]: playerId }));
  };

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

  const nextMatch = matches.find((m) => m.status !== 'finished') || matches[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans antialiased pb-12 select-none">
      {/* PANTALLA DE SELECCIÓN DE ACCESO / ROL INICIAL */}
      {!currentUserRole ? (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-2xl text-black mx-auto shadow-lg shadow-emerald-500/20">
              PG
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">PlayGame</h1>
              <p className="text-xs text-gray-400 mt-1">Selecciona tu perfil para ingresar al panel del equipo</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-left space-y-2">
                <label className="text-xs font-bold text-gray-300 block">Soy Jugador:</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) setCurrentUserRole(e.target.value);
                  }}
                  defaultValue=""
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-emerald-400 font-bold focus:outline-none"
                >
                  <option value="" disabled>-- Elige tu nombre --</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.jersey_number || 10} {p.name} ({p.position_primary})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-gray-500">O bien</span>
                <div className="flex-grow border-t border-gray-800"></div>
              </div>

              <button
                onClick={() => setShowCaptainPasswordModal(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition text-sm"
              >
                Soy Capitán (Ingresar Clave)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
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
                  {isCaptain ? 'Modo Capitán' : loggedPlayer ? `Jugador: ${loggedPlayer.name}` : 'Espectador'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentUserRole(null)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg border border-gray-700 font-semibold transition"
              >
                Cambiar Rol
              </button>
            </div>
          </header>

          {/* BARRA DE NAVEGACIÓN */}
          <nav className="bg-gray-900 border-b border-gray-800 px-4 py-2 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              {[
                { id: 'inicio', label: 'Inicio' },
                { id: 'plantilla', label: 'Plantilla y Stats' },
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

          {/* CONTENIDO PRINCIPAL */}
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
                    {/* PRÓXIMO PARTIDO CARD DESTACADO */}
                    {nextMatch ? (
                      <div className="bg-gradient-to-br from-emerald-950/60 via-gray-900 to-gray-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                            Próximo Partido
                          </span>
                          <span className="text-xs text-gray-400 font-bold">
                            {formatMatchDateTime(nextMatch.match_date).dateStr} • {formatMatchDateTime(nextMatch.match_date).timeStr} hrs
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rival</p>
                          <h2 className="text-2xl font-black text-white">vs {nextMatch.rival}</h2>
                        </div>

                        {/* UBICACIÓN CON ENLACE GOOGLE MAPS */}
                        <div className="flex items-center justify-between bg-gray-950/60 p-3.5 rounded-2xl border border-gray-800">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">📍</span>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Cancha / Ubicación</p>
                              <p className="text-xs font-bold text-white">{nextMatch.location || 'Por definir'}</p>
                            </div>
                          </div>
                          <a
                            href={getGoogleMapsUrl(nextMatch.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold transition flex items-center space-x-1"
                          >
                            <span>Abrir Maps 🗺️</span>
                          </a>
                        </div>

                        {/* CONFIRMACIÓN DE ASISTENCIA */}
                        <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-300">
                              {isCaptain ? 'Confirmación para Jugador Seleccionado:' : `Confirmar Asistencia (${loggedPlayer?.name || 'Jugador'}):`}
                            </p>
                            {isCaptain && (
                              <select
                                value={selectedPlayerForAttendance}
                                onChange={(e) => setSelectedPlayerForAttendance(e.target.value)}
                                className="bg-gray-900 border border-gray-700 text-xs text-emerald-400 font-bold px-2 py-1 rounded-lg"
                              >
                                {players.map((p) => (
                                  <option key={p.id} value={p.id}>#{p.jersey_number} {p.name}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          {(() => {
                            const activePlayerId = isCaptain ? selectedPlayerForAttendance : loggedPlayer?.id;
                            const att = attendances.find((a) => String(a.match_id) === String(nextMatch.id) && String(a.player_id) === String(activePlayerId));
                            const isConfirmed = att?.status === 'confirmed';
                            const isDeclined = att?.status === 'declined';

                            return (
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleToggleAttendance(nextMatch.id, true)}
                                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${
                                    isConfirmed
                                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                                      : 'bg-gray-900 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  {isConfirmed ? '✓ Asistencia Confirmada' : 'Confirmar Asistencia'}
                                </button>
                                <button
                                  onClick={() => handleToggleAttendance(nextMatch.id, false)}
                                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${
                                    isDeclined
                                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                      : 'bg-gray-900 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}
                                >
                                  {isDeclined ? '✕ Ausencia Declarada' : 'Declinar'}
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center text-gray-400 text-xs">
                        No hay partidos agendados próximamente.
                      </div>
                    )}

                    {/* RESUMEN RÁPIDO Y ESTADÍSTICAS DEL EQUIPO */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                        <p className="text-xs text-gray-400 font-bold">Jugadores</p>
                        <p className="text-2xl font-black text-emerald-400">{players.length}</p>
                      </div>
                      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                        <p className="text-xs text-gray-400 font-bold">Partidos Totales</p>
                        <p className="text-2xl font-black text-teal-400">{matches.length}</p>
                      </div>
                      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                        <p className="text-xs text-gray-400 font-bold">Goles del Club</p>
                        <p className="text-2xl font-black text-emerald-400">
                          {players.reduce((sum, p) => sum + (p.goals || 0), 0)}
                        </p>
                      </div>
                      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                        <p className="text-xs text-gray-400 font-bold">Tu Rol</p>
                        <p className="text-sm font-bold text-white mt-1">{isCaptain ? 'Capitán' : loggedPlayer ? 'Jugador' : 'Espectador'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PESTAÑA PLANTILLA Y ESTADÍSTICAS DE JUGADORES */}
                {activeTab === 'plantilla' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-white">Plantilla de Jugadores</h2>
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
                        <div
                          key={p.id}
                          className="bg-gray-900 p-4 rounded-2xl border border-gray-800 hover:border-gray-700 transition flex items-center justify-between cursor-pointer"
                          onClick={() => setSelectedPlayerStatsModal(p)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex flex-col items-center justify-center">
                              <span className="font-black text-xs text-emerald-400">#{p.jersey_number || 10}</span>
                              <span className="text-[8px] font-black text-gray-400">OVR {calculateOVR(p)}</span>
                            </div>
                            <div>
                              <h3 className="font-extrabold text-sm text-white flex items-center space-x-1">
                                <span>{p.name}</span>
                                {p.is_captain && <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded">C</span>}
                              </h3>
                              <p className="text-xs text-gray-400">{p.position_primary} • {p.foot} • {p.age || 25} años</p>
                              <div className="flex space-x-2 text-[10px] text-gray-300 font-bold mt-1">
                                <span className="text-emerald-400">⚽ {p.goals || 0} Goles</span>
                                <span className="text-amber-400">🟨 {p.yellow_cards || 0}</span>
                                <span className="text-red-400">🟥 {p.red_cards || 0}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedPlayerStatsModal(p)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold"
                            >
                              Ver Stats
                            </button>
                            {isCaptain && (
                              <>
                                <button
                                  onClick={() => handleOpenEditPlayerModal(p)}
                                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-700"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeletePlayer(p.id, p.name)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-lg border border-red-500/30"
                                >
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PESTAÑA PARTIDOS Y CIERRE */}
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
                          <div key={m.id} className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                m.status === 'finished' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {m.status === 'finished' ? 'Finalizado' : 'Programado'}
                              </span>
                              <span className="text-xs text-gray-400 font-bold">{dateStr} • {timeStr} hrs</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-black text-lg text-white">vs {m.rival}</h3>
                                <a
                                  href={getGoogleMapsUrl(m.location)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-emerald-400 hover:underline font-bold"
                                >
                                  📍 {m.location || 'Por definir'}
                                </a>
                              </div>
                              {m.status === 'finished' && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-400 uppercase font-bold">Marcador</p>
                                  <p className="text-2xl font-black text-emerald-400">{m.goals_club} - {m.goals_rival}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-800/60">
                              {m.status !== 'finished' && isCaptain && (
                                <button
                                  onClick={() => handleOpenFinishMatchModal(m)}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs px-3 py-1.5 rounded-xl font-black shadow-md shadow-emerald-500/20"
                                >
                                  Cerrar Partido y Registrar Stats
                                </button>
                              )}
                              {isCaptain && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditMatchModal(m)}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-700 font-bold"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMatch(m.id, m.rival)}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-2.5 py-1.5 rounded-xl border border-red-500/30 font-bold"
                                  >
                                    ✕
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

                {/* PESTAÑA PIZARRA TÁCTICA COMPLETA */}
                {activeTab === 'tactica' && (
                  <div className="space-y-4">
                    <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-black text-white">Pizarra Táctica Interactiva</h2>
                          <p className="text-xs text-gray-400">Selecciona una alineación preseteada o arrastra las fichas libremente.</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setUseFreeBoard(!useFreeBoard)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition ${
                              useFreeBoard
                                ? 'bg-emerald-500 text-black border-emerald-400'
                                : 'bg-gray-800 text-gray-300 border-gray-700'
                            }`}
                          >
                            {useFreeBoard ? 'Modo Fichas Libres' : 'Modo Formación'}
                          </button>
                        </div>
                      </div>

                      {!useFreeBoard ? (
                        <div className="flex items-center space-x-2 bg-gray-950 p-3 rounded-xl border border-gray-800">
                          <label className="text-xs font-bold text-gray-300">Alineación:</label>
                          <select
                            value={selectedFormation}
                            onChange={(e) => setSelectedFormation(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-xs text-emerald-400 font-bold px-3 py-1.5 rounded-lg focus:outline-none"
                          >
                            {Object.entries(ESTRUCTURA_FORMACIONES).map(([key, val]) => (
                              <option key={key} value={key}>{val.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        isCaptain && (
                          <div className="flex items-center space-x-2 bg-gray-950 p-3 rounded-xl border border-gray-800">
                            <span className="text-xs font-bold text-gray-300">Agregar posición:</span>
                            <select
                              value={newCustomCategory}
                              onChange={(e) => setNewCustomCategory(e.target.value)}
                              className="bg-gray-900 border border-gray-700 text-xs text-white px-2 py-1 rounded-lg"
                            >
                              <option value="POR">Portero</option>
                              <option value="DEF">Defensa</option>
                              <option value="MED">Medio</option>
                              <option value="DEL">Delantero</option>
                            </select>
                            <button
                              onClick={handleAddCustomToken}
                              className="bg-emerald-500 text-black text-xs px-3 py-1 rounded-lg font-bold"
                            >
                              + Agregar
                            </button>
                          </div>
                        )
                      )}

                      {/* CANCHA DE FÚTBOL */}
                      <div
                        ref={fieldRef}
                        onMouseMove={handleFieldMouseMove}
                        onTouchMove={handleFieldMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onTouchEnd={handleMouseUpOrLeave}
                        className="w-full h-[450px] bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 rounded-2xl border-2 border-emerald-500/40 relative overflow-hidden flex items-center justify-center select-none shadow-2xl"
                      >
                        {/* LÍNEAS DE CANCHA */}
                        <div className="absolute inset-x-0 top-1/2 border-t-2 border-emerald-500/30"></div>
                        <div className="w-32 h-32 border-2 border-emerald-500/30 rounded-full absolute"></div>
                        <div className="w-48 h-20 border-2 border-emerald-500/30 border-t-0 absolute top-0"></div>
                        <div className="w-48 h-20 border-2 border-emerald-500/30 border-b-0 absolute bottom-0"></div>

                        {/* FICHAS LIBRES O PRESETEADAS */}
                        {useFreeBoard ? (
                          customTokens.map((t) => {
                            const assignedP = players.find((p) => String(p.id) === String(t.playerId));
                            return (
                              <div
                                key={t.id}
                                onMouseDown={() => handleTouchOrMouseDown(t.id)}
                                onTouchStart={() => handleTouchOrMouseDown(t.id)}
                                style={{ top: `${t.top}%`, left: `${t.left}%` }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing flex flex-col items-center"
                              >
                                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-xl ${
                                  assignedP ? 'bg-emerald-400 border-white text-black' : 'bg-gray-900 border-emerald-400 text-emerald-400'
                                }`}>
                                  {assignedP ? `#${assignedP.jersey_number || 10}` : t.posLabel}
                                </div>
                                <span className="text-[9px] font-bold bg-black/90 text-white px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap border border-gray-800">
                                  {assignedP ? assignedP.name : t.posLabel}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="absolute inset-0 p-4 flex flex-col justify-between">
                            {/* DELANTEROS */}
                            <div className="flex justify-around items-center">
                              {ESTRUCTURA_FORMACIONES[selectedFormation]?.del.map((pos, i) => (
                                <div key={`del-${i}`} className="flex flex-col items-center">
                                  <div className="w-9 h-9 rounded-full bg-emerald-500 border-2 border-white text-black font-black flex items-center justify-center text-xs shadow-lg">
                                    {pos}
                                  </div>
                                  <span className="text-[9px] font-bold bg-black/80 px-1.5 py-0.5 rounded text-emerald-400 mt-1">{pos}</span>
                                </div>
                              ))}
                            </div>

                            {/* MEDIOS */}
                            <div className="flex justify-around items-center">
                              {ESTRUCTURA_FORMACIONES[selectedFormation]?.med.map((pos, i) => (
                                <div key={`med-${i}`} className="flex flex-col items-center">
                                  <div className="w-9 h-9 rounded-full bg-teal-500 border-2 border-white text-black font-black flex items-center justify-center text-xs shadow-lg">
                                    {pos}
                                  </div>
                                  <span className="text-[9px] font-bold bg-black/80 px-1.5 py-0.5 rounded text-teal-300 mt-1">{pos}</span>
                                </div>
                              ))}
                            </div>

                            {/* DEFENSAS */}
                            <div className="flex justify-around items-center">
                              {ESTRUCTURA_FORMACIONES[selectedFormation]?.def.map((pos, i) => (
                                <div key={`def-${i}`} className="flex flex-col items-center">
                                  <div className="w-9 h-9 rounded-full bg-blue-500 border-2 border-white text-black font-black flex items-center justify-center text-xs shadow-lg">
                                    {pos}
                                  </div>
                                  <span className="text-[9px] font-bold bg-black/80 px-1.5 py-0.5 rounded text-blue-300 mt-1">{pos}</span>
                                </div>
                              ))}
                            </div>

                            {/* PORTERO */}
                            <div className="flex justify-center items-center">
                              <div className="flex flex-col items-center">
                                <div className="w-9 h-9 rounded-full bg-amber-500 border-2 border-white text-black font-black flex items-center justify-center text-xs shadow-lg">
                                  POR
                                </div>
                                <span className="text-[9px] font-bold bg-black/80 px-1.5 py-0.5 rounded text-amber-300 mt-1">POR</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PESTAÑA OFICINA */}
                {activeTab === 'oficina' && (
                  <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
                    <h2 className="text-lg font-black text-white">Oficina y Finanzas</h2>
                    <p className="text-xs text-gray-400">Control de cuotas arbitrales y aportaciones de los jugadores.</p>
                    <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 font-bold">Costo de arbitraje por partido:</p>
                      <p className="text-2xl font-black text-emerald-400">${refereeCostInput} MXN</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </>
      )}

      {/* MODAL VER STATS DE JUGADOR */}
      {selectedPlayerStatsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-white">{selectedPlayerStatsModal.name}</h3>
                <p className="text-xs text-emerald-400 font-bold">#{selectedPlayerStatsModal.jersey_number || 10} • {selectedPlayerStatsModal.position_primary}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center font-black text-emerald-400 text-sm">
                <span>OVR</span>
                <span>{calculateOVR(selectedPlayerStatsModal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-300">
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">⚽ Goles: <span className="text-emerald-400 font-black">{selectedPlayerStatsModal.goals || 0}</span></div>
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">🟨 Amarillas: <span className="text-amber-400 font-black">{selectedPlayerStatsModal.yellow_cards || 0}</span></div>
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">🟥 Rojas: <span className="text-red-400 font-black">{selectedPlayerStatsModal.red_cards || 0}</span></div>
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">❌ Faltas: <span className="text-gray-400 font-black">{selectedPlayerStatsModal.absences || 0}</span></div>
            </div>

            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-1.5 text-xs text-gray-400 font-medium">
              <div className="flex justify-between"><span>Ritmo (PAC):</span><span className="text-white font-bold">{selectedPlayerStatsModal.pace || 75}</span></div>
              <div className="flex justify-between"><span>Tiro (SHO):</span><span className="text-white font-bold">{selectedPlayerStatsModal.shooting || 75}</span></div>
              <div className="flex justify-between"><span>Pase (PAS):</span><span className="text-white font-bold">{selectedPlayerStatsModal.passing || 75}</span></div>
              <div className="flex justify-between"><span>Regate (DRI):</span><span className="text-white font-bold">{selectedPlayerStatsModal.dribbling || 75}</span></div>
              <div className="flex justify-between"><span>Técnica (TEC):</span><span className="text-white font-bold">{selectedPlayerStatsModal.technique || 75}</span></div>
            </div>

            <button
              onClick={() => setSelectedPlayerStatsModal(null)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONTRASEÑA CAPITÁN */}
      {showCaptainPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleVerifyCaptainPassword} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-xs w-full space-y-4">
            <h3 className="font-extrabold text-base text-white">Clave de Capitán</h3>
            <input
              type="password"
              placeholder="Ingresa la contraseña"
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

      {/* MODAL CIERRE DE PARTIDO */}
      {showFinishMatchModal && matchToFinish && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveFinishedMatch} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-md w-full space-y-4 my-8">
            <h3 className="font-black text-lg text-white">Cerrar Partido vs {matchToFinish.rival}</h3>
            
            <div className="grid grid-cols-2 gap-3 bg-gray-950 p-3 rounded-2xl border border-gray-800">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Goles Club</label>
                <input
                  type="number"
                  value={finishGoalsClub}
                  onChange={(e) => setFinishGoalsClub(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-black mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Goles Rival</label>
                <input
                  type="number"
                  value={finishGoalsRival}
                  onChange={(e) => setFinishGoalsRival(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-red-400 font-black mt-1"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-gray-300">Estadísticas por Jugador:</p>
              {players.map((p) => (
                <div key={p.id} className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
                  <p className="text-xs font-bold text-white">#{p.jersey_number} {p.name}</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[9px] text-gray-400">Goles</span>
                      <input
                        type="number"
                        min="0"
                        value={finishPlayerData[p.id]?.goals || 0}
                        onChange={(e) => setFinishPlayerData({ ...finishPlayerData, [p.id]: { ...finishPlayerData[p.id], goals: e.target.value } })}
                        className="w-full bg-gray-900 border border-gray-700 rounded text-center text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400">🟨</span>
                      <input
                        type="number"
                        min="0"
                        value={finishPlayerData[p.id]?.yellow_cards || 0}
                        onChange={(e) => setFinishPlayerData({ ...finishPlayerData, [p.id]: { ...finishPlayerData[p.id], yellow_cards: e.target.value } })}
                        className="w-full bg-gray-900 border border-gray-700 rounded text-center text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400">🟥</span>
                      <input
                        type="number"
                        min="0"
                        value={finishPlayerData[p.id]?.red_cards || 0}
                        onChange={(e) => setFinishPlayerData({ ...finishPlayerData, [p.id]: { ...finishPlayerData[p.id], red_cards: e.target.value } })}
                        className="w-full bg-gray-900 border border-gray-700 rounded text-center text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400">Falta</span>
                      <input
                        type="number"
                        min="0"
                        value={finishPlayerData[p.id]?.absences || 0}
                        onChange={(e) => setFinishPlayerData({ ...finishPlayerData, [p.id]: { ...finishPlayerData[p.id], absences: e.target.value } })}
                        className="w-full bg-gray-900 border border-gray-700 rounded text-center text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishMatchModal(false)}
                className="w-1/2 bg-gray-800 text-gray-300 py-2.5 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 bg-emerald-500 text-black py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Guardar Cierre
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
