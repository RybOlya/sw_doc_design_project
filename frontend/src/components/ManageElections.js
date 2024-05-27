import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Container, Modal, Form, Row, Col } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import ViewVotesModal from './ViewVotesModal'; // Import the new component

function ManageElections() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showVotesModal, setShowVotesModal] = useState(false);
  const [candidateVotes, setCandidateVotes] = useState([]);
  const [candidateName, setCandidateName] = useState('');
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editingElection, setEditingElection] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [policies, setPolicies] = useState([]);
  const [level, setLevel] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/elections/${electionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Election data:', response.data); // Debug log
        const electionData = response.data.election;
        setElection(electionData);
        setCandidates(electionData.candidates);
        setName(electionData.name);
        setDescription(electionData.description);
        setStartDate(electionData.start_date.replace(' ', 'T')); // For datetime-local input
        setEndDate(electionData.end_date.replace(' ', 'T')); // For datetime-local input
        setPolicyId(electionData.policy_id);
        setLevel(electionData.level);
      } catch (err) {
        setError('Failed to fetch election. Please try again later.');
      }
    };

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

    fetchElection();
    fetchPolicies();
  }, [electionId]);

  const handleDeleteCandidate = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`Deleting candidate with ID: ${candidateId}`); // Debug log
      await axios.delete(`http://localhost:5000/api/elections/${electionId}/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(candidates.filter(candidate => candidate.id !== candidateId));
      setSuccess('Candidate deleted successfully');
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting candidate:', err); // Debug log
      setError('Failed to delete candidate. Please try again.');
    }
  };

  const handleCandidateSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingCandidate) {
        await axios.put(`http://localhost:5000/api/elections/${electionId}/candidates/${editingCandidate.id}`, 
          { name: candidateName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCandidates(candidates.map(candidate => candidate.id === editingCandidate.id ? { ...candidate, name: candidateName } : candidate));
        setSuccess('Candidate updated successfully');
      } else {
        const response = await axios.post(`http://localhost:5000/api/elections/${electionId}/candidates`, 
          { name: candidateName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCandidates([...candidates, { id: response.data.id, name: candidateName }]);
        setSuccess('Candidate added successfully');
      }
      setShowCandidateModal(false);
      setCandidateName('');
      setEditingCandidate(null);
    } catch (err) {
      setError('Failed to submit candidate. Please try again.');
    }
  };

  const handleElectionSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/elections/${electionId}`, 
        { name, description, start_date: new Date(startDate).toISOString(), end_date: new Date(endDate).toISOString(), policy_id: policyId, level },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setElection({ ...election, name, description, start_date: startDate, end_date: endDate, policy_id: policyId, level });
      setSuccess('Election updated successfully');
      setShowElectionModal(false);
      setEditingElection(false);
    } catch (err) {
      setError('Failed to update election. Please try again.');
    }
  };

  const openDeleteModal = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteModal(true);
  };

  const openCandidateModal = (candidate) => {
    setEditingCandidate(candidate);
    setCandidateName(candidate ? candidate.name : '');
    setShowCandidateModal(true);
  };

  const openElectionModal = () => {
    setShowElectionModal(true);
  };

  const openVotesModal = () => {
    setCandidateVotes(candidates);
    setShowVotesModal(true);
  };

  const handleDeleteElection = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/elections/${electionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Election deleted successfully');
      setTimeout(() => navigate('/elections'), 2000);
    } catch (err) {
      setError('Failed to delete election. Please try again.');
    }
  };

  if (!election) {
    return <Container><Alert variant="info">Loading election details...</Alert></Container>;
  }

  return (
    <Container className="mt-5">
      <h2>Manage Election</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Table striped bordered hover className="table-center">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Policy ID</th>
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{election.name}</td>
            <td>{election.description}</td>
            <td>{election.start_date}</td>
            <td>{election.end_date}</td>
            <td>{election.policy_id}</td>
            <td>{election.level}</td>
            <td>
              <Button variant="link" className="p-1" onClick={openElectionModal}>
                <EditOutlined />
              </Button>
              <Button variant="link" className="p-1" onClick={() => setShowDeleteModal(true)}>
                <DeleteOutlined />
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
      <Row className="align-items-center mb-3">
        <Col>
          <h3>Candidates</h3>
        </Col>
        <Col className="text-right">
          <Button variant="link" className="p-1 ml-auto" onClick={() => openCandidateModal(null)}>
            <PlusOutlined /> Add Candidate
          </Button>
        </Col>
      </Row>
      <Table striped bordered hover className="table-center">
        <thead>
          <tr>
            <th>Name</th>
            <th>Votes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.id}>
              <td>{candidate.name}</td>
              <td>{candidate.vote_count}</td>
              <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button variant="link" className="p-1" onClick={() => openCandidateModal(candidate)}>
                  <EditOutlined />
                </Button>
                <Button variant="link" className="p-1" onClick={() => openDeleteModal(candidate)}>
                  <DeleteOutlined />
                </Button>
                <Button variant="link" className="p-1" onClick={openVotesModal}>
                  <EyeOutlined />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete {candidateToDelete ? 'Candidate' : 'Election'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {candidateToDelete ? `the candidate "${candidateToDelete.name}"` : `the election "${election.name}"`}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => candidateToDelete ? handleDeleteCandidate(candidateToDelete.id) : handleDeleteElection()}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showCandidateModal} onHide={() => setShowCandidateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingCandidate ? 'Edit Candidate' : 'Add Candidate'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Candidate Name</Form.Label>
              <Form.Control 
                type="text" 
                value={candidateName} 
                onChange={(e) => setCandidateName(e.target.value)} 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCandidateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCandidateSubmit}>
            {editingCandidate ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showElectionModal} onHide={() => setShowElectionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Election</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
              <Form.Control
                as="select"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                required
              >
                <option value="" disabled>Select Policy</option>
                {policies.map(policy => (
                  <option key={policy.id} value={policy.id}>{policy.policy_type}</option>
                ))}
              </Form.Control>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowElectionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleElectionSubmit}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
      <ViewVotesModal 
        show={showVotesModal} 
        onHide={() => setShowVotesModal(false)} 
        candidateVotes={candidateVotes} 
      />
    </Container>
  );
}

export default ManageElections;
