// Light home logo (transparent PNG) — sits directly on the cream page.
// Width is governed by .brand-logo in index.css; pass `size` to override.
export default function Logo({ size }) {
  return (
    <img
      className="brand-logo"
      src="/logo-light.png"
      alt="Spill! Your Group Chat"
      style={size ? { width: size } : undefined}
    />
  )
}
