import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ElectionList from './components/ElectionList';
import UserElectionList from './components/UserElectionList';
import UserVoteForm from './components/UserVoteForm';
import Results from './components/Results';
import CreateElection from './components/CreateElection';
import ManageCandidates from './components/ManageCandidates';
import ManageElections from './components/ManageElections';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './resources/logo.svg';

function App() {
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = payload.sub;
      setUsername(user.username);
      setIsAdmin(user.is_admin);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername(null);
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">
              Voting System
            </Navbar.Brand>
            <Nav className="mr-auto">
              {!username && <Nav.Link as={Link} to="/register">Register</Nav.Link>}
              {!username && <Nav.Link as={Link} to="/login">Login</Nav.Link>}
              {username && !isAdmin && <Nav.Link as={Link} to="/user/elections">User Elections</Nav.Link>}
              {username && isAdmin && <Nav.Link as={Link} to="/elections">Elections</Nav.Link>}
              {isAdmin && <Nav.Link as={Link} to="/create-election">Create Election</Nav.Link>}
            </Nav>
            {username && (
              <Nav>
                <NavDropdown title={username} id="basic-nav-dropdown">
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            )}
          </Container>
        </Navbar>
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={username ? <Navigate to={isAdmin ? "/elections" : "/user/elections"} /> : <LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm onLogin={(user) => { setUsername(user.username); setIsAdmin(user.is_admin); }} />} />
            <Route path="/elections" element={isAdmin ? <ElectionList /> : <Navigate to="/user/elections" />} />
            <Route path="/user/elections" element={!isAdmin ? <UserElectionList /> : <Navigate to="/elections" />} />
            <Route path="/user/elections/:electionId/candidates" element={!isAdmin ? <UserVoteForm /> : <Navigate to="/elections" />} />
            <Route path="/results/:electionId" element={<Results />} />
            <Route path="/create-election" element={isAdmin ? <CreateElection /> : <Navigate to="/user/elections" />} />
            <Route path="/manage-candidates/:electionId" element={isAdmin ? <ManageCandidates /> : <Navigate to="/user/elections" />} />
            <Route path="/manage-elections/:electionId" element={isAdmin ? <ManageElections /> : <Navigate to="/user/elections" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
