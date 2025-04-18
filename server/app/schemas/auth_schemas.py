from marshmallow import Schema, fields, validate, ValidationError
from email_validator import validate_email, EmailNotValidError

def validate_email_format(email):
    try:
        emailinfo = validate_email(email, check_deliverability=True)
        return emailinfo.normalized
    except EmailNotValidError as e:
        raise ValidationError(str(e))

class UserSchema(Schema):
    email = fields.Email(required=True, validate=[
        validate.Length(max=254),
        validate_email_format
    ])
    nickname = fields.Str(required=True, validate=[
        validate.Length(min=1, max=16),
        validate.Regexp(r'^[a-zA-Z0-9_-]+$', error="Invalid characters"),
        validate.NoneOf([" "], error="Nickname cannot contain spaces")
    ])

class RegistrationSchema(UserSchema):
    password = fields.Str(required=True, validate=[
        validate.Length(min=8, max=64)
    ])

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class ChangePasswordSchema(Schema):
    old_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=[
        validate.Length(min=8, max=64)
    ])