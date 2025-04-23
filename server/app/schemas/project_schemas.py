from marshmallow import Schema, fields, validate, ValidationError, validates_schema
from marshmallow_enum import EnumField
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.project import Project, ProjectType
from app.models.project_linear import ProjectLinear, Milestone
from app.models.project_gantt import ProjectGantt, GanttTask, GanttConnection, GanttConnectionType
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


class GanttConnectionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = GanttConnection
        fields = ("id", "type")
    
    id = fields.Int(attribute="target_task_id", data_key="id")
    type = EnumField(GanttConnectionType, by_value=True)

class TaskSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = GanttTask
        exclude = ("project_id", "start_date", "finish_date", "is_critical")
        include_fk = True
    start = fields.Date(attribute="start_date", data_key="start")
    end = fields.Date(attribute="finish_date", data_key="end")
    isCritical = fields.Boolean(attribute="is_critical", data_key="isCritical")
    dependencies = fields.Nested(
        GanttConnectionSchema, 
        many=True, 
        attribute="outgoing_connections",
        dump_only=True
    )

class ProjectGanttUniqueSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ProjectGantt
        include_relationships = True

    tasks = fields.Nested(TaskSchema, many=True)
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