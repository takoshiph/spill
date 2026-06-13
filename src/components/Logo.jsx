export default function Logo({ size = 220 }) {
  return (
    <img
      className="brand-logo"
      src="/logo.png"
      alt="Spill! Your Group Chat"
      style={{ width: size }}
    />
  )
}
