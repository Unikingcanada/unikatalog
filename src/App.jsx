import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DonghuaChain from './pages/DonghuaChain';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ElevatorBuckets from './pages/ElevatorBuckets';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
