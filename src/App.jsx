import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ElevatorBuckets from './pages/ElevatorBuckets';
import Catalog from './pages/Catalog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ElevatorBuckets" replace />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Catalog" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
