import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Table, Alert } from 'react-bootstrap';

function Results() {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/results/${electionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setResults(response.data.results);
      } catch (err) {
        setError('Failed to fetch results. Please try again later.');
      }
    };

    fetchResults();
  }, [electionId]);

  return (
    <div className="mt-3">
      <h2>Election Results</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Votes</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.candidate}>
              <td>{result.candidate}</td>
              <td>{result.votes}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Results;
