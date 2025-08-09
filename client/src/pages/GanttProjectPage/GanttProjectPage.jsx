import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  select,
  scaleTime,
  scaleBand,
  timeParse,
  timeFormat,
  axisBottom,
  axisLeft,
  timeDay,
  min,
  max,
  line,
  curveBasis
} from 'd3';

import { projectService } from '../../services/ProjectService';
import TaskModal from './TaskModal';
import TaskForm from './TaskForm';
import './sharedStyles.css';
import styles from './GanttProjectPage.module.css';

const GanttChart = () => {
  const { project: projectId } = useParams();
  const containerRef = useRef();
  const svgRef = useRef();
  const tooltipRef = useRef();
  const dataRef = useRef();

  const [tasks, setTasks] = useState([]);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const margin = useMemo(() => ({
    top: 20,
    right: 30,
    bottom: 40,
    left: 200
  }), []);

  // Загрузка проекта
  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await projectService.getProject(projectId);
        setTasks(projectData.tasks);
        console.log(projectData)
        setOriginalTasks(projectData.tasks);
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
      }
    };

    if (projectId) loadProject();
  }, [projectId]);

  // Расчет размеров графика
  useEffect(() => {
    if (!tasks.length || !containerRef.current) return;

    const parseTime = timeParse('%Y-%m-%d');
    const parsedTasks = tasks.map(task => ({
      ...task,
      start: parseTime(task.start),
      end: parseTime(task.end)
    }));

    const minDate = min(parsedTasks, d => d.start);
    const maxDate = max(parsedTasks, d => d.end);
    const containerWidth = containerRef.current.clientWidth;
    const dayWidth = 50;
    const daysDiff = timeDay.count(minDate, maxDate) + 1;
    const width = Math.max(containerWidth, daysDiff * dayWidth + margin.left + margin.right);

    const bandHeight = 50;
    const paddingBetween = 10;
    const innerHeight = tasks.length * (bandHeight + paddingBetween);
    const height = innerHeight + margin.top + margin.bottom;

    setDimensions({ width, height });
  }, [tasks, margin]);

  // Логика сохранения
  const handleSave = useCallback(async () => {
    if (!projectId) return;

    const created = tasks.filter(t => !originalTasks.some(ot => ot.id === t.id));
    const updated = tasks.filter(t =>
      originalTasks.some(ot =>
        ot.id === t.id && (
          ot.name !== t.name ||
          ot.description !== t.description ||
          ot.start !== t.start ||
          ot.end !== t.end ||
          ot.progress !== t.progress ||
          ot.isCritical !== t.isCritical ||
          JSON.stringify(ot.dependencies) !== JSON.stringify(t.dependencies)
        )
      )
    );
    const deleted = originalTasks.filter(ot => !tasks.some(t => t.id === ot.id));

    const payload = {
      created: created.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        start: t.start,
        end: t.end,
        progress: t.progress,
        isCritical: t.isCritical,
        dependencies: t.dependencies
      })),
      updated: updated.map(t => ({
        id: t.id,
        ...t
      })),
      deleted: deleted.map(t => ({ id: t.id }))
    };

    try {
      await projectService.update("gantt", projectId, payload);
      const projectData = await projectService.getProject(projectId);
      setTasks(projectData.tasks);
      setOriginalTasks(projectData.tasks);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка сохранения! Проверьте консоль для деталей.');
    }
  }, [projectId, tasks, originalTasks]);

  // Обработчики клавиш и закрытия вкладки
  useEffect(() => {
    dataRef.current = { handleSave, tasks, originalTasks, projectId };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        dataRef.current.handleSave();
      }
    };

    const handleBeforeUnload = (e) => {
      const { tasks, originalTasks, projectId } = dataRef.current;
      if (!projectId) return;

      const hasChanges =
        tasks.length !== originalTasks.length ||
        tasks.some(t => !originalTasks.some(ot => ot.id === t.id)) ||
        originalTasks.some(ot => !tasks.some(t => t.id === ot.id)) ||
        tasks.some(t => {
          const original = originalTasks.find(ot => ot.id === t.id);
          return original && (
            original.name !== t.name ||
            original.description !== t.description ||
            original.start !== t.start ||
            original.end !== t.end ||
            original.progress !== t.progress ||
            original.isCritical !== t.isCritical ||
            JSON.stringify(original.dependencies) !== JSON.stringify(t.dependencies)
          );
        });

      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleSave, originalTasks, projectId, tasks]);

  // Отрисовка графика
  useEffect(() => {
    if (!tasks.length || dimensions.width === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();


    const parseTime = timeParse('%Y-%m-%d');
    const parsedTasks = tasks.map(task => ({
      ...task,
      start: parseTime(task.start),
      end: parseTime(task.end)
    }));

    const sortedTasks = [...parsedTasks].sort((a, b) => a.start - b.start);

    const minDate = min(parsedTasks, d => d.start);
    const maxDate = max(parsedTasks, d => d.end);

    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const xScale = scaleTime()
      .domain([minDate, maxDate])
      .range([0, innerWidth])
      .nice();

    const yScale = scaleBand()
      .domain(sortedTasks.map(d => d.id))
      .range([0, innerHeight])
      .padding(0.2);

    // Создаем основную группу с учетом margin
    const chart = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Ось X внутри chart
    chart.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).ticks(timeDay.every(1)).tickFormat(timeFormat('%d %b')))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Ось Y внутри chart
    chart.append('g')
      .call(axisLeft(yScale).tickFormat(d =>
        sortedTasks.find(t => t.id === d)?.name || ''
      ));

    // Все элементы добавляем в chart
    chart.selectAll('.task-bg')
      .data(sortedTasks)
      .enter()
      .append('rect')
      .attr('class', 'task-bg')
      .attr('x', 0)
      .attr('y', d => yScale(d.id))
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#f5f5f5');

    chart.selectAll('.task-bar')
      .data(sortedTasks)
      .enter()
      .append('rect')
      .attr('class', d => d.isCritical ? styles.taskBarCritical : styles.taskBar)
      .attr('x', d => xScale(d.start))
      .attr('y', d => yScale(d.id))
      .attr('width', d => xScale(d.end) - xScale(d.start))
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleTaskClick);

    chart.selectAll('.task-progress')
      .data(sortedTasks)
      .enter()
      .append('rect')
      .attr('class', styles.taskProgress)
      .attr('x', d => xScale(d.start))
      .attr('y', d => yScale(d.id))
      .attr('width', d => (xScale(d.end) - xScale(d.start)) * (d.progress / 100))
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleTaskClick);

    const today = new Date();

    chart.append('line')
      .attr('class', 'today-line')
      .attr('x1', xScale(today))
      .attr('x2', xScale(today))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#ff4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    chart.append('text')
      .attr('class', 'today-label')
      .attr('x', xScale(today) + 5)
      .attr('y', 20)
      .attr('fill', '#ff4444')
      .text("Сегодня");

    // Стрелки добавляем в корневой SVG
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#999');

    // Связи добавляем в chart
    const linkGenerator = line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(curveBasis);

    sortedTasks.forEach(task => {
      task.dependencies.forEach(dep => {
        const dependency = sortedTasks.find(t => t.id === dep.id);
        if (dependency) {
          const points = calculateLinkPoints(
            task,
            dependency,
            xScale,
            yScale,
            dep.type
          );
          chart.append('path')
            .attr('class', styles.taskLink)
            .attr('d', linkGenerator(points))
            .attr('marker-end', 'url(#arrowhead)');
        }
      });
    });

  }, [tasks, dimensions, margin]);

  // Обработчики задач
  const handleAddTask = (newTask) => {
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    setTasks(prev => [...prev, {
      id: newId,
      name: newTask.name,
      description: newTask.description || '',
      start: newTask.start,
      end: newTask.end,
      progress: 0,
      dependencies: [],
      isCritical: newTask.isCritical
    }]);
    setIsTaskFormOpen(false);
  };

  const handleTaskEdit = (editedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === editedTask.id ? {
          ...editedTask,
          start: timeFormat('%Y-%m-%d')(editedTask.start),
          end: timeFormat('%Y-%m-%d')(editedTask.end)
        } : t
      )
    );
    setSelectedTask(null);
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };


  const handleMouseOver = (event, d) => {
    select(tooltipRef.current)
      .style('opacity', 1)
      .html(`
        <div class="tooltip-content">
          <h4>${d.name}</h4>
          <p>Начало: ${timeFormat('%d %b %Y')(d.start)}</p>
          <p>Конец: ${timeFormat('%d %b %Y')(d.end)}</p>
          <p>Прогресс: ${d.progress}%</p>
          ${d.isCritical ? '<p class="critical-text">Критический путь</p>' : ''}
        </div>
      `)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 10}px`);
  };

  const handleMouseOut = () => {
    select(tooltipRef.current).style('opacity', 0);
  };

  const handleTaskClick = (event, d) => {
    event.stopPropagation();
    setSelectedTask(d);
  };

  const calculateLinkPoints = (task, dependency, xScale, yScale, type) => {
    let startX, endX;

    switch (type) {
      case 'fs':
        startX = xScale(dependency.end);
        endX = xScale(task.start);
        break;
      case 'ss':
        startX = xScale(dependency.start);
        endX = xScale(task.start);
        break;
      case 'ff':
        startX = xScale(dependency.end);
        endX = xScale(task.end);
        break;
      case 'sf':
        startX = xScale(dependency.start);
        endX = xScale(task.end);
        break;
      default:
        startX = xScale(dependency.end);
        endX = xScale(task.start);
    }

    const startY = yScale(task.id) + yScale.bandwidth() / 2;
    const endY = yScale(dependency.id) + yScale.bandwidth() / 2;

    return [
      { x: startX, y: endY },
      { x: startX + 20, y: endY },
      { x: startX + 20, y: startY },
      { x: endX, y: startY }
    ];
  };

  return (
    <div className={styles.container} onClick={() => setSelectedTask(null)} ref={containerRef} >
      <div className={styles.taskControls}>
        <button
          className={styles.newTaskButton}
          onClick={() => setIsTaskFormOpen(true)}
        >
          Новая задача
        </button>
      </div>

      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
      <div ref={tooltipRef} className={styles.tooltip} style={{ opacity: 0 }}></div>

      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        tasks={tasks}
        timeFormat={timeFormat}
        onEdit={handleTaskEdit}
        onDelete={handleTaskDelete}
      />
      {isTaskFormOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setIsTaskFormOpen(false)} />
          <div className={styles.formModal}>
            <TaskForm
              onAddTask={handleAddTask}
              onCancel={() => setIsTaskFormOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GanttChart;