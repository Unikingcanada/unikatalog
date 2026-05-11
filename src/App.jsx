import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGate from './components/layout/AuthGate'
import Home from './pages/Home';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import ForgedChain from './pages/ForgedChain';
import RollerConfigurator from './pages/RollerConfigurator';
import RFQCart from './pages/RFQCart';
import ElevatorBuckets from './pages/ElevatorBuckets';
import Catalog from './pages/Catalog';
import TableTopChains from './pages/TableTopChains';
import BucketCompare from './pages/BucketCompare';
import ChainReviewAdmin from './pages/ChainReviewAdmin';
import ImportCenter from './pages/ImportCenter';
import ICSessionResumePage from './pages/ICSessionResumePage';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthGate>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/TableTopChains" element={<TableTopChains />} />
        <Route path="/BucketCompare" element={<BucketCompare />} />
        <Route path="/admin/chain-review" element={<ChainReviewAdmin />} />
        <Route path="/admin/import-center" element={<ImportCenter />} />
        <Route path="/admin/import-center/session/:id" element={<ICSessionResumePage />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </BrowserRouter>
    </AuthGate>
  )
}

export default App