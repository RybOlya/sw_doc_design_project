import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function VoteForm() {
  const { electionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/elections/${electionId}/candidates`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
      const response = await axios.post(
        'http://localhost:5000/api/vote',
        {
          candidate_id: selectedCandidate,
          election_id: electionId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSuccess('Vote cast successfully');
    } catch (err) {
      setError('Failed to cast vote. Please try again.');
    }
  };

  return (
    <div className="mt-3">
      <h2>Vote</h2>
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
            <option value="">Choose...</option>
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
    </div>
  );
}

export default VoteForm;
