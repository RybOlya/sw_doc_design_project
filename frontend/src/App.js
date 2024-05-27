import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ElectionList from './components/ElectionList';
import VoteForm from './components/VoteForm';
import Results from './components/Results';
import CreateElection from './components/CreateElection';
import { Navbar, Nav } from 'react-bootstrap';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand href="/">Voting System</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/register">Register</Nav.Link>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            <Nav.Link as={Link} to="/elections">Elections</Nav.Link>
          </Nav>
        </Navbar>
        <div className="container mt-3">
          <Routes>
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/elections" element={<ElectionList />} />
            <Route path="/elections/:electionId/candidates" element={<VoteForm />} />
            <Route path="/results/:electionId" element={<Results />} />
            <Route path="/create-election" element={<CreateElection />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
