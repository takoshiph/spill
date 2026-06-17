import { useMemo, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { buildDeck, VIBES } from '../lib/deck'
import { assignFollowups, inviteFor } from '../lib/followups'
import { useGameActions } from '../lib/useRoom'
import { supabase } from '../lib/supabase'
import { clearSession } from '../lib/session'

const APPRECIATION = [
  'That’s what’s up',
  'Love that',
  'Respect',
  'So real',
  'Here for it',
  'No notes',
  'Felt that',
  'Big spill energy',
]

const VH = typeof window !== 'undefined' ? window.innerHeight : 800
const REDUCED = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

function flingFor(i) {
  const ang = (((i * 73 + 35) % 360) - 180) * Math.PI / 180
  return { x: Math.cos(ang) * VH, y: Math.sin(ang) * VH, rotate: (i % 2 ? 1 : -1) * (35 + ((i * 17) % 45)) }
}

export default function Game({ room, players, me, isHost, playerId, online, refetch }) {
  const nav = useNavigate()
  const deck = useMemo(() => buildDeck(room.vibe, room.code), [room.vibe, room.code])

  const [intro, setIntro] = useState(true)
  const [introLift, setIntroLift] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [showFu, setShowFu] = useState(false)
  const [bubbles, setBubbles] = useState([])
  const chanRef = useRef(null)

  const closeSheet = () => { setSheet(false); setConfirmEnd(false) }

  // Who's actually online (presence), with a fallback to the DB flag until presence syncs.
  const onlineSet = online instanceof Set ? online : new Set()
  const livePlayers = useMemo(
    () => (onlineSet.size > 0 ? players.filter((p) => onlineSet.has(p.id)) : players.filter((p) => p.connected)),
    [players, onlineSet]
  )

  const { setReady, draw, maybeAdvance, forceNext, endGame } = useGameActions(room, livePlayers, deck.length, refetch)

  useEffect(() => {
    // shuffle plays, then the stack lifts toward the deck position, then hand off
    const tLift = setTimeout(() => setIntroLift(true), 2150)
    const tDone = setTimeout(() => setIntro(false), 2650)
    return () => { clearTimeout(tLift); clearTimeout(tDone) }
  }, [])

  // ephemeral reaction channel (floating bubbles)
  useEffect(() => {
    if (!supabase || !room?.id) return
    const ch = supabase.channel(`react:${room.id}`, { config: { broadcast: { self: true } } })
    ch.on('broadcast', { event: 'react' }, ({ payload }) => {
      const id = Math.random().toString(36).slice(2)
      const left = 12 + Math.floor(Math.random() * 64)
      setBubbles((b) => [...b.slice(-7), { id, text: payload.text, left }])
      setTimeout(() => setBubbles((b) => b.filter((x) => x.id !== id)), 2600)
    }).subscribe()
    chanRef.current = ch
    return () => { supabase.removeChannel(ch); chanRef.current = null }
  }, [room?.id])

  const drawer = players.find((p) => p.seat === room.current_seat)
  const isMyDraw = drawer?.id === playerId
  const card = room.card_index >= 0 ? deck[room.card_index] : null
  const vibe = VIBES[room.vibe]
  const isWild = card && (card.wildcard || card.target_type === 'everyone')

  // On a wildcard the whole group answers, so everyone sees the question.
  const showQuestion = !!card && room.phase === 'answer' && (isMyDraw || isWild)
  const showListen = !!card && room.phase === 'answer' && !showQuestion

  const appreciation = useMemo(() => {
    let h = 0
    for (const ch of `${playerId}-${room.card_index}`) h = (h + ch.charCodeAt(0)) % APPRECIATION.length
    return APPRECIATION[h]
  }, [playerId, room.card_index])

  const followups = useMemo(
    () => (room.phase === 'answer' && card && !isWild ? assignFollowups(card, room, livePlayers, drawer?.id) : []),
    [room.phase, room.card_index, livePlayers, room.code, drawer?.id]
  )
  const myFollowup = followups.find((f) => f.askerId === playerId)
  const inviteText = (myFollowup && card)
    ? inviteFor(card, room).replace('{name}', drawer?.name || 'They')
    : ''

  useEffect(() => {
    setShowFu(false)
    if (room.phase !== 'answer') return
    const t = setTimeout(() => setShowFu(true), 3500)
    return () => clearTimeout(t)
  }, [room.card_index, room.phase])

  // Advance once everyone online is ready.
  useEffect(() => {
    if (room.phase === 'answer' && livePlayers.length > 0 && livePlayers.every((p) => p.ready)) {
      maybeAdvance()
    }
  }, [room.phase, livePlayers, maybeAdvance])

  // Auto-recover a stuck draw: if the current drawer has gone offline, the
  // lowest-seat online player hands the deck to the next online person.
  const designatedId = livePlayers.length ? [...livePlayers].sort((a, b) => a.seat - b.seat)[0].id : null
  useEffect(() => {
    if (onlineSet.size === 0 || room.phase !== 'draw') return
    const drawerLive = drawer && livePlayers.some((p) => p.id === drawer.id)
    if (!drawerLive && designatedId === playerId && livePlayers.length > 0) {
      forceNext()
    }
  }, [room.phase, room.current_seat, onlineSet, designatedId, drawer, livePlayers, forceNext, playerId])

  if (intro) {
    return (
      <div className="game-screen">
        <div className={`shuffle${introLift ? ' lift' : ''}`}>
          <div className="s-card" /><div className="s-card" />
          <div className="s-card" /><div className="s-card" />
          <span className="s-hint">Shuffling the deck…</span>
        </div>
      </div>
    )
  }

  const sendReaction = (text) => chanRef.current?.send({ type: 'broadcast', event: 'react', payload: { text } })
  const onAction = () => {
    const next = !me?.ready
    setReady(playerId, next)
    if (next && !isMyDraw && !isWild) sendReaction(appreciation)
  }
  const actionLabel = (isMyDraw || isWild)
    ? (me?.ready ? '✓ Done' : 'Done')
    : (me?.ready ? `✓ ${appreciation}` : appreciation)

  return (
    <div className="game-screen">
      <button className="game-menu-btn" onClick={() => setSheet(true)} aria-label="Menu">⋯</button>
      {isHost && <div className="game-code">Code {room.code}</div>}

      {room.phase === 'draw' && (
        <>
          <div className="peek-wrap soft-in">
            <div className="peek-card peek-b2" />
            <div className="peek-card peek-b1" />
            {isMyDraw ? (
              <motion.div
                className="peek-card peek-top"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.75 }}
                dragSnapToOrigin
                whileDrag={{ scale: 1.03 }}
                onDragEnd={(e, info) => { if (info.offset.y > 120 || info.velocity.y > 650) draw() }}
              />
            ) : (
              <div className="peek-card peek-top" />
            )}
          </div>
          <div className="stage-hint">
            {isMyDraw
              ? (<><span className="pull-arrow">⇣</span>Pull the card down to draw</>)
              : `${drawer?.name || 'Someone'} is drawing…`}
          </div>
        </>
      )}

      {room.phase === 'answer' && card && (
        <div className="reaction-layer">
          {bubbles.map((b) => (
            <span key={b.id} className="bubble" style={{ left: `${b.left}%` }}>{b.text}</span>
          ))}
        </div>
      )}

      {showQuestion && <div className="card-glow" />}
      <AnimatePresence>
        {showQuestion && (
          <motion.div
            key={card.id}
            className="deal-card"
            initial={REDUCED ? { opacity: 0 } : { y: -VH * 0.62, rotateY: 0, scale: 0.8, opacity: 0 }}
            animate={REDUCED ? { opacity: 1 } : { y: 0, rotateY: 180, scale: [0.8, 1.06, 1], opacity: 1 }}
            exit={REDUCED
              ? { opacity: 0 }
              : { ...flingFor(card.index), rotateY: 0, opacity: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
            transition={{
              y: { type: 'spring', stiffness: 120, damping: 16, mass: 0.8 },
              rotateY: { duration: 0.6, ease: [0.3, 0.8, 0.25, 1], delay: 0.06 },
              scale: { duration: 0.7, times: [0, 0.7, 1], ease: 'easeOut' },
              opacity: { duration: 0.18 },
            }}
          >
            <div className="face face-back" />
            <div className={`face face-front${isWild ? ' wildcard' : ''}`}>
              <span className="card-shine" />
              <span className="pc-top">{isWild ? 'To the group' : vibe?.name}</span>
              <p className="pc-text">{card.text}</p>
              <span className="pc-mark">Spill!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showListen && (
        <div className="listen-view">
          <div className="listen-back" />
          {showFu && myFollowup ? (
            <div className="followup mine fade-in">
              <span className="fu-badge">Your moment to connect</span>
              <span className="fu-invite">{inviteText}</span>
            </div>
          ) : (
            <div className="listen-label"><span className="sub">Listen in. React when it moves you.</span></div>
          )}
        </div>
      )}

      {room.phase === 'answer' && card && (
        <>
          <div className="turn-indicator">
            <span className="who-dot" />
            {isWild
              ? <span>Everyone answers <span className="sub">· to the group</span></span>
              : (isMyDraw ? 'You’re sharing' : <span>{drawer?.name} <span className="sub">is sharing</span></span>)}
          </div>

          <div className="ready-zone">
            <button className={`ready-pill${me?.ready ? ' on' : ''}`} onClick={onAction}>
              {actionLabel}
            </button>
            <div className="ready-dots">
              {livePlayers.map((p) => <i key={p.id} className={p.ready ? 'lit' : ''} />)}
            </div>
          </div>
        </>
      )}

      {sheet && (
        <>
          <div className="sheet-backdrop" onClick={closeSheet} />
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-row">
              <span>{vibe?.name}</span>
              <span>{room.card_index >= 0 ? `Card ${room.card_index + 1} of ${deck.length}` : `${deck.length} cards`}</span>
            </div>
            <div className="sheet-code">Room code: <b>{room.code}</b></div>
            {isHost ? (
              confirmEnd ? (
                <>
                  <div className="sheet-title">End the night for everyone?</div>
                  <div className="sheet-sub">All {livePlayers.length} players will see the wrap-up screen.</div>
                  <button className="btn btn-primary" onClick={endGame}>Yes, end the night</button>
                  <button className="link" onClick={() => setConfirmEnd(false)}>Not yet</button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => { forceNext(); closeSheet() }}>Skip to next player</button>
                  <button className="btn btn-secondary" onClick={() => setConfirmEnd(true)}>End the night</button>
                  <button className="link" onClick={closeSheet}>Close</button>
                </>
              )
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => { clearSession(); nav('/') }}>Leave game</button>
                <button className="link" onClick={closeSheet}>Close</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
