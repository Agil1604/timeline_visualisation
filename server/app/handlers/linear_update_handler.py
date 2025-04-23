from app.models.project_linear import ProjectLinear, Milestone
from app import db

def linear_update_handler(project_id: int, data: dict) -> dict:
    """Обновляет содержимое линейных проектов

    Args:
        project_id (int): ID проекта, содержимое которого обновляется.
        data (dict): Словарь с данными для обновления. Структура:
            {
                'created': [list новых milestones],
                'updated': [list измененных milestones],
                'deleted': [list ID удаляемых milestones]
                'line_width': int
                'balls_size': int
            }

    Returns:
        dict: Результат выполнения операций. Пример структуры:
        {
            'created': [{'year': int, 'server_id': int}],  # Для созданных элементов
            'updated': [int],                               # ID обновленных элементов
            'deleted': [int],                               # ID удаленных элементов
            'conflicts': [                                  # Ошибки при выполнении
                {
                    'type': str,                            # Тип операции ('create', 'update', 'delete')
                    'id': int | None,                       # ID элемента (если есть)
                    'year': int | None,                     # Год (для создания)
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
        ...     'created': [{'year': 2024, 'description': 'Test', 'color': '#ffffff'}],
        ...     'updated': [{'id': 1, 'year': 2023, 'description': 'Updated'}],
        ...     'deleted': [{'id': 2}],
        ...     'line_width': 6,
        ...     'balls_size': 60
        ... }
        >>> linear_update_handler(123, data)
    """
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
            id = item['id']
            try:
                milestone = Milestone.query.get(id)
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
        raise