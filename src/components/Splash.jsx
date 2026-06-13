import { useEffect, useState } from 'react'

// Brief brand splash on first load; fades out and unmounts.
export default function Splash() {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 1850)
    return () => clearTimeout(t)
  }, [])
  if (gone) return null
  return (
    <div className="splash">
      <img src="/splash.png" alt="Spill! Your Group Chat" />
    </div>
  )
}
