import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import ElevatorBuckets from './pages/ElevatorBuckets';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
