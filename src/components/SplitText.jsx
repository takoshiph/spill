import { useMemo } from 'react'

const REDUCED = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

// ReactBits-style word-by-word blur-in reveal (pure CSS, staggered).
export default function SplitText({ text, className = '', delay = 0, stagger = 90, tag: Tag = 'span' }) {
  const words = useMemo(() => text.split(' '), [text])
  if (REDUCED) return <Tag className={className}>{text}</Tag>
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          className="split-word"
          aria-hidden="true"
          style={{ animationDelay: `${delay + i * stagger}ms` }}
        >
          {w}{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
