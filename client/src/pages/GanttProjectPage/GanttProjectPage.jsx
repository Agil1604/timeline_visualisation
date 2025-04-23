import React, { useRef, useEffect, useState, useMemo } from 'react';
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

import { WELCOME_PAGE } from '../../routing/consts';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import TaskModal from './TaskModal';
import TaskForm from './TaskForm';

import './sharedStyles.css';
import styles from './GanttProjectPage.module.css';


const GanttChart = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const items = [
    {
      title: 'Профиль',
      path: `/user/${user.nickname}/profile`,
    },
    {
      title: 'О нас',
      path: WELCOME_PAGE,
    }
  ];

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Составление ТЗ',
      description: 'Разработка архитектуры проекта',
      start: '2025-03-25',
      end: '2025-04-01',
      progress: 100,
      dependencies: [],
      isCritical: true
    },
    {
      id: 2,
      name: 'Проектирование',
      description: 'Разработка архитектуры проекта',
      start: '2025-04-01',
      end: '2025-04-05',
      progress: 60,
      dependencies: [{ id: 1, type: 'FS' }],
      isCritical: true
    },
    {
      id: 3,
      name: 'Тестирование',
      description: 'Проведение unit и интеграционных тестов',
      start: '2025-04-06',
      end: '2025-04-10',
      progress: 30,
      dependencies: [{ id: 2, type: 'FS' }],
      isCritical: true
    },
    {
      id: 4,
      name: 'Разработка UI',
      description: 'Создание пользовательского интерфейса',
      start: '2025-04-06',
      end: '2025-04-12',
      progress: 50,
      dependencies: [{ id: 2, type: 'SS' }],
      isCritical: false
    },
    {
      id: 5,
      name: 'Документирование',
      description: 'Написание документации для API',
      start: '2025-04-08',
      end: '2025-04-15',
      progress: 20,
      dependencies: [{ id: 3, type: 'FF' }],
      isCritical: false
    },
    {
      id: 6,
      name: 'Развертывание',
      description: 'Деплой на production сервер',
      start: '2025-04-13',
      end: '2025-04-15',
      progress: 0,
      dependencies: [
        { id: 4, type: 'FS' },
        { id: 5, type: 'SF' }
      ],
      isCritical: true
    }
  ]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const margin = useMemo(() => ({
    top: 20,
    right: 30,
    bottom: 40,
    left: 200
  }), []);
  useEffect(() => {
    if (!tasks.length) return;

    const parseTime = timeParse('%Y-%m-%d');
    const parsedTasks = tasks.map(task => ({
      ...task,
      start: parseTime(task.start),
      end: parseTime(task.end)
    }));

    const minDate = min(parsedTasks, d => d.start);
    const maxDate = max(parsedTasks, d => d.end);

    const dayWidth = 50;
    const daysDiff = timeDay.count(minDate, maxDate) + 1;
    const width = daysDiff * dayWidth + margin.left + margin.right;

    const bandHeight = 50;
    const paddingBetween = 10;
    const taskCount = parsedTasks.length;
    const innerHeight = taskCount * bandHeight + (taskCount - 1) * paddingBetween;
    const height = innerHeight + margin.top + margin.bottom;

    setDimensions({ width, height });
  }, [tasks, margin]);

  const handleAddTask = (newTask) => {
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    setTasks([...tasks, {
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

  const svgRef = useRef();
  const tooltipRef = useRef();

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

    const minDate = min(parsedTasks, d => d.start);
    const maxDate = max(parsedTasks, d => d.end);

    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const xScale = scaleTime()
      .domain([minDate, maxDate])
      .range([0, innerWidth])
      .nice();

    const yScale = scaleBand()
      .domain(parsedTasks.map(d => d.id))
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
        parsedTasks.find(t => t.id === d)?.name || ''
      ));

    // Все элементы добавляем в chart
    chart.selectAll('.task-bg')
      .data(parsedTasks)
      .enter()
      .append('rect')
      .attr('class', 'task-bg')
      .attr('x', 0)
      .attr('y', d => yScale(d.id))
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#f5f5f5');

    chart.selectAll('.task-bar')
      .data(parsedTasks)
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
      .data(parsedTasks)
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
      .text(timeFormat('%d %b')(today));

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

    parsedTasks.forEach(task => {
      task.dependencies.forEach(dep => {
        const dependency = parsedTasks.find(t => t.id === dep.id);
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
      case 'FS':
        startX = xScale(dependency.end);
        endX = xScale(task.start);
        break;
      case 'SS':
        startX = xScale(dependency.start);
        endX = xScale(task.start);
        break;
      case 'FF':
        startX = xScale(dependency.end);
        endX = xScale(task.end);
        break;
      case 'SF':
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

  const handleTaskEdit = (editedTask) => {
    const updatedTask = {
      ...editedTask,
      start: timeFormat('%Y-%m-%d')(editedTask.start),
      end: timeFormat('%Y-%m-%d')(editedTask.end)
    };

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === updatedTask.id ? updatedTask : t
      )
    );
    closeModal();
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const closeModal = () => { setSelectedTask(null); };
  return (
    <div>
      <Navbar
        items={items}
        addLogout={true}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      <div className={styles.container} onClick={closeModal}>
        <div className={styles.taskControls}>
          <button
            className={styles.newTaskButton}
            onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
          >
            Новая задача
          </button>
        </div>

        <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          style={{ opacity: 0 }}
        ></div>

        <TaskModal
          task={selectedTask}
          onClose={closeModal}
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
    </div>
  );
};

export default GanttChart;