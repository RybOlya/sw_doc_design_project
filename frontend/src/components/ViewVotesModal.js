import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

function ViewVotesModal({ show, onHide, candidateVotes }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Candidate Votes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Votes</th>
            </tr>
          </thead>
          <tbody>
            {candidateVotes.map(candidate => (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>{candidate.vote_count}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ViewVotesModal;
