import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import ElevatorBuckets from './pages/ElevatorBuckets';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Catalog" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
