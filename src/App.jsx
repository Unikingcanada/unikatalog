import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import WeldedSteel from './pages/WeldedSteel';
import ElevatorBuckets from './pages/ElevatorBuckets';
import Catalog from './pages/Catalog';
import Home from './pages/Home';
import DonghuaChain from './pages/DonghuaChain';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/WeldedSteel" element={<WeldedSteel />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
