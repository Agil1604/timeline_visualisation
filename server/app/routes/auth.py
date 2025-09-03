from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from marshmallow import ValidationError

from app.services.user_service import UserService
from app.schemas.auth_schemas import LoginSchema

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    schema = LoginSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"message": err.messages}), 400
    
    try:
        user = UserService.login_user(
            email=data['email'],
            password=data['password']
        )
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user.email)
        refresh_token = create_refresh_token(identity=user.email)
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'email': user.email,
                'nickname': user.nickname,
                'createdAt': user.created_date
            },
        }), 200
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    try:
        new_access_token = create_access_token(identity=current_user)
        new_refresh_token = create_refresh_token(identity=current_user)
        return jsonify({
            'access_token': new_access_token,
            'refresh_token': new_refresh_token
        }), 200
    except Exception as e:
        return jsonify({'message': 'Token generation failed'}), 500