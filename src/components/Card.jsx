import { VIBES } from '../lib/deck'

// Dealt face-down, then flips to reveal: a back face + a front face with the question.
export default function Card({ card }) {
  if (!card) return null
  const isWild = card.wildcard || card.target_type === 'everyone'
  const vibe = VIBES[card.vibe]
  return (
    <div className="flip" key={card.id}>
      <div className="flip-inner">
        <div className="flip-face flip-back" />
        <div className={`flip-face flip-front${isWild ? ' wildcard' : ''}`}>
          <span className="pc-top">{isWild ? 'To the group' : vibe?.name}</span>
          <p className="pc-text">{card.text}</p>
          <span className="pc-mark">Spill!</span>
        </div>
      </div>
    </div>
  )
}
