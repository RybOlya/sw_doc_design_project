from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Election, Candidate, Vote, ElectionPolicy
from datetime import datetime

api = Blueprint('api', __name__)

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User already exists'}), 409

    new_user = User(username=data['username'], is_admin=data['is_admin'])
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

    access_token = create_access_token(identity={'username': user.username, 'is_admin': user.is_admin})
    return jsonify(access_token=access_token)

@api.route('/elections', methods=['GET'])
def get_elections():
    elections = Election.query.all()
    result = []
    for election in elections:
        election_data = {
            'id': election.id,
            'name': election.name,
            'description': election.description,
            'start_date': election.start_date.strftime('%Y-%m-%d %H:%M:%S'),
            'end_date': election.end_date.strftime('%Y-%m-%d %H:%M:%S'),
            'policy_id': election.policy_id,
            'level': election.level
        }
        result.append(election_data)
    return jsonify(elections=result)

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
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%dT%H:%M'),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%dT%H:%M'),
        policy_id=data['policy_id'],
        level=data['level']
    )
    db.session.add(new_election)
    db.session.commit()
    return jsonify({'message': 'Election created successfully'})

@api.route('/vote', methods=['POST'])
@jwt_required()
def vote():
    data = request.get_json()
    user_identity = get_jwt_identity()
    user = User.query.filter_by(username=user_identity['username']).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    election_id = data['election_id']
    election = Election.query.get(election_id)
    policy = ElectionPolicy.query.get(election.policy_id)

    existing_vote = Vote.query.filter_by(user_id=user.id, election_id=election_id).first()

    if existing_vote:
        if not policy.allow_vote_change:
            return jsonify({'message': 'You have already voted in this election and cannot change your vote.'}), 403
        existing_vote.candidate_id = data['candidate_id']
        db.session.commit()
        return jsonify({'message': 'Vote updated successfully'})

    new_vote = Vote(candidate_id=data['candidate_id'], election_id=election_id, user_id=user.id)
    db.session.add(new_vote)
    db.session.commit()
    return jsonify({'message': 'Vote cast successfully'})

@api.route('/elections/<int:election_id>', methods=['GET'])
@jwt_required()
def get_election(election_id):
    election = Election.query.get_or_404(election_id)
    candidates = Candidate.query.filter_by(election_id=election_id).all()
    election_data = {
        'id': election.id,
        'name': election.name,
        'description': election.description,
        'start_date': election.start_date.strftime('%Y-%m-%d %H:%M:%S'),
        'end_date': election.end_date.strftime('%Y-%m-%d %H:%M:%S'),
        'policy_id': election.policy_id,
        'level': election.level,
        'candidates': [{'id': candidate.id, 'name': candidate.name, 'vote_count': Vote.query.filter_by(candidate_id=candidate.id).count()} for candidate in candidates]
    }
    return jsonify({'election': election_data})

@api.route('/elections/<int:election_id>', methods=['PUT'])
@jwt_required()
def update_election(election_id):
    user_identity = get_jwt_identity()
    if not user_identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    election = Election.query.get_or_404(election_id)
    data = request.get_json()
    
    try:
        election.name = data.get('name', election.name)
        election.description = data.get('description', election.description)
        election.start_date = datetime.strptime(data['start_date'].replace(':00.000Z', ''), '%Y-%m-%dT%H:%M')
        election.end_date = datetime.strptime(data['end_date'].replace(':00.000Z', ''), '%Y-%m-%dT%H:%M')
        election.policy_id = data.get('policy_id', election.policy_id)
        db.session.commit()
        return jsonify({'message': 'Election updated successfully'})
    except ValueError as e:
        return jsonify({'error': 'Invalid date format. Please use YYYY-MM-DDTHH:MM format.'}), 400


@api.route('/elections/<int:election_id>', methods=['DELETE'])
@jwt_required()
def delete_election(election_id):
    user_identity = get_jwt_identity()
    if not user_identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    election = Election.query.get_or_404(election_id)

    Vote.query.filter_by(election_id=election_id).delete()
    Candidate.query.filter_by(election_id=election_id).delete()
    
    db.session.delete(election)
    db.session.commit()
    return jsonify({'message': 'Election deleted successfully'})

@api.route('/elections/<int:election_id>/candidates', methods=['GET'])
@jwt_required()
def get_candidates(election_id):
    candidates = Candidate.query.filter_by(election_id=election_id).all()
    output = [{'id': candidate.id, 'name': candidate.name, 'vote_count': Vote.query.filter_by(candidate_id=candidate.id).count()} for candidate in candidates]
    return jsonify({'candidates': output})

@api.route('/elections/<int:election_id>/candidates', methods=['POST'])
@jwt_required()
def add_candidate(election_id):
    user_identity = get_jwt_identity()
    if not user_identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    new_candidate = Candidate(
        name=data['name'],
        election_id=election_id
    )
    db.session.add(new_candidate)
    db.session.commit()
    return jsonify({'message': 'Candidate added successfully'})

@api.route('/elections/<int:election_id>/candidates/<int:candidate_id>', methods=['PUT'])
@jwt_required()
def update_candidate(election_id, candidate_id):
    user_identity = get_jwt_identity()
    if not user_identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    candidate = Candidate.query.get_or_404(candidate_id)
    data = request.get_json()
    candidate.name = data.get('name', candidate.name)
    db.session.commit()
    return jsonify({'message': 'Candidate updated successfully'})

@api.route('/elections/<int:election_id>/candidates/<int:candidate_id>', methods=['DELETE'])
@jwt_required()
def delete_candidate(election_id, candidate_id):
    user_identity = get_jwt_identity()
    if not user_identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    candidate = Candidate.query.get_or_404(candidate_id)
    db.session.delete(candidate)
    db.session.commit()
    return jsonify({'message': 'Candidate deleted successfully'})

@api.route('/results/<int:election_id>', methods=['GET'])
@jwt_required()
def get_results(election_id):
    results = db.session.query(Candidate.name, db.func.count(Vote.id).label('votes')).join(Vote).filter(Vote.election_id == election_id).group_by(Candidate.name).all()
    output = [{'candidate': row[0], 'votes': row[1]} for row in results]
    return jsonify({'results': output})

@api.route('/elections/<int:election_id>/user_votes', methods=['GET'])
@jwt_required()
def get_user_votes(election_id):
    user_identity = get_jwt_identity()
    user = User.query.filter_by(username=user_identity['username']).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    votes = Vote.query.filter_by(user_id=user.id, election_id=election_id).all()
    output = [{'id': vote.candidate.id, 'name': vote.candidate.name} for vote in votes]
    return jsonify({'votes': output})

@api.route('/policies', methods=['GET'])
@jwt_required()
def get_policies():
    print("Received request for policies")
    try:
        policies = ElectionPolicy.query.all()
        output = [{'id': policy.id, 'policy_type': policy.policy_type, 'description': policy.description} for policy in policies]
        print(f"Policies fetched: {output}")
        return jsonify({'policies': output})
    except Exception as e:
        print(f"Error fetching policies: {e}")
        return jsonify({'message': 'Error fetching policies'}), 500

@api.route('/policies', methods=['POST'])
@jwt_required()
def add_policy():
    user_identity = get_jwt_identity()
    if not user_identity.get('is_admin'):
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    new_policy = ElectionPolicy(
        policy_type=data['policy_type'],
        description=data['description'],
        allow_vote_change=data.get('allow_vote_change', False),
        max_votes=data.get('max_votes', 1)
    )
    db.session.add(new_policy)
    db.session.commit()
    return jsonify({'message': 'Policy added successfully', 'policy': {'id': new_policy.id, 'policy_type': new_policy.policy_type, 'description': new_policy.description, 'allow_vote_change': new_policy.allow_vote_change, 'max_votes': new_policy.max_votes}})

@api.route('/policies/<int:policy_id>', methods=['PUT'])
@jwt_required()
def update_policy(policy_id):
    user_identity = get_jwt_identity()
    if not user_identity.get('is_admin'):
        return jsonify({'message': 'Admin access required'}), 403

    policy = ElectionPolicy.query.get_or_404(policy_id)
    data = request.get_json()
    policy.policy_type = data.get('policy_type', policy.policy_type)
    policy.description = data.get('description', policy.description)
    db.session.commit()
    return jsonify({'message': 'Policy updated successfully', 'policy': {'id': policy.id, 'policy_type': policy.policy_type, 'description': policy.description}})

@api.route('/policies/<int:policy_id>', methods=['DELETE'])
@jwt_required()
def delete_policy(policy_id):
    user_identity = get_jwt_identity()
    if not user_identity.get('is_admin'):
        return jsonify({'message': 'Admin access required'}), 403

    policy = ElectionPolicy.query.get_or_404(policy_id)
    db.session.delete(policy)
    db.session.commit()
    return jsonify({'message': 'Policy deleted successfully'})

@api.route('/user/elections', methods=['GET'])
@jwt_required()
def get_user_elections():
    elections = Election.query.all()
    result = []
    for election in elections:
        election_data = {
            'id': election.id,
            'name': election.name,
            'description': election.description,
            'start_date': election.start_date.strftime('%Y-%m-%d %H:%M:%S'),
            'end_date': election.end_date.strftime('%Y-%m-%d %H:%M:%S'),
            'policy_id': election.policy_id,
            'level': election.level
        }
        result.append(election_data)
    return jsonify(elections=result)

def register_blueprints(app):
    app.register_blueprint(api, url_prefix='/api')
