import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "padel-league-v1";

async function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { console.error("Save failed", e); }
}

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --clay: #C85A1A;
    --clay-light: #E8835A;
    --clay-dark: #8B3A0A;
    --navy: #0D1B2A;
    --navy-mid: #1A2E42;
    --navy-light: #243B52;
    --cream: #F5EFE6;
    --white: #FFFFFF;
    --gold: #D4A843;
    --green: #2ECC71;
    --red: #E74C3C;
    --text-dim: #8A9BB0;
    --border: rgba(255,255,255,0.08);
  }

  body { background: var(--navy); color: var(--cream); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

  .app { max-width: 900px; margin: 0 auto; padding: 0 16px 80px; }

  /* HEADER */
  .header {
    padding: 28px 0 20px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .header-icon {
    width: 44px; height: 44px; background: var(--clay);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .header-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 2px; color: var(--white); line-height: 1; }
  .header-sub { font-size: 13px; color: var(--text-dim); letter-spacing: 0.5px; margin-top: 2px; }

  /* TABS */
  .tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--navy-mid); padding: 4px; border-radius: 10px; }
  .tab {
    flex: 1; padding: 9px 6px; border-radius: 7px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    background: transparent; color: var(--text-dim); transition: all 0.18s;
  }
  .tab:hover { color: var(--cream); }
  .tab.active { background: var(--clay); color: var(--white); }

  /* CARDS */
  .card {
    background: var(--navy-mid); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px; margin-bottom: 14px;
  }
  .card-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1.5px; color: var(--clay-light); margin-bottom: 14px; }

  /* STANDINGS TABLE */
  .standings-table { width: 100%; border-collapse: collapse; }
  .standings-table th {
    font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 1.5px;
    color: var(--text-dim); text-align: left; padding: 0 10px 10px; text-transform: uppercase;
  }
  .standings-table th.num { text-align: center; }
  .standings-table td { padding: 10px; border-top: 1px solid var(--border); font-size: 14px; }
  .standings-table td.num { text-align: center; font-family: 'DM Mono', monospace; font-size: 13px; }
  .standings-table tr:hover td { background: rgba(255,255,255,0.03); }
  .rank-badge {
    width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500;
  }
  .rank-1 { background: var(--gold); color: var(--navy); }
  .rank-2 { background: #9BA4B5; color: var(--navy); }
  .rank-3 { background: #8B5C2A; color: var(--cream); }
  .rank-other { background: var(--navy-light); color: var(--text-dim); }
  .pair-name { font-weight: 500; color: var(--cream); }
  .pair-names-sub { font-size: 12px; color: var(--text-dim); margin-top: 1px; }

  /* ROUND TABS */
  .round-tabs { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
  .round-tab {
    padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border);
    font-size: 12px; font-weight: 500; cursor: pointer; background: transparent;
    color: var(--text-dim); font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .round-tab:hover { border-color: var(--clay); color: var(--clay-light); }
  .round-tab.active { background: var(--clay); border-color: var(--clay); color: var(--white); }
  .round-tab.complete { border-color: var(--green); color: var(--green); opacity: 0.7; }
  .round-tab.complete.active { background: var(--green); color: var(--white); opacity: 1; }

  /* FIXTURE CARD */
  .fixture {
    background: var(--navy-light); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px; margin-bottom: 10px;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px;
  }
  .fixture.played { border-color: rgba(46,204,113,0.25); }
  .fixture.pending { border-color: rgba(200,90,26,0.2); }
  .team-side { display: flex; flex-direction: column; }
  .team-side.right { align-items: flex-end; }
  .team-label { font-size: 13px; font-weight: 500; color: var(--cream); }
  .team-label-sub { font-size: 11px; color: var(--text-dim); margin-top: 1px; }
  .score-center { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .score-display {
    font-family: 'DM Mono', monospace; font-size: 20px; font-weight: 500;
    color: var(--white); letter-spacing: 2px;
  }
  .score-display.pending { color: var(--text-dim); font-size: 14px; }
  .vs-badge {
    font-family: 'Bebas Neue', sans-serif; font-size: 12px; letter-spacing: 2px;
    color: var(--clay); background: rgba(200,90,26,0.15); padding: 2px 8px; border-radius: 4px;
  }
  .enter-score-btn {
    font-size: 11px; padding: 4px 10px; border-radius: 5px;
    border: 1px solid var(--clay); background: transparent; color: var(--clay-light);
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .enter-score-btn:hover { background: var(--clay); color: var(--white); }

  /* SCORE ENTRY MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: var(--navy-mid); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px; width: 100%; max-width: 420px;
  }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1.5px; color: var(--white); margin-bottom: 6px; }
  .modal-subtitle { font-size: 13px; color: var(--text-dim); margin-bottom: 22px; }
  .score-inputs { display: grid; grid-template-columns: 1fr 40px 1fr; align-items: center; gap: 10px; margin-bottom: 20px; }
  .score-col { display: flex; flex-direction: column; gap: 6px; }
  .score-team-label { font-size: 12px; color: var(--text-dim); font-weight: 500; text-align: center; }
  .score-input-row { display: flex; gap: 6px; justify-content: center; }
  .set-input {
    width: 42px; height: 42px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--navy-light); color: var(--cream); font-family: 'DM Mono', monospace;
    font-size: 18px; text-align: center; outline: none; transition: border-color 0.15s;
  }
  .set-input:focus { border-color: var(--clay); }
  .set-label { font-size: 10px; color: var(--text-dim); text-align: center; letter-spacing: 1px; font-family: 'DM Mono'; margin-bottom: 2px; }
  .score-separator { font-family: 'Bebas Neue'; font-size: 28px; color: var(--clay); text-align: center; padding-top: 20px; }
  .modal-actions { display: flex; gap: 10px; }
  .btn {
    flex: 1; padding: 12px; border-radius: 8px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; transition: all 0.15s;
  }
  .btn-primary { background: var(--clay); color: var(--white); }
  .btn-primary:hover { background: var(--clay-light); }
  .btn-secondary { background: var(--navy-light); color: var(--text-dim); border: 1px solid var(--border); }
  .btn-secondary:hover { color: var(--cream); }

  /* TEAMS SECTION */
  .teams-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .team-card {
    background: var(--navy-light); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px;
  }
  .team-card-name { font-weight: 600; font-size: 14px; color: var(--cream); margin-bottom: 3px; }
  .team-card-players { font-size: 12px; color: var(--text-dim); }
  .team-card-stats { display: flex; gap: 12px; margin-top: 10px; }
  .stat { display: flex; flex-direction: column; align-items: center; }
  .stat-val { font-family: 'DM Mono', monospace; font-size: 16px; font-weight: 500; color: var(--clay-light); }
  .stat-label { font-size: 10px; color: var(--text-dim); letter-spacing: 0.5px; }

  /* ADD TEAM */
  .add-team-form { display: flex; flex-direction: column; gap: 10px; }
  .input-row { display: flex; gap: 8px; }
  .text-input {
    flex: 1; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--navy-light); color: var(--cream); font-family: 'DM Sans', sans-serif;
    font-size: 14px; outline: none; transition: border-color 0.15s;
  }
  .text-input:focus { border-color: var(--clay); }
  .text-input::placeholder { color: var(--text-dim); }
  .add-btn {
    padding: 10px 18px; border-radius: 8px; border: none; background: var(--clay);
    color: var(--white); font-family: 'DM Sans', sans-serif; font-size: 14px;
    font-weight: 500; cursor: pointer; white-space: nowrap; transition: background 0.15s;
  }
  .add-btn:hover { background: var(--clay-light); }
  .add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .generate-btn {
    width: 100%; padding: 14px; border-radius: 10px; border: 2px solid var(--clay);
    background: transparent; color: var(--clay-light); font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; letter-spacing: 2px; cursor: pointer; margin-top: 16px; transition: all 0.18s;
  }
  .generate-btn:hover { background: var(--clay); color: var(--white); }
  .generate-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .badge {
    display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px;
    font-size: 11px; font-weight: 500; letter-spacing: 0.5px;
  }
  .badge-green { background: rgba(46,204,113,0.15); color: var(--green); }
  .badge-orange { background: rgba(200,90,26,0.15); color: var(--clay-light); }
  .badge-dim { background: rgba(255,255,255,0.06); color: var(--text-dim); }

  .winner-tag { font-size: 10px; color: var(--green); letter-spacing: 0.5px; margin-top: 2px; }
  .empty-state { text-align: center; padding: 40px 20px; color: var(--text-dim); font-size: 14px; }

  .section-label {
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px;
    color: var(--text-dim); text-transform: uppercase; margin-bottom: 12px;
  }

  .progress-bar { height: 4px; background: var(--navy-light); border-radius: 2px; margin-bottom: 20px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--clay); border-radius: 2px; transition: width 0.4s; }

  .delete-btn {
    background: none; border: none; cursor: pointer; color: var(--text-dim);
    font-size: 16px; padding: 2px 6px; border-radius: 4px; transition: color 0.15s;
  }
  .delete-btn:hover { color: var(--red); }

  @media (max-width: 500px) {
    .teams-grid { grid-template-columns: 1fr; }
    .header-title { font-size: 26px; }
  }
`;

const TOTAL_ROUNDS = 6;

// Generate round-robin fixtures
function generateRoundRobin(teams, totalRounds) {
  if (teams.length < 2) return [];
  const rounds = [];
  const list = [...teams];
  if (list.length % 2 !== 0) list.push({ id: "bye", name: "BYE" });
  const n = list.length;

  for (let r = 0; r < totalRounds; r++) {
    const round = [];
    const rotated = r === 0 ? list : [list[0], ...list.slice(n - r), ...list.slice(1, n - r)];
    for (let i = 0; i < n / 2; i++) {
      const home = rotated[i];
      const away = rotated[n - 1 - i];
      if (home.id !== "bye" && away.id !== "bye") {
        round.push({ id: `r${r}-m${i}`, homeId: home.id, awayId: away.id, score: null });
      }
    }
    rounds.push({ round: r + 1, matches: round });
  }
  return rounds;
}

function computeStandings(teams, rounds) {
  const stats = {};
  teams.forEach(t => {
    stats[t.id] = { id: t.id, name: t.name, p1: t.p1, p2: t.p2, played: 0, wins: 0, losses: 0, pts: 0, setsFor: 0, setsAgainst: 0, gamesFor: 0, gamesAgainst: 0 };
  });
  rounds.forEach(r => r.matches.forEach(m => {
    if (!m.score) return;
    const { home, away } = m.score;
    const hs = stats[m.homeId], as = stats[m.awayId];
    if (!hs || !as) return;
    hs.played++; as.played++;
    hs.setsFor += home.sets; hs.setsAgainst += away.sets;
    as.setsFor += away.sets; as.setsAgainst += home.sets;
    hs.gamesFor += home.games; hs.gamesAgainst += away.games;
    as.gamesFor += away.games; as.gamesAgainst += home.games;
    if (home.sets > away.sets) { hs.wins++; hs.pts += 3; as.losses++; }
    else if (away.sets > home.sets) { as.wins++; as.pts += 3; hs.losses++; }
    else { hs.pts += 1; as.pts += 1; }
  }));
  return Object.values(stats).sort((a, b) => b.pts - a.pts || b.wins - a.wins || (b.setsFor - b.setsAgainst) - (a.setsFor - a.setsAgainst));
}

const DEFAULT_TEAMS = [
  { id: "t1", name: "Smash Bros", p1: "Jamie", p2: "Alex" },
  { id: "t2", name: "Net Gainers", p1: "Sam", p2: "Chris" },
  { id: "t3", name: "Serve Masters", p1: "Jordan", p2: "Taylor" },
  { id: "t4", name: "Clay Courts", p1: "Morgan", p2: "Casey" },
];

export default function PadelLeague() {
  const [tab, setTab] = useState("standings");
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [modal, setModal] = useState(null);
  const [scoreEntry, setScoreEntry] = useState({ h1: "", a1: "", h2: "", a2: "", h3: "", a3: "" });
  const [newTeam, setNewTeam] = useState({ name: "", p1: "", p2: "" });
  const [loaded, setLoaded] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  useEffect(() => {
    loadState().then(saved => {
      if (saved) {
        if (saved.teams) setTeams(saved.teams);
        if (saved.rounds) setRounds(saved.rounds);
        if (saved.currentRound) setCurrentRound(saved.currentRound);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveState({ teams, rounds, currentRound }).then(() => {
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 1500);
    });
  }, [teams, rounds, currentRound, loaded]);

  const leagueStarted = rounds.length > 0;

  const standings = computeStandings(teams, rounds);

  const totalMatches = rounds.reduce((s, r) => s + r.matches.length, 0);
  const playedMatches = rounds.reduce((s, r) => s + r.matches.filter(m => m.score).length, 0);
  const progress = totalMatches ? Math.round((playedMatches / totalMatches) * 100) : 0;

  function startLeague() {
    if (teams.length < 2) return;
    setRounds(generateRoundRobin(teams, TOTAL_ROUNDS));
    setCurrentRound(1);
    setTab("fixtures");
  }

  function getTeam(id) { return teams.find(t => t.id === id); }

  function openScoreModal(match, roundIdx) {
    setModal({ matchId: match.id, roundIdx, homeId: match.homeId, awayId: match.awayId });
    if (match.score) {
      const s = match.score;
      setScoreEntry({
        h1: s.home.setScores[0]?.g ?? "", a1: s.away.setScores[0]?.g ?? "",
        h2: s.home.setScores[1]?.g ?? "", a2: s.away.setScores[1]?.g ?? "",
        h3: s.home.setScores[2]?.g ?? "", a3: s.away.setScores[2]?.g ?? "",
      });
    } else {
      setScoreEntry({ h1: "", a1: "", h2: "", a2: "", h3: "", a3: "" });
    }
  }

  function submitScore() {
    const se = scoreEntry;
    const sets = [];
    [[se.h1, se.a1], [se.h2, se.a2], [se.h3, se.a3]].forEach(([h, a], i) => {
      if (h !== "" && a !== "") sets.push({ h: parseInt(h), a: parseInt(a) });
    });
    if (sets.length < 2) return;

    let homeSets = 0, awaySets = 0, homeGames = 0, awayGames = 0;
    const homeSetScores = [], awaySetScores = [];
    sets.forEach(s => {
      homeGames += s.h; awayGames += s.a;
      homeSetScores.push({ g: s.h }); awaySetScores.push({ g: s.a });
      if (s.h > s.a) homeSets++; else if (s.a > s.h) awaySets++;
    });

    const score = {
      home: { sets: homeSets, games: homeGames, setScores: homeSetScores },
      away: { sets: awaySets, games: awayGames, setScores: awaySetScores },
    };

    setRounds(prev => prev.map((r, ri) => ri !== modal.roundIdx ? r : {
      ...r, matches: r.matches.map(m => m.id !== modal.matchId ? m : { ...m, score })
    }));
    setModal(null);
  }

  function addTeam() {
    if (!newTeam.name || !newTeam.p1 || !newTeam.p2) return;
    setTeams(prev => [...prev, { id: `t${Date.now()}`, ...newTeam }]);
    setNewTeam({ name: "", p1: "", p2: "" });
  }

  function removeTeam(id) {
    if (leagueStarted) return;
    setTeams(prev => prev.filter(t => t.id !== id));
  }

  const currentRoundData = rounds.find(r => r.round === currentRound);
  const roundComplete = r => r.matches.every(m => m.score);

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <div className="header">
          <div className="header-icon">🎾</div>
          <div style={{flex:1}}>
            <div className="header-title">Padel League</div>
            <div className="header-sub">
              {leagueStarted
                ? `${teams.length} pairs · ${TOTAL_ROUNDS} rounds · ${playedMatches}/${totalMatches} matches played`
                : `${teams.length} pairs registered · Ready to start`}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
            {saveIndicator && (
              <span style={{fontSize:11,color:'var(--green)',fontFamily:'DM Mono',letterSpacing:0.5}}>✓ saved</span>
            )}
            {!saveIndicator && loaded && (
              <span style={{fontSize:11,color:'var(--text-dim)',fontFamily:'DM Mono',letterSpacing:0.5,opacity:0.6}}>auto-save on</span>
            )}
          </div>
        </div>

        {leagueStarted && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="tabs">
          {["standings", "fixtures", "teams"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "standings" ? "🏆 Standings" : t === "fixtures" ? "📅 Fixtures" : "👥 Teams"}
            </button>
          ))}
        </div>

        {/* STANDINGS */}
        {tab === "standings" && (
          <div className="card">
            <div className="card-title">League Table</div>
            {standings.length === 0 ? (
              <div className="empty-state">No teams yet. Add teams and start the league.</div>
            ) : (
              <table className="standings-table">
                <thead>
                  <tr>
                    <th style={{width:36}}>#</th>
                    <th>Pair</th>
                    <th className="num">P</th>
                    <th className="num">W</th>
                    <th className="num">L</th>
                    <th className="num">Sets</th>
                    <th className="num">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => (
                    <tr key={s.id}>
                      <td><span className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}>{i + 1}</span></td>
                      <td>
                        <div className="pair-name">{s.name}</div>
                        <div className="pair-names-sub">{s.p1} & {s.p2}</div>
                      </td>
                      <td className="num">{s.played}</td>
                      <td className="num">{s.wins}</td>
                      <td className="num">{s.losses}</td>
                      <td className="num" style={{fontFamily:'DM Mono',fontSize:12}}>{s.setsFor}-{s.setsAgainst}</td>
                      <td className="num"><strong style={{color:'var(--clay-light)',fontFamily:'DM Mono'}}>{s.pts}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* FIXTURES */}
        {tab === "fixtures" && (
          <div>
            {!leagueStarted ? (
              <div className="card">
                <div className="empty-state">
                  <div style={{fontSize:32,marginBottom:12}}>🎾</div>
                  <div style={{fontWeight:600,color:'var(--cream)',marginBottom:6}}>League not started yet</div>
                  <div style={{marginBottom:20}}>Add at least 2 pairs in the Teams tab, then generate the fixtures.</div>
                  <button className="generate-btn" style={{maxWidth:280,margin:'0 auto'}} onClick={() => setTab("teams")}>Go to Teams →</button>
                </div>
              </div>
            ) : (
              <>
                <div className="round-tabs">
                  {rounds.map(r => (
                    <button
                      key={r.round}
                      className={`round-tab ${currentRound === r.round ? "active" : ""} ${roundComplete(r) ? "complete" : ""}`}
                      onClick={() => setCurrentRound(r.round)}
                    >
                      Rd {r.round} {roundComplete(r) ? "✓" : ""}
                    </button>
                  ))}
                </div>

                {currentRoundData && (
                  <div>
                    <div className="section-label">Round {currentRound} Matches</div>
                    {currentRoundData.matches.map(match => {
                      const home = getTeam(match.homeId);
                      const away = getTeam(match.awayId);
                      if (!home || !away) return null;
                      const s = match.score;
                      let homeWin = false, awayWin = false;
                      if (s) { homeWin = s.home.sets > s.away.sets; awayWin = s.away.sets > s.home.sets; }
                      return (
                        <div key={match.id} className={`fixture ${s ? "played" : "pending"}`}>
                          <div className="team-side">
                            <div className="team-label" style={homeWin ? {color:'var(--green)'} : {}}>{home.name}</div>
                            <div className="team-label-sub">{home.p1} & {home.p2}</div>
                            {homeWin && <div className="winner-tag">✓ WINNER</div>}
                          </div>
                          <div className="score-center">
                            {s ? (
                              <>
                                <div className="score-display">{s.home.sets} – {s.away.sets}</div>
                                <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'DM Mono'}}>
                                  {s.home.setScores.map((ss,i)=>`${ss.g}-${s.away.setScores[i].g}`).join(' ')}
                                </div>
                                <button className="enter-score-btn" onClick={() => openScoreModal(match, rounds.findIndex(r=>r.round===currentRound))}>Edit</button>
                              </>
                            ) : (
                              <>
                                <div className="vs-badge">VS</div>
                                <button className="enter-score-btn" onClick={() => openScoreModal(match, rounds.findIndex(r=>r.round===currentRound))}>Enter Score</button>
                              </>
                            )}
                          </div>
                          <div className="team-side right">
                            <div className="team-label" style={awayWin ? {color:'var(--green)'} : {}}>{away.name}</div>
                            <div className="team-label-sub">{away.p1} & {away.p2}</div>
                            {awayWin && <div className="winner-tag" style={{textAlign:'right'}}>WINNER ✓</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TEAMS */}
        {tab === "teams" && (
          <div>
            {!leagueStarted && (
              <div className="card">
                <div className="card-title">Add Pair</div>
                <div className="add-team-form">
                  <input className="text-input" placeholder="Pair name (e.g. Smash Bros)" value={newTeam.name} onChange={e => setNewTeam(p => ({...p, name: e.target.value}))} />
                  <div className="input-row">
                    <input className="text-input" placeholder="Player 1 name" value={newTeam.p1} onChange={e => setNewTeam(p => ({...p, p1: e.target.value}))} />
                    <input className="text-input" placeholder="Player 2 name" value={newTeam.p2} onChange={e => setNewTeam(p => ({...p, p2: e.target.value}))} />
                  </div>
                  <button className="add-btn" onClick={addTeam} disabled={!newTeam.name || !newTeam.p1 || !newTeam.p2}>Add Pair</button>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-title">Registered Pairs ({teams.length})</div>
              {teams.length === 0 ? (
                <div className="empty-state">No pairs yet. Add pairs above to get started.</div>
              ) : (
                <div className="teams-grid">
                  {teams.map(t => {
                    const s = standings.find(x => x.id === t.id) || { played:0, wins:0, pts:0 };
                    return (
                      <div key={t.id} className="team-card">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
                          <div className="team-card-name">{t.name}</div>
                          {!leagueStarted && <button className="delete-btn" onClick={() => removeTeam(t.id)}>×</button>}
                        </div>
                        <div className="team-card-players">{t.p1} & {t.p2}</div>
                        {leagueStarted && (
                          <div className="team-card-stats">
                            <div className="stat"><span className="stat-val">{s.pts}</span><span className="stat-label">PTS</span></div>
                            <div className="stat"><span className="stat-val">{s.wins}</span><span className="stat-label">WINS</span></div>
                            <div className="stat"><span className="stat-val">{s.played}</span><span className="stat-label">PLAYED</span></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!leagueStarted && (
              <button className="generate-btn" onClick={startLeague} disabled={teams.length < 2}>
                Generate {TOTAL_ROUNDS}-Round Fixtures →
              </button>
            )}
            {leagueStarted && (
              <div className="card" style={{textAlign:'center',padding:'16px'}}>
                <span className="badge badge-green">✓ League in Progress</span>
                <div style={{fontSize:12,color:'var(--text-dim)',marginTop:8,marginBottom:14}}>Teams locked. Fixtures generated for {TOTAL_ROUNDS} rounds.</div>
                <button
                  onClick={() => {
                    if (window.confirm("Reset the entire league? This will clear all scores and fixtures.")) {
                      setRounds([]);
                      setCurrentRound(1);
                      setTeams(DEFAULT_TEAMS);
                    }
                  }}
                  style={{
                    background:'none',border:'1px solid rgba(231,76,60,0.3)',color:'#E74C3C',
                    borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer',fontFamily:'DM Sans',
                  }}
                >
                  Reset League
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SCORE MODAL */}
      {modal && (() => {
        const home = getTeam(modal.homeId);
        const away = getTeam(modal.awayId);
        const se = scoreEntry;
        const sets = [[se.h1,se.a1],[se.h2,se.a2],[se.h3,se.a3]];
        const canSubmit = sets.filter(([h,a]) => h !== "" && a !== "").length >= 2;
        return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
            <div className="modal">
              <div className="modal-title">Enter Score</div>
              <div className="modal-subtitle">{home?.name} vs {away?.name} · Round {currentRound}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 20px 1fr',gap:8,marginBottom:20}}>
                <div style={{textAlign:'center',fontSize:12,fontWeight:600,color:'var(--cream)',padding:'0 0 8px'}}>{home?.name}</div>
                <div />
                <div style={{textAlign:'center',fontSize:12,fontWeight:600,color:'var(--cream)',padding:'0 0 8px'}}>{away?.name}</div>
              </div>
              {[["Set 1", "h1","a1"],["Set 2","h2","a2"],["Set 3 (TB)","h3","a3"]].map(([label, hk, ak]) => (
                <div key={hk} style={{marginBottom:12}}>
                  <div style={{textAlign:'center',fontSize:10,letterSpacing:1.5,color:'var(--text-dim)',fontFamily:'DM Mono',marginBottom:6}}>{label}</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 20px 1fr',gap:8,alignItems:'center'}}>
                    <input className="set-input" style={{width:'100%'}} type="number" min="0" max="7" value={se[hk]}
                      onChange={e => setScoreEntry(p => ({...p, [hk]: e.target.value}))} placeholder="–" />
                    <div style={{textAlign:'center',color:'var(--text-dim)',fontFamily:'DM Mono'}}>–</div>
                    <input className="set-input" style={{width:'100%'}} type="number" min="0" max="7" value={se[ak]}
                      onChange={e => setScoreEntry(p => ({...p, [ak]: e.target.value}))} placeholder="–" />
                  </div>
                </div>
              ))}
              <div style={{fontSize:11,color:'var(--text-dim)',marginBottom:16,textAlign:'center'}}>Enter at least 2 sets. Leave Set 3 blank if not played.</div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitScore} disabled={!canSubmit}>Save Result</button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
