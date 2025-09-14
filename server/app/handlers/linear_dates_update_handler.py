from datetime import datetime
from app.models.project_linear_dates import ProjectLinearDates, LinearDatesMilestone
from app import db

def linear_dates_update_handler(project_id: int, data: dict) -> dict:
    """Обновляет содержимое линейных проектов с датами

    Args:
        project_id (int): ID проекта, содержимое которого обновляется.
        data (dict): Словарь с данными для обновления. Структура:
            {
                'created': [list новых milestones],
                'updated': [list измененных milestones],
                'deleted': [list ID удаляемых milestones],
                'settings': {
                    'line_width': int
                    'balls_size': int
                }
            }

    Returns:
        dict: Результат выполнения операций. Пример структуры:
        {
            'created': [{'date': str, 'server_id': int}],  # Для созданных элементов
            'updated': [int],                               # ID обновленных элементов
            'deleted': [int],                               # ID удаленных элементов
            'conflicts': [                                  # Ошибки при выполнении
                {
                    'type': str,                            # Тип операции ('create', 'update', 'delete')
                    'id': int | None,                       # ID элемента (если есть)
                    'date': str | None,                     # Дата (для создания)
                    'error': str                            # Сообщение об ошибке
                }
            ]
        }

    Raises:
        ValueError: Если проект с указанным ID не найден.
        Exception: Общие ошибки выполнения с откатом транзакции.

    Examples:
        Пример входных данных:
        >>> data = {
        ...     'created': [{'date': '2024-05-20', 'description': 'Test', 'color': '#ffffff'}],
        ...     'updated': [{'id': 1, 'date': '2023-12-15', 'description': 'Updated'}],
        ...     'deleted': [{'id': 2}],
        ...     'settings': {
        ...         'line_width': 6,
        ...         'balls_size': 60
        ...     }
        ... }
        >>> linear_dates_update_handler(123, data)
    """
    project = ProjectLinearDates.query.get(project_id)
    if not project:
        raise ValueError("no such project")
    result = {
        "created": [],
        "updated": [],
        "deleted": [],
        "conflicts": []
    }
    print(data)
    try:
        settings = data.get('settings', {})
        if 'line_width' in settings:
            project.line_width = settings.get('line_width')
        if 'balls_size' in settings:
            project.balls_size = settings.get('balls_size')
        
        for item in data.get('deleted', []):
            id = item['id']
            try:
                milestone = LinearDatesMilestone.query.get(id)
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
                milestone = LinearDatesMilestone.query.get(item['id'])
                if not milestone or milestone.project_id != project.id:
                    raise Exception(f"Milestone {item['id']} not found")
                
                date_obj = datetime.strptime(item["date"], '%Y-%m-%d')
                milestone.date = date_obj
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
                date_obj = datetime.strptime(item['date'], '%Y-%m-%d')
                
                milestone = LinearDatesMilestone(
                    date=date_obj,
                    description=item['description'],
                    color=item['color'],
                    project_id=project.id
                )
                db.session.add(milestone)
                db.session.flush()  
                
                result["created"].append({
                    "date": item['date'],
                    "server_id": milestone.id
                })            
            except Exception as e:
                result["conflicts"].append({
                    "type": "create",
                    "date": item.get('date'),
                    "error": str(e)
                })
        print(result)
        db.session.commit()
        return result
        
    except Exception as e:
        db.session.rollback()
        raise
