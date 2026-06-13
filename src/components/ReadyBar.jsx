export default function ReadyBar({ readyCount, total, meReady, onToggle }) {
  const pct = total > 0 ? Math.round((readyCount / total) * 100) : 0
  return (
    <div className="ready-bar">
      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
      <div className="ready-count">{readyCount} / {total} ready for next</div>
      <button className={`btn ${meReady ? 'btn-secondary' : 'btn-primary'}`} onClick={onToggle}>
        {meReady ? "Waiting for the table…" : 'Ready for next'}
      </button>
    </div>
  )
}
