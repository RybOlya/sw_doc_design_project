import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

function PolicyManager({ show, handleClose, fetchPolicies }) {
  const [policyType, setPolicyType] = useState('');
  const [description, setDescription] = useState('');
  const [allowVoteChange, setAllowVoteChange] = useState(false);
  const [maxVotes, setMaxVotes] = useState(1);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/policies',
        {
          policy_type: policyType,
          description: description,
          allow_vote_change: allowVoteChange,
          max_votes: maxVotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPolicies();
      handleClose();
    } catch (err) {
      setError('Failed to create policy. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Policy</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="policyType">
            <Form.Label>Policy Type</Form.Label>
            <Form.Control
              type="text"
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value)}
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
          <Form.Group controlId="allowVoteChange" className="mt-2">
            <Form.Check
              type="checkbox"
              label="Allow Vote Change"
              checked={allowVoteChange}
              onChange={(e) => setAllowVoteChange(e.target.checked)}
            />
          </Form.Group>
          <Form.Group controlId="maxVotes" className="mt-2">
            <Form.Label>Max Votes</Form.Label>
            <Form.Control
              type="number"
              value={maxVotes}
              onChange={(e) => setMaxVotes(parseInt(e.target.value))}
              required
              min="1"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            Create Policy
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default PolicyManager;
