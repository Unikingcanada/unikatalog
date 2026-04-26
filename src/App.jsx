import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ElevatorBuckets from './pages/ElevatorBuckets';
import Catalog from './pages/Catalog';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
