CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(512) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ElectionPolicy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_type VARCHAR(50),
    description TEXT,
    allow_vote_change BOOLEAN DEFAULT FALSE,
    max_votes INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Election (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATETIME,
    end_date DATETIME,
    policy_id INT,
    FOREIGN KEY (policy_id) REFERENCES ElectionPolicy(id)
);

CREATE TABLE IF NOT EXISTS Candidate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    election_id INT,
    FOREIGN KEY (election_id) REFERENCES Election(id)
);

CREATE TABLE IF NOT EXISTS Vote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    candidate_id INT,
    election_id INT,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (candidate_id) REFERENCES Candidate(id) ON DELETE CASCADE,
    FOREIGN KEY (election_id) REFERENCES Election(id)
);
