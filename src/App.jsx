import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import DonghuaChain from './pages/DonghuaChain';
import ElevatorBuckets from './pages/ElevatorBuckets';
import Home from './pages/Home';
import WeldedSteel from './pages/WeldedSteel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/WeldedSteel" element={<WeldedSteel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
