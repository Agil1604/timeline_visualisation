from marshmallow import Schema, fields, validate, ValidationError, validates_schema
from marshmallow_enum import EnumField
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.project import Project, ProjectType
from app.models.project_linear import ProjectLinear, Milestone
from app.models.project_gantt import ProjectGantt
from marshmallow_oneofschema import OneOfSchema

class CreateProjectSchema(Schema):
    id = fields.Int(dump_only=True)
    type = EnumField(ProjectType, required=True, by_value=True)
    title = fields.Str(required=True, validate=validate.Length(max=30))
    description = fields.Str(validate=validate.Length(max=250), allow_blank=True)
    created_date = fields.DateTime(dump_only=True)
    last_modified_date = fields.DateTime(dump_only=True)


class BaseProjectSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Project
        include_fk = True
        load_instance = True

    type = EnumField(ProjectType, by_value=True)


class MilestoneSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Milestone
        include_fk = True

class ProjectLinearUniqueSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ProjectLinear
        include_relationships = True
        
    milestones = fields.Nested(MilestoneSchema, many=True)
    type = EnumField(ProjectType, by_value=True)


class ProjectGanttUniqueSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ProjectGantt  # Замените на вашу модель Gantt, если есть
        fields = ("id", "type", "title", "description", "created_date", "last_modified_date")
        load_instance = True
    type = EnumField(ProjectType, by_value=True)

class ProjectPolymorphicUniqueSchema(OneOfSchema):
    type_field = "type"
    type_schemas = {
        ProjectType.LINEAR.value: ProjectLinearUniqueSchema,
        ProjectType.GANTT.value: ProjectGanttUniqueSchema,
        ProjectType.OTHER.value: BaseProjectSchema
    }
    def get_obj_type(self, obj):
        return obj.type.value

class ProjectUpdateSchema(Schema):
    title = fields.Str(validate=validate.Length(max=30))
    description = fields.Str(validate=validate.Length(max=250))

    @validates_schema
    def validate_at_least_one_field(self, data, **kwargs):
        if not data:
            raise ValidationError("Должно быть указано хотя бы одно поле для обновления")
        

class BaseSyncData(Schema):
    created = fields.List(fields.Dict(), required=False)
    updated = fields.List(fields.Dict(), required=False)
    deleted = fields.List(fields.Dict(), required=False)

class LinearSyncData(BaseSyncData):
    line_width = fields.Int(required=False)
    balls_size = fields.Int(required=False)

class GanttSyncData(BaseSyncData):
    pass

updateSchemas = {
    'linear': LinearSyncData(),
    'gantt': GanttSyncData()
}