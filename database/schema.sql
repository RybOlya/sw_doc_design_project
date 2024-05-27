CREATE DATABASE IF NOT EXISTS voting_system;

USE voting_system;

CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(512) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE Election (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATETIME,
    end_date DATETIME,
    policy_id INT,
    level VARCHAR(50) NOT NULL,
    FOREIGN KEY (policy_id) REFERENCES ElectionPolicy(id)
);

CREATE TABLE Candidate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    election_id INT,
    FOREIGN KEY (election_id) REFERENCES Election(id)
);

CREATE TABLE Vote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT,
    election_id INT,
    FOREIGN KEY (candidate_id) REFERENCES Candidate(id),
    FOREIGN KEY (election_id) REFERENCES Election(id)
);

CREATE TABLE ElectionPolicy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_type VARCHAR(50),
    description TEXT,
    allow_vote_change BOOLEAN DEFAULT FALSE,
    max_votes INT DEFAULT 1
);
