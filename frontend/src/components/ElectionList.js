import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Container, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

function ElectionList() {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [electionToDelete, setElectionToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/elections');
        setElections(response.data.elections);
      } catch (err) {
        setError('Failed to fetch elections. Please try again later.');
      }
    };

    fetchElections();
  }, []);

  const handleDeleteElection = async (electionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/elections/${electionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setElections(elections.filter(election => election.id !== electionId));
      setSuccess('Election deleted successfully');
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete election. Please try again.');
    }
  };

  const openDeleteModal = (election) => {
    setElectionToDelete(election);
    setShowDeleteModal(true);
  };

  const handleEditElection = (electionId) => {
    navigate(`/manage-elections/${electionId}`);
  };

  return (
    <Container className="mt-5">
      <h2>Elections</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Table striped bordered hover>
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
          {elections.map(election => (
            <tr key={election.id}>
              <td>{election.name}</td>
              <td>{election.description}</td>
              <td>{election.start_date}</td>
              <td>{election.end_date}</td>
              <td>{election.policy_id}</td>
              <td>{election.level}</td>
              <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Button variant="link" className="mr-2" onClick={() => handleEditElection(election.id)}>
                  <EditOutlined />
                </Button>
                <Button variant="link" onClick={() => openDeleteModal(election)}>
                  <DeleteOutlined />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Election</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the election "{electionToDelete?.name}"?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDeleteElection(electionToDelete.id)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ElectionList;
