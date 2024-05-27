USE voting_system;

-- Insert Election Policies
INSERT INTO ElectionPolicy (policy_type, description) VALUES 
('Default', 'Default voting policy'),
('Long-term', 'Long-term voting policy allowing multiple votes over a period'),
('Short-term', 'Short-term voting policy with strict voting period');

-- Insert Elections
INSERT INTO Election (name, description, start_date, end_date, policy_id, level) VALUES 
('Presidential Election 2024', 'Election for the next president of the country', NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), 1, 'National'),
('Local Council Election 2024', 'Election for local council members in various districts', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 2, 'Local'),
('State Governor Election 2024', 'Election for the state governor', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 3, 'State'),
('School Board Election 2024', 'Election for the school board members', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 1, 'Local'),
('Mayor Election 2024', 'Election for the mayor of the city', DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 2, 'City'),
('Senate Election 2024', 'Election for the senate members', DATE_ADD(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 3, 'National'),
('Parliamentary Election 2024', 'Election for parliament members', DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 35 DAY), 1, 'National'),
('National Referendum 2024', 'Public vote on a major national issue', DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 40 DAY), 2, 'National');

-- Insert Candidates for Presidential Election
INSERT INTO Candidate (name, election_id) VALUES 
('John Smith', 1), 
('Jane Doe', 1), 
('Michael Johnson', 1);

-- Insert Candidates for Local Council Election
INSERT INTO Candidate (name, election_id) VALUES 
('Emily Davis', 2), 
('Christopher Brown', 2), 
('Jessica Miller', 2);

-- Insert Candidates for State Governor Election
INSERT INTO Candidate (name, election_id) VALUES 
('Daniel Wilson', 3), 
('Olivia Martinez', 3), 
('William Taylor', 3);

-- Insert Candidates for School Board Election
INSERT INTO Candidate (name, election_id) VALUES 
('Sophia Anderson', 4), 
('James Thomas', 4), 
('Isabella Jackson', 4);

-- Insert Candidates for Mayor Election
INSERT INTO Candidate (name, election_id) VALUES 
('Liam White', 5), 
('Mason Harris', 5), 
('Amelia Clark', 5);

-- Insert Candidates for Senate Election
INSERT INTO Candidate (name, election_id) VALUES 
('Lucas Lewis', 6), 
('Charlotte Young', 6), 
('Henry King', 6);

-- Insert Candidates for Parliamentary Election
INSERT INTO Candidate (name, election_id) VALUES 
('Ava Scott', 7), 
('Elijah Green', 7), 
('Mia Hall', 7);

-- Insert Candidates for National Referendum
INSERT INTO Candidate (name, election_id) VALUES 
('Benjamin Adams', 8), 
('Ella Baker', 8), 
('Sebastian Nelson', 8);
