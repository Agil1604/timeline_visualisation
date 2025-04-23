from app.models.project_gantt import ProjectGantt, GanttTask, GanttConnection, GanttConnectionType
from datetime import datetime
from app import db

def gantt_update_handler(project_id: int, data: dict) -> dict:
    """Обновляет содержимое диаграммы Ганта.

    Args:
        project_id (int): ID проекта, содержимое которого обновляется.
        data (dict): Словарь с данными для обновления. Структура:
            {
                'created': [{'id': int, 'name': str, 'description': str, 'start_date': Date, 'finish_date': Date, 'progress': int, 'is_critical': bool}, ...],
                'updated': [{'id': int, 'name': str, 'description': str, 'start_date': Date, 'finish_date': Date, 'progress': int, 'is_critical': bool}, ...],
                'deleted': [int]
            }

    Returns:
        dict: Результат выполнения операций. Пример структуры:
        {
            'created': [{'client_id': int, 'server_id': int}],  # Для созданных элементов
            'updated': [int],                                   # ID обновленных элементов
            'deleted': [int],                                   # ID удаленных элементов
            'conflicts': [                                      # Ошибки при выполнении
                {
                    'type': str,                                # Тип операции ('create', 'update', 'delete')
                    'id': int | None,                           # ID элемента (если есть)
                    'error': str                                # Сообщение об ошибке
                }
            ]
        }

    """
    project = ProjectGantt.query.get(project_id)
    if not project:
        raise ValueError("no such project")
    result = {
        "created": [],
        "updated": [],
        "deleted": [],
        "conflicts": []
    }
    client_id_to_server_id = {}

    try:
        for item in data.get('deleted', []):
            try:
                task = GanttTask.query.get(item['id'])
                if not task or task.project_id != project_id:
                    raise Exception(f"Task {item['id']} not found")
                db.session.delete(task)
                result["deleted"].append(item['id'])
            except Exception as e:
                result["conflicts"].append({
                    "type": "delete",
                    "id": item['id'],
                    "error": str(e)
                })

        for item in data.get('created', []):
            try:
                start_date = datetime.strptime(item['start'], '%Y-%m-%d')
                finish_date = datetime.strptime(item['end'], '%Y-%m-%d')
                new_task = GanttTask(
                    name=item['name'],
                    description=item.get('description', ''),
                    start_date=start_date,
                    finish_date=finish_date,
                    progress=item['progress'],
                    is_critical=item['isCritical'],
                    project_id=project_id
                )
                db.session.add(new_task)
                db.session.flush()
                client_id = item['id']
                client_id_to_server_id[client_id] = new_task.id
                result["created"].append({
                    "client_id": client_id,
                    "server_id": new_task.id
                })
            except Exception as e:
                result["conflicts"].append({
                    "type": "create",
                    "client_id": item.get('id'),
                    "error": str(e)
                })

        for item in data.get('updated', []):
            try:
                task = GanttTask.query.get(item['id'])
                if not task or task.project_id != project_id:
                    raise Exception(f"Task {item['id']} not found")

                task.name = item['name']
                task.description = item.get('description', '')
                task.start_date = datetime.strptime(item['start'], '%Y-%m-%d')
                task.finish_date = datetime.strptime(item['end'], '%Y-%m-%d')
                task.progress = item['progress']
                task.is_critical = item['isCritical']

                GanttConnection.query.filter_by(source_task_id=task.id).delete()

                for dep in item.get('dependencies', []):
                    target_client_id = dep['id']
                    target_server_id = client_id_to_server_id.get(target_client_id, target_client_id)
                    target_task = GanttTask.query.get(target_server_id)
                    if not target_task or target_task.project_id != project_id:
                        raise Exception(f"Dependency task {target_client_id} not found")
                    conn = GanttConnection(
                        source_task_id=task.id,
                        target_task_id=target_server_id,
                        type=GanttConnectionType(dep['type'])
                    )
                    db.session.add(conn)
                result["updated"].append(item['id'])
            except Exception as e:
                result["conflicts"].append({
                    "type": "update",
                    "id": item.get('id'),
                    "error": str(e)
                })

        for item in data.get('created', []):
            client_id = item['id']
            server_id = client_id_to_server_id.get(client_id)
            if not server_id:
                continue
            for dep in item.get('dependencies', []):
                try:
                    target_client_id = dep['id']
                    target_server_id = client_id_to_server_id.get(target_client_id, target_client_id)
                    target_task = GanttTask.query.get(target_server_id)
                    if not target_task or target_task.project_id != project_id:
                        raise Exception(f"Dependency task {target_client_id} not found")
                    conn = GanttConnection(
                        source_task_id=server_id,
                        target_task_id=target_server_id,
                        type=GanttConnectionType(dep['type'])
                    )
                    db.session.add(conn)
                except Exception as e:
                    result["conflicts"].append({
                        "type": "create_connection",
                        "client_id": client_id,
                        "target_client_id": target_client_id,
                        "error": str(e)
                    })
        return result
    except Exception as e:
        raise