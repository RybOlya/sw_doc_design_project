import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ListGroup, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function ElectionList() {
  const [elections, setElections] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/elections', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setElections(response.data.elections);

        // Check if user is an admin
        const userResponse = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAdmin(userResponse.data.is_admin);
      } catch (err) {
        console.error('Failed to fetch elections.', err);
      }
    };

    fetchElections();
  }, []);

  const handleCreateElection = () => {
    navigate('/create-election');
  };

  return (
    <div>
      <h2>Elections</h2>
      {isAdmin && (
        <Button variant="primary" onClick={handleCreateElection} className="mb-3">
          Create Election
        </Button>
      )}
      <ListGroup>
        {elections.map((election) => (
          <ListGroup.Item key={election.id}>
            <Link to={`/elections/${election.id}/candidates`}>{election.name}</Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default ElectionList;
