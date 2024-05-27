import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form, Button, Alert, Container } from 'react-bootstrap';

function UserVoteForm() {
  const { electionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/elections/${electionId}/candidates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCandidates(response.data.candidates);
      } catch (err) {
        setError('Failed to fetch candidates. Please try again later.');
      }
    };

    fetchCandidates();
  }, [electionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/vote',
        { election_id: electionId, candidate_id: selectedCandidate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Vote cast successfully');
    } catch (err) {
      setError('Policy violation');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Vote for Candidate</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="candidate">
          <Form.Label>Select Candidate</Form.Label>
          <Form.Control
            as="select"
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            required
          >
            <option value="" disabled>Select a candidate</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Vote
        </Button>
      </Form>
    </Container>
  );
}

export default UserVoteForm;
