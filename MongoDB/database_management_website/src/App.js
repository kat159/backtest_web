import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddUserPage from './pages/AddUserPage';
import EditUserPage from './pages/EditUserPage';
import { useState } from 'react';

function App() {
  const [userToEdit, setUserToEdit] = useState();

  return (
    <div className="App">
      <Router>
        <div className="App-header">
          <Route path="/" exact>
            <HomePage setUserToEdit={setUserToEdit} />
          </Route>
          <Route path="/add-user">
            <AddUserPage />
          </Route>
          <Route path="/edit-user">
            <EditUserPage userToEdit={userToEdit} />
          </Route>
        </div>
      </Router>
    </div>
  );
}

export default App;