// Width is governed by .brand-logo in index.css (single source of truth).
// Pass `size` only to override for a specific placement.
export default function Logo({ size }) {
  return (
    <img
      className="brand-logo"
      src="/logo.png"
      alt="Spill! Your Group Chat"
      style={size ? { width: size } : undefined}
    />
  )
}
