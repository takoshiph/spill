export default function PlayerList({ players, hostId, currentSeat, showReady }) {
  return (
    <div className="player-list">
      {players.map((p) => (
        <div key={p.id} className={`player-chip${showReady && p.ready ? ' ready' : ''}`}>
          <span className="avatar">{(p.name || '?').charAt(0).toUpperCase()}</span>
          <span>{p.name}</span>
          {p.id === hostId && <span className="tag">HOST</span>}
          {currentSeat === p.seat && <span className="tag">DRAWING</span>}
          {showReady && p.ready && <span className="tag">✓ READY</span>}
        </div>
      ))}
    </div>
  )
}
