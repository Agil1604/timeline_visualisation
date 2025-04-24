from flask import Blueprint, request, jsonify
from app.services.UserService import UserService
from app.schemas.auth_schemas import (
    RegistrationSchema,
    LoginSchema,
    ChangePasswordSchema
)
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    schema = RegistrationSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"message": err.messages}), 400
    
    try:
        user = UserService.register_user(
            email=data['email'],
            password=data['password'],
            nickname=data['nickname']
        )
        return jsonify({
            "user": {
                'email': user.email,
                'nickname': user.nickname,
                'createdAt': user.created_date
            }
        }), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except SQLAlchemyError as e:
        return jsonify({'message': 'Database error'}), 500

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

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    schema = ChangePasswordSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"message": err.messages}), 400
    
    email = get_jwt_identity()
    try:
        user = UserService.get_user(email)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        UserService.change_password(
            user=user,
            old_password=data['old_password'],
            new_password=data['new_password']
        )
        return jsonify({'message': 'Password updated'}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 401
    except SQLAlchemyError as e:
        return jsonify({'message': 'Database error'}), 500

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

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user = get_jwt_identity()
    try:
        user = UserService.get_user(current_user)
        return jsonify({
            'email': user.email,
            'nickname': user.nickname,
            'createdAt': user.created_date
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 401
    except SQLAlchemyError as e:
        return jsonify({'message': 'Database error'}), 500

@auth_bp.route('/', methods=['DELETE'])
@jwt_required()
def delete_user():
    current_user = get_jwt_identity()
    try:
        UserService.delete_user(email=current_user)
        return jsonify({"message": "User was deleted"}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 401
    except SQLAlchemyError as e:
        return jsonify({'message': 'Database error'}), 500