import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VIBES } from '../lib/deck'

const ENTRIES = Object.entries(VIBES)
const N = ENTRIES.length
const wrap = (i) => ((i % N) + N) % N

// Tap the card to slide to the next vibe; flick it (up or down) to choose.
export default function VibePicker({ onChoose, busy }) {
  const [index, setIndex] = useState(0)
  const moved = useRef(false)
  const next = () => setIndex((i) => wrap(i + 1))
  const [key, v] = ENTRIES[wrap(index)]

  return (
    <div className="vibe-swipe">
      <motion.div
        className="vibe-swipe-card"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        dragSnapToOrigin
        whileTap={{ scale: 0.98 }}
        onPointerDown={() => { moved.current = false }}
        onDrag={(e, info) => { if (Math.abs(info.offset.y) > 6) moved.current = true }}
        onTap={() => { if (!moved.current && !busy) next() }}
        onDragEnd={(e, info) => {
          if (!busy && (Math.abs(info.offset.y) > 90 || Math.abs(info.velocity.y) > 550)) onChoose(key)
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="vibe-card-inner"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          >
            <img className="vibe-swipe-icon big" src={v.icon} alt="" draggable="false" />
            <span className="vibe-name">{v.name}</span>
            <span className="vibe-desc">{v.desc}</span>
          </motion.div>
        </AnimatePresence>
        <span className="vibe-choose">Tap for next · flick to choose</span>
      </motion.div>

      <div className="vibe-dots">
        {ENTRIES.map(([k], i) => <i key={k} className={i === wrap(index) ? 'on' : ''} />)}
      </div>
    </div>
  )
}
