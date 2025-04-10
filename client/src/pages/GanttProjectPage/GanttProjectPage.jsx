import React, { useRef, useEffect, useMemo, useState } from 'react';
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
  max
} from 'd3';
import './GanttProjectPage.css';
import { WELCOME_PAGE } from '../../routing/consts';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';

const GanttChart = ({ width = 1000, height = 500 }) => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  const tasks = useMemo(() => [
    {
      id: 'task1',
      name: 'Проектирование',
      start: '2024-03-01',
      end: '2024-03-05',
      progress: 60
    },
    {
      id: 'task2',
      name: 'Тестирование',
      start: '2024-03-06',
      end: '2024-03-10',
      progress: 30
    },
    {
      id: 'task3',
      name: 'Пон?',
      start: '2024-03-06',
      end: '2024-03-10',
      progress: 50
    },
    {
      id: 'task4',
      name: 'Пон?',
      start: '2024-03-06',
      end: '2025-03-10',
      progress: 50
    },
    {
      id: 'task5',
      name: 'Пон?',
      start: '2024-03-06',
      end: '2024-03-10',
      progress: 50
    },
    {
      id: 'task6',
      name: 'Пон?',
      start: '2024-03-06',
      end: '2024-03-10',
      progress: 50
    }
  ], []);

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
      .range([0, innerWidth]);

    const yScale = scaleBand()
      .domain(parsedTasks.map(d => d.id))
      .range([0, innerHeight])
      .padding(0.1);

    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).ticks(timeDay.every(1)));

    svg.append('g')
      .call(axisLeft(yScale).tickFormat(d => 
        parsedTasks.find(t => t.id === d)?.name || ''
      ));

    svg.selectAll('.task-bar')
      .data(parsedTasks)
      .enter()
      .append('rect')
      .attr('class', 'task-bar')
      .attr('x', d => xScale(d.start))
      .attr('y', d => yScale(d.id))
      .attr('width', d => xScale(d.end) - xScale(d.start))
      .attr('height', yScale.bandwidth())
      .attr('fill', '#4CAF50')
      .on('mouseover', (event, d) => {
        select(tooltipRef.current)
          .style('opacity', 1)
          .html(`
            <div class="tooltip-content">
              <h4>${d.name}</h4>
              <p>Начало: ${timeFormat('%d %b')(d.start)}</p>
              <p>Конец: ${timeFormat('%d %b')(d.end)}</p>
              <p>Прогресс: ${d.progress}%</p>
            </div>
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', () => {
        select(tooltipRef.current).style('opacity', 0);
      });

  }, [tasks, width, height]);

  return (
    <div className="gantt-container">
      <Navbar
        items={items}
        addLogout={true}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      <svg ref={svgRef}></svg>
      <div 
        ref={tooltipRef} 
        className="gantt-tooltip" 
        style={{ opacity: 0 }}
      ></div>
    </div>
  );
};

export default GanttChart;