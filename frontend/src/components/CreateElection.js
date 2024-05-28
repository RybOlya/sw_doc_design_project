import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function CreateElection() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [level, setLevel] = useState('');
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [newPolicyType, setNewPolicyType] = useState('');
  const [newPolicyDescription, setNewPolicyDescription] = useState('');
  const [allowVoteChange, setAllowVoteChange] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/policies', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPolicies(response.data.policies);
      } catch (err) {
        setError('Failed to fetch policies. Please try again later.');
      }
    };

    fetchPolicies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/elections',
        { name, description, start_date: startDate, end_date: endDate, policy_id: policyId, level },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Election created successfully');
      setTimeout(() => navigate('/elections'), 2000);
    } catch (err) {
      setError('Failed to create election. Please try again.');
    }
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/policies',
        { policy_type: newPolicyType, description: newPolicyDescription, allow_vote_change: allowVoteChange },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPolicies([...policies, response.data.policy]);
      setPolicyId(response.data.policy.id);
      setShowPolicyForm(false);
      setNewPolicyType('');
      setNewPolicyDescription('');
      setAllowVoteChange(false);
    } catch (err) {
      setError('Failed to add policy. Please try again.');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md="6">
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
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="endDate" className="mt-2">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="policyId" className="mt-2">
              <Form.Label>Policy</Form.Label>
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip>{policies.find(policy => policy.id === parseInt(policyId))?.description || ''}</Tooltip>}
              >
                <Form.Control
                  as="select"
                  value={policyId}
                  onChange={(e) => {
                    if (e.target.value === 'add-new') {
                      setShowPolicyForm(true);
                    } else {
                      setPolicyId(e.target.value);
                    }
                  }}
                  required
                >
                  <option value="" disabled>Select Policy</option>
                  {policies.map(policy => (
                    <option key={policy.id} value={policy.id}>{policy.policy_type}</option>
                  ))}
                  <option value="add-new">+ Add new policy</option>
                </Form.Control>
              </OverlayTrigger>
            </Form.Group>
            <Form.Group controlId="level" className="mt-2">
              <Form.Label>Level</Form.Label>
              <Form.Control
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Create Election
            </Button>
          </Form>
          {showPolicyForm && (
            <div className="mt-5">
              <h3>Add New Policy</h3>
              <Form onSubmit={handleAddPolicy}>
                <Form.Group controlId="newPolicyType">
                  <Form.Label>Policy Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={newPolicyType}
                    onChange={(e) => setNewPolicyType(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="newPolicyDescription" className="mt-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={newPolicyDescription}
                    onChange={(e) => setNewPolicyDescription(e.target.value)}
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
                <Button variant="primary" type="submit" className="mt-3">
                  Add Policy
                </Button>
                <Button variant="secondary" className="mt-3" onClick={() => setShowPolicyForm(false)}>
                  Cancel
                </Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default CreateElection;
