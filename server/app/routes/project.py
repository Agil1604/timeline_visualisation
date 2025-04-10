from flask import Blueprint, request, jsonify
from app.schemas.project_schemas import (
    BaseProjectSchema, 
    ProjectPolymorphicUniqueSchema,
    CreateProjectSchema,
    ProjectUpdateSchema,
    SyncData
)
from app.services.ProjectService import ProjectService
from app.models.project_linear import ProjectLinear

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from app import db

project_bp = Blueprint('project', __name__)

@project_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_projects():
    schema = BaseProjectSchema()
    current_user = get_jwt_identity()
    try:
        projects = ProjectService.get_user_projects(
            owner=current_user
        )
        return jsonify(schema.dump(projects, many=True)), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
@project_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    try:
        project = ProjectService.get_project(project_id)
        schema = ProjectPolymorphicUniqueSchema()
        data = schema.dump(project)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@project_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    current_user = get_jwt_identity()
    schema = CreateProjectSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    try:
        project = ProjectService.create_project(
            owner=current_user,
            project_type=data['type'],
            title=data['title'],
            description=data.get('description', '')
        )
        return jsonify(schema.dump(project)), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
@project_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    current_user = get_jwt_identity()
    schema = ProjectUpdateSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    try:
        project = ProjectService.update_project(
            project_id=project_id,
            current_user=current_user,
            new_title=data.get("title"),
            new_description=data.get("description")
        )
        return jsonify(BaseProjectSchema().dump(project)), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except IntegrityError as e:
        return jsonify({'error': 'Conflict detected'}), 409

@project_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    current_user = get_jwt_identity()
    try:
        ProjectService.delete_project(project_id, current_user)
        return jsonify({"message": "Проект удалён"}), 200
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    

from app.handlers.linear_update_handler import linear_update_handler
from app.handlers.gantt_update_handler import gantt_update_handler

update_handlers = {
    'linear': linear_update_handler,
    'gantt': gantt_update_handler
}

@project_bp.route('/<project_type>/<int:project_id>', methods=['PATCH'])
@jwt_required()
def update(project_type, project_id):
    current_user = get_jwt_identity()
    try:
        schema = SyncData()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    try:
        project = ProjectService.get_project(project_id)
        if project.owner != current_user:
            return jsonify({'error': "You don't own this project"}), 403
        if project_type not in update_handlers:
            return jsonify({'error': "Project type not found"}), 404
        
        handler = update_handlers[project_type]
        result = handler(project_id, data)
        db.session.commit()
        return jsonify(result), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    