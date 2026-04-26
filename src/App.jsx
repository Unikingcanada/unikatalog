import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import DonghuaChain from './pages/DonghuaChain';
import ElevatorBuckets from './pages/ElevatorBuckets';
import Catalog from './pages/Catalog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Catalog" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
