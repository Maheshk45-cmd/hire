import { Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import DashboardBase from './pages/DashboardBase';
import CompanyFlow from './pages/CompanyFlow';
import AddCompany from './pages/AddCompany';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<DashboardBase />} />
        <Route path="/company-flow" element={<CompanyFlow />} />
        <Route path="/add-company" element={<AddCompany />} />
      </Routes>
    </div>
  );
}

export default App;
