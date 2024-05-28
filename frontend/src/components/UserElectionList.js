import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Container, Alert } from 'react-bootstrap';

function UserElectionList() {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/elections', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setElections(response.data.elections);
      } catch (err) {
        setError('Failed to fetch elections. Please try again later.');
      }
    };

    fetchElections();
  }, []);

  return (
    <Container className="mt-5">
      <h2>User Elections</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {elections.map((election) => (
            <tr key={election.id}>
              <td>{election.name}</td>
              <td>{election.description}</td>
              <td>{election.start_date}</td>
              <td>{election.end_date}</td>
              <td>
                <Link to={`/user/elections/${election.id}/candidates`}>View Candidates</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default UserElectionList;
