from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Election, Candidate, Vote, ElectionPolicy
from datetime import datetime

api = Blueprint('api', __name__)

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User already exists'}), 409

    new_user = User(username=data['username'])
    new_user.set_password(data['password'])
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        current_app.logger.error('Database operation failed: %s', e)
        return jsonify({'message': 'Registration failed due to a server error.'}), 500

    return jsonify({'message': 'User registered successfully'}), 201

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity={'id': user.id, 'username': user.username, 'is_admin': user.is_admin})
    return jsonify(access_token=access_token)

@api.route('/elections', methods=['GET'])
@jwt_required()
def get_elections():
    elections = Election.query.all()
    output = []
    for election in elections:
        election_data = {
            'id': election.id,
            'name': election.name,
            'description': election.description,
            'start_date': election.start_date,
            'end_date': election.end_date,
            'level': election.level
        }
        output.append(election_data)
    return jsonify({'elections': output})

@api.route('/elections/<int:election_id>/candidates', methods=['GET'])
@jwt_required()
def get_candidates(election_id):
    candidates = Candidate.query.filter_by(election_id=election_id).all()
    output = [{'id': candidate.id, 'name': candidate.name} for candidate in candidates]
    return jsonify({'candidates': output})

@api.route('/elections', methods=['POST'])
@jwt_required()
def create_election():
    user = get_jwt_identity()
    if not user['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    new_election = Election(
        name=data['name'],
        description=data['description'],
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d'),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d'),
        policy_id=data['policy_id'],
        level=data['level']
    )
    db.session.add(new_election)
    db.session.commit()
    return jsonify({'message': 'Election created successfully'})

@api.route('/elections/<int:election_id>/candidates', methods=['POST'])
@jwt_required()
def add_candidate(election_id):
    user = get_jwt_identity()
    if not user['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    new_candidate = Candidate(
        name=data['name'],
        election_id=election_id
    )
    db.session.add(new_candidate)
    db.session.commit()
    return jsonify({'message': 'Candidate added successfully'})

@api.route('/elections/<int:election_id>', methods=['PUT'])
@jwt_required()
def update_election(election_id):
    user = get_jwt_identity()
    if not user['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    election = Election.query.get_or_404(election_id)
    election.name = data.get('name', election.name)
    election.description = data.get('description', election.description)
    election.start_date = datetime.strptime(data.get('start_date', election.start_date.strftime('%Y-%m-%d')), '%Y-%m-%d')
    election.end_date = datetime.strptime(data.get('end_date', election.end_date.strftime('%Y-%m-%d')), '%Y-%m-%d')
    election.policy_id = data.get('policy_id', election.policy_id)
    election.level = data.get('level', election.level)

    db.session.commit()
    return jsonify({'message': 'Election updated successfully'})

@api.route('/elections/<int:election_id>', methods=['DELETE'])
@jwt_required()
def delete_election(election_id):
    user = get_jwt_identity()
    if not user['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    election = Election.query.get_or_404(election_id)
    db.session.delete(election)
    db.session.commit()
    return jsonify({'message': 'Election deleted successfully'})

@api.route('/elections/<int:election_id>/candidates/<int:candidate_id>', methods=['PUT'])
@jwt_required()
def update_candidate(election_id, candidate_id):
    user = get_jwt_identity()
    if not user['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    candidate = Candidate.query.get_or_404(candidate_id)
    data = request.get_json()
    candidate.name = data.get('name', candidate.name)
    db.session.commit()
    return jsonify({'message': 'Candidate updated successfully'})

@api.route('/elections/<int:election_id>/candidates/<int:candidate_id>', methods=['DELETE'])
@jwt_required()
def delete_candidate(election_id, candidate_id):
    user = get_jwt_identity()
    if not user['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    candidate = Candidate.query.get_or_404(candidate_id)
    db.session.delete(candidate)
    db.session.commit()
    return jsonify({'message': 'Candidate deleted successfully'})

@api.route('/vote', methods=['POST'])
@jwt_required()
def vote():
    data = request.get_json()
    user_id = get_jwt_identity()['id']
    election_id = data['election_id']

    election = Election.query.get(election_id)
    policy = ElectionPolicy.query.get(election.policy_id)

    if not policy.allow_vote_change:
        existing_vote = Vote.query.filter_by(user_id=user_id, election_id=election_id).first()
        if existing_vote:
            return jsonify({'message': 'You have already voted in this election and cannot change your vote.'}), 403

    new_vote = Vote(candidate_id=data['candidate_id'], election_id=election_id)
    db.session.add(new_vote)
    db.session.commit()
    return jsonify({'message': 'Vote cast successfully'})

@api.route('/results/<int:election_id>', methods=['GET'])
@jwt_required()
def get_results(election_id):
    results = db.session.query(Candidate.name, db.func.count(Vote.id).label('votes')).join(Vote).filter(Vote.election_id == election_id).group_by(Candidate.name).all()
    output = [{'candidate': row[0], 'votes': row[1]} for row in results]
    return jsonify({'results': output})

def register_blueprints(app):
    app.register_blueprint(api, url_prefix='/api')
