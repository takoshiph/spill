import { Routes, Route } from 'react-router-dom'
import Landing from './screens/Landing'
import CreateRoom from './screens/CreateRoom'
import JoinRoom from './screens/JoinRoom'
import Room from './screens/Room'
import Privacy from './screens/Privacy'
import Splash from './components/Splash'
import { isConfigured } from './lib/supabase'

function ConfigBanner() {
  if (isConfigured) return null
  return (
    <div className="banner" style={{ maxWidth: 480, margin: '12px auto 0' }}>
      Supabase isn’t configured yet. Copy <code>.env.example</code> to <code>.env</code> and add your
      project URL + anon key, then restart the dev server. The UI runs, but rooms won’t sync.
    </div>
  )
}

export default function App() {
  return (
    <>
      <Splash />
      <ConfigBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  )
}
