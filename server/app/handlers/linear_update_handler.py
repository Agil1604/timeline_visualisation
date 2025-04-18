from app.models.project_linear import ProjectLinear, Milestone
from app import db

def linear_update_handler(project_id: int, data: dict) -> dict:
    project = ProjectLinear.query.get(project_id)
    if not project:
        raise ValueError("no such project")
    result = {
        "created": [],
        "updated": [],
        "deleted": [],
        "conflicts": []
    }

    try:
        project.line_width = data.get('line_width')
        project.balls_size = data.get('balls_size')
        for item in data.get('deleted', []):
            try:
                milestone = Milestone.query.get(item['id'])
                if not milestone or milestone.project_id != project.id:
                    raise Exception(f"Milestone {item['id']} not found")
                db.session.delete(milestone)
                result["deleted"].append(item['id'])
            except Exception as e:
                result["conflicts"].append({
                    "type": "delete",
                    "id": item.get('id'),
                    "error": str(e)
                })

        for item in data.get('updated', []):
            try:
                milestone = Milestone.query.get(item['id'])
                if not milestone or milestone.project_id != project.id:
                    raise Exception(f"Milestone {item['id']} not found")
                milestone.year = item["year"]
                milestone.description = item["description"]
                milestone.color = item["color"]
                
                result["updated"].append(item['id'])
            except Exception as e:
                result["conflicts"].append({
                    "type": "update",
                    "id": item.get('id'),
                    "error": str(e)
                })

        for item in data.get('created', []):
            try:
                milestone = Milestone(
                    year=item['year'],
                    description=item['description'],
                    color=item['color'],
                    project_id=project.id
                )
                db.session.add(milestone)
                db.session.flush()  
                
                result["created"].append({
                    "year": item['year'],
                    "server_id": milestone.id
                })            
            except Exception as e:
                result["conflicts"].append({
                    "type": "create",
                    "year": item['year'],
                    "error": str(e)
                })
        return result
    except Exception as e:
        db.session.rollback()
        raise