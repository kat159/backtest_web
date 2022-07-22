import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import MyCriteria from './components/layout/content/MyCriteria/MyCriteria';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import SignUpPage from './views/SignUpPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Router>
  );
}

export default App;
