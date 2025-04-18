import React, { useRef, useEffect, useState } from 'react';
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
import SidePanel from '../../components/SidePanel/SidePanel';

import './GanttProjectPage.css';
import { WELCOME_PAGE } from '../../routing/consts';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import TaskModal from './TaskModal';

const GanttChart = ({ width = 1000, height = 500 }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
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
      isCritical: false
    }]);

    setIsTaskFormOpen(false);
  };
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
      name: 'Проектирование',
      description: 'Разработка архитектуры проекта',
      start: '2024-03-01',
      end: '2024-03-05',
      progress: 60,
      dependencies: [],
      isCritical: true
    },
    {
      id: 2,
      name: 'Тестирование',
      description: 'Проведение unit и интеграционных тестов',
      start: '2024-03-06',
      end: '2024-03-10',
      progress: 30,
      dependencies: [{ id: 1, type: 'FS' }],
      isCritical: true
    },
    {
      id: 3,
      name: 'Разработка UI',
      description: 'Создание пользовательского интерфейса',
      start: '2024-03-06',
      end: '2024-03-12',
      progress: 50,
      dependencies: [{ id: 1, type: 'SS' }],
      isCritical: false
    },
    {
      id: 4,
      name: 'Документирование',
      description: 'Написание документации для API',
      start: '2024-03-08',
      end: '2024-03-15',
      progress: 20,
      dependencies: [{ id: 2, type: 'FF' }],
      isCritical: false
    },
    {
      id: 5,
      name: 'Развертывание',
      description: 'Деплой на production сервер',
      start: '2024-03-13',
      end: '2024-03-15',
      progress: 0,
      dependencies: [
        { id: 2, type: 'FS' },
        { id: 3, type: 'SF' }
      ],
      isCritical: true
    }
  ]);

  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!tasks?.length) return;

    select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const parseTime = timeParse('%Y-%m-%d');
    const parsedTasks = tasks.map(task => ({
      ...task,
      start: parseTime(task.start),
      end: parseTime(task.end)
    }));

    const xScale = scaleTime()
      .domain([
        min(parsedTasks, d => d.start),
        max(parsedTasks, d => d.end)
      ])
      .range([0, innerWidth])
      .nice();

    const yScale = scaleBand()
      .domain(parsedTasks.map(d => d.id))
      .range([0, innerHeight])
      .padding(0.2);

    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Оси
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).ticks(timeDay.every(1)).tickFormat(timeFormat('%d %b')))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(axisLeft(yScale).tickFormat(d =>
        parsedTasks.find(t => t.id === d)?.name || ''
      ));

    svg.selectAll('.task-bg')
      .data(parsedTasks)
      .enter()
      .append('rect')
      .attr('class', 'task-bg')
      .attr('x', 0)
      .attr('y', d => yScale(d.id))
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#f5f5f5');

    svg.selectAll('.task-bar')
      .data(parsedTasks)
      .enter()
      .append('rect')
      .attr('class', d => `task-bar ${d.isCritical ? 'critical' : ''}`)
      .attr('x', d => xScale(d.start))
      .attr('y', d => yScale(d.id))
      .attr('width', d => xScale(d.end) - xScale(d.start))
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleTaskClick);

    svg.selectAll('.task-progress')
      .data(parsedTasks)
      .enter()
      .append('rect')
      .attr('class', 'task-progress')
      .attr('x', d => xScale(d.start))
      .attr('y', d => yScale(d.id))
      .attr('width', d => (xScale(d.end) - xScale(d.start)) * (d.progress / 100))
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('ry', 4);

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
            dep.type // Передаем тип связи
          );
          svg.append('path')
            .attr('class', 'task-link')
            .attr('d', linkGenerator(points))
            .attr('marker-end', 'url(#arrowhead)');
        }
      });
    });

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#999');

  }, [tasks, width, height]);

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

  const closeModal = () => { setSelectedTask(null); };
  return (
    <div className="gantt-container" onClick={closeModal}>
      <Navbar
        items={items}
        addLogout={true}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      <SidePanel>
        <div className="panel-content">
          <button
            className="new-task-button"
            onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
          >
            Новая задача
          </button>

          {isTaskFormOpen && (
            <TaskForm
              onAddTask={handleAddTask}
              onCancel={() => setIsTaskFormOpen(false)}
            />
          )}
        </div>
      </SidePanel>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="gantt-tooltip"
        style={{ opacity: 0 }}
      ></div>

      <TaskModal
        task={selectedTask}
        onClose={closeModal}
        tasks={tasks}
        timeFormat={timeFormat}
        onEdit={handleTaskEdit}
      />
    </div>
  );
};


const TaskForm = ({ onAddTask, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !start || !end) return;
    
    onAddTask({
      name,
      description,
      start,
      end
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Название задачи"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      
      <textarea
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <div className="date-inputs">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
        <span>до</span>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />
      </div>

      <div className="form-buttons">
        <button type="submit">Создать</button>
        <button type="button" onClick={onCancel}>Отмена</button>
      </div>
    </form>
  );
};

export default GanttChart;