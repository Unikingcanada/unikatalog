import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RFQCart from './pages/RFQCart';
import RollerConfigurator from './pages/RollerConfigurator';
import Catalog from './pages/Catalog';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
