import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function CreateElection() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [level, setLevel] = useState('local');
  const [policyId, setPolicyId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/elections',
        {
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          level,
          policy_id: policyId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSuccess('Election created successfully');
      setTimeout(() => navigate('/elections'), 2000);
    } catch (err) {
      setError('Failed to create election. Please try again.');
    }
  };

  return (
    <div className="mt-3">
      <h2>Create Election</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="description" className="mt-2">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="startDate" className="mt-2">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="endDate" className="mt-2">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="level" className="mt-2">
          <Form.Label>Level</Form.Label>
          <Form.Control
            as="select"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            required
          >
            <option value="local">Local</option>
            <option value="state">State</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="policyId" className="mt-2">
          <Form.Label>Policy ID</Form.Label>
          <Form.Control
            type="text"
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Create
        </Button>
      </Form>
    </div>
  );
}

export default CreateElection;
