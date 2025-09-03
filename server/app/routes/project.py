from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.schemas.project_schemas import (
    BaseProjectSchema, 
    ProjectPolymorphicUniqueSchema,
    CreateProjectSchema,
    ProjectMetadataUpdateSchema,
    ProjectUpdateSchema,
)
from app.services.project_service import ProjectService

project_bp = Blueprint('project', __name__)

@project_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_projects():
    schema = BaseProjectSchema()
    current_user = get_jwt_identity()
    try:
        projects = ProjectService.get_user_projects(
            current_user=current_user
        )
        return jsonify(schema.dump(projects, many=True)), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except SQLAlchemyError as e:
        return jsonify({"message": str(e)}), 500
    
@project_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    try:
        project = ProjectService.get_project(project_id=project_id)
        schema = ProjectPolymorphicUniqueSchema()
        data = schema.dump(project)
        return jsonify(data), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except SQLAlchemyError as e:
        return jsonify({"message": str(e)}), 500
    

@project_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    current_user = get_jwt_identity()
    schema = CreateProjectSchema()

    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"message": err.messages}), 400

    try:
        project = ProjectService.create_project(
            current_user=current_user,
            project_type=data['type'],
            title=data['title'],
            description=data.get('description', '')
        )
        return jsonify(schema.dump(project)), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except SQLAlchemyError as e:
        return jsonify({'message': str(e)}), 500

@project_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project_metadata(project_id):
    current_user = get_jwt_identity()
    schema = ProjectMetadataUpdateSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"message": err.messages}), 400

    try:
        project = ProjectService.update_project_metadata(
            project_id=project_id,
            current_user=current_user,
            new_title=data.get("title"),
            new_description=data.get("description")
        )
        return jsonify(BaseProjectSchema().dump(project)), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except PermissionError as e:
        return jsonify({'message': str(e)}), 403
    except IntegrityError as e:
        return jsonify({'message': 'Conflict detected'}), 409
    except SQLAlchemyError as e:
        return jsonify({'message': str(e)}), 500

@project_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    current_user = get_jwt_identity()
    try:
        ProjectService.delete_project(
            project_id=project_id, 
            current_user=current_user
        )
        return jsonify({"message": "Проект удалён"}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except PermissionError as e:
        return jsonify({'message': str(e)}), 403
    except SQLAlchemyError as e:
        return jsonify({'message': str(e)}), 500
    

@project_bp.route('/<int:project_id>', methods=['PATCH'])
@jwt_required()
def update_project(project_id):
    current_user = get_jwt_identity()
    schema = ProjectUpdateSchema()

    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"message": err.messages}), 400

    try:
        result = ProjectService.update_project(
            project_id=project_id, 
            current_user=current_user,
            data=data
        )
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except PermissionError as e:
        return jsonify({'message': str(e)}), 403
    except SQLAlchemyError as e:
        return jsonify({'message': str(e)}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    