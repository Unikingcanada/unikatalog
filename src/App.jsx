import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import DonghuaChain from './pages/DonghuaChain';
import WeldedSteel from './pages/WeldedSteel';
import ElevatorBuckets from './pages/ElevatorBuckets';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/WeldedSteel" element={<WeldedSteel />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
