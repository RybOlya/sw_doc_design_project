import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

function ManageCandidates() {
  const { electionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
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

  const handleCandidateModalClose = () => setShowCandidateModal(false);
  const handleCandidateModalShow = (candidate) => {
    setCurrentCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/elections/${electionId}/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(candidates.filter(candidate => candidate.id !== candidateId));
      setSuccess('Candidate deleted successfully.');
    } catch (err) {
      setError('Failed to delete candidate. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const candidateData = {
      name: e.target.name.value,
    };

    try {
      const token = localStorage.getItem('token');
      if (currentCandidate) {
        await axios.put(`http://localhost:5000/api/elections/${electionId}/candidates/${currentCandidate.id}`, candidateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCandidates(candidates.map(candidate => candidate.id === currentCandidate.id ? { ...candidate, ...candidateData } : candidate));
        setSuccess('Candidate updated successfully.');
      } else {
        const response = await axios.post(`http://localhost:5000/api/elections/${electionId}/candidates`, candidateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCandidates([...candidates, response.data.candidate]);
        setSuccess('Candidate added successfully.');
      }
      setShowCandidateModal(false);
    } catch (err) {
      setError('Failed to save candidate. Please try again.');
    }
  };

  return (
    <div>
      <h3>Candidates</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Button variant="link" className="p-1" style={{ float: 'right' }} onClick={() => handleCandidateModalShow(null)}>
        <PlusOutlined /> Add Candidate
      </Button>
      <Table striped bordered hover className="mt-3">
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
              <td>
                <Button variant="link" className="p-1" onClick={() => handleCandidateModalShow(candidate)}>
                  <EditOutlined />
                </Button>
                <Button variant="link" className="p-1" onClick={() => handleDeleteCandidate(candidate.id)}>
                  <DeleteOutlined />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showCandidateModal} onHide={handleCandidateModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{currentCandidate ? 'Edit Candidate' : 'Add Candidate'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" defaultValue={currentCandidate ? currentCandidate.name : ''} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              {currentCandidate ? 'Update Candidate' : 'Add Candidate'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ManageCandidates;
