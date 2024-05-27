from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(512), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

class Election(db.Model):
    __tablename__ = 'Election'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    policy_id = db.Column(db.Integer, db.ForeignKey('ElectionPolicy.id'))
    level = db.Column(db.String(50), nullable=False)

class Candidate(db.Model):
    __tablename__ = 'Candidate'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    election_id = db.Column(db.Integer, db.ForeignKey('Election.id'))

class Vote(db.Model):
    __tablename__ = 'Vote'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'))
    candidate_id = db.Column(db.Integer, db.ForeignKey('Candidate.id'))
    election_id = db.Column(db.Integer, db.ForeignKey('Election.id'))
    __table_args__ = (db.UniqueConstraint('user_id', 'election_id', name='_user_election_uc'),)  # Ensure one vote per user per election

class ElectionPolicy(db.Model):
    __tablename__ = 'ElectionPolicy'
    id = db.Column(db.Integer, primary_key=True)
    policy_type = db.Column(db.String(50))
    description = db.Column(db.Text)
    allow_vote_change = db.Column(db.Boolean, default=False)
    max_votes = db.Column(db.Integer, default=1)
