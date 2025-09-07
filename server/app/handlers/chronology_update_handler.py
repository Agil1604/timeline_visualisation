from app.models.project_chronology import ProjectChronology, ChronologyMilestone, ProjectChronologyType
from app import db

def chronology_update_handler(project_id: int, data: dict) -> dict:
    """Обновляет содержимое хронологии.
    """
    project = ProjectChronology.query.get(project_id)
    if not project:
        raise ValueError("no such project")
    result = {
        "created": [],
        "updated": [],
        "deleted": [],
        "conflicts": []
    }
    try:
        settings = data.get('settings', {})
        project.chronology_type = ProjectChronologyType(settings.get('type'))
        for item in data.get('deleted', []):
            id = item['id']
            try:
                milestone = ChronologyMilestone.query.get(id)
                if not milestone or milestone.project_id != project.id:
                    raise Exception(f"Milestone {id} not found")
                db.session.delete(milestone)
                result["deleted"].append(id)
            except Exception as e:
                result["conflicts"].append({
                    "type": "delete",
                    "id": id,
                    "error": str(e)
                })

        for item in data.get('updated', []):
            try:
                milestone = ChronologyMilestone.query.get(item['id'])
                if not milestone or milestone.project_id != project.id:
                    raise Exception(f"Milestone {item['id']} not found")
                milestone.year = item["year"]
                milestone.order = item["order"]
                milestone.title = item["title"]
                milestone.description = item["description"]
                
                result["updated"].append(item['id'])
            except Exception as e:
                result["conflicts"].append({
                    "type": "update",
                    "id": item.get('id'),
                    "error": str(e)
                })

        for item in data.get('created', []):
            try:
                milestone = ChronologyMilestone(
                    year=item['year'],
                    order = item["order"],
                    title = item["title"],
                    description=item['description'],
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
        raise