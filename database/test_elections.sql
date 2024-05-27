USE voting_system;
INSERT INTO ElectionPolicy (policy_type, description) VALUES ('Default', 'Default voting policy');

INSERT INTO Election (name, description, start_date, end_date, policy_id) 
VALUES ('Presidential Election', 'Election for the next president', NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), 1);

INSERT INTO Candidate (name, election_id) VALUES ('Candidate A', 1);
INSERT INTO Candidate (name, election_id) VALUES ('Candidate B', 1);