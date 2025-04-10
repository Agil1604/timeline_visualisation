import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./LinearProjectPage.css"
import TimelineControls from './TimelineControls';
import Navbar from '../../components/Navbar/Navbar';
import { WELCOME_PAGE } from '../../routing/consts';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/ProjectService';

const LinearProjectPage = () => {
  const { project: projectId } = useParams();
  const [originalMilestones, setOriginalMilestones] = useState([]);
  const dataRef = useRef();

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

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedBall, setSelectedBall] = useState(null);
  const [lineSize, setLineSize] = useState(2);
  const [ballSize, setBallSize] = useState(60);
  const [years, setYears] = useState([]);
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const projectContainerRef = useRef(null);
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await projectService.getProject(projectId);
        const milestones = projectData.milestones.map(m => ({
          id: m.id,
          year: m.year,
          color: m.color,
          events: [m.description],
        }));

        setYears(milestones);
        setOriginalMilestones(milestones);
        setBallSize(projectData.balls_size);
        setLineSize(projectData.line_width);
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
      }
    };

    if (projectId) loadProject();
  }, [projectId]);

  const handleSave = useCallback(async () => {
    if (!projectId) return;

    const created = years
      .filter(m => !m.id)
      .map(m => ({
        year: m.year,
        color: m.color,
        description: m.events[0],
      }));

    const updated = years
      .filter(m => m.id)
      .filter(m => {
        const original = originalMilestones.find(om => om.id === m.id);
        return original && (
          original.year !== m.year ||
          original.color !== m.color ||
          original.events[0] !== m.events[0]
        );
      })
      .map(m => ({
        id: m.id,
        year: m.year,
        color: m.color,
        description: m.events[0],
      }));

    const deleted = originalMilestones
      .filter(om => !years.some(m => m.id === om.id))
      .map(om => om.id);

    try {
      await projectService.update(projectId, { created, updated, deleted });

      const projectData = await projectService.getProject(projectId);
      const updatedMilestones = projectData.milestones.map(m => ({
        id: m.id,
        year: m.year,
        color: m.color,
        events: [m.description],
      }));

      setYears(updatedMilestones);
      setOriginalMilestones(updatedMilestones);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }, [projectId, years, originalMilestones]);

  useEffect(() => {
    dataRef.current = { handleSave, years, originalMilestones, projectId };
  
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        dataRef.current.handleSave();
      }
    };
  
    const handleBeforeUnload = (e) => {
      const { years, originalMilestones, projectId } = dataRef.current;
      if (!projectId) return;
  
      const hasChanges =
        years.some(m => !m.id) ||
        years.some(m => {
          const original = originalMilestones.find(om => om.id === m.id);
          return original && (
            original.year !== m.year ||
            original.color !== m.color ||
            original.events[0] !== m.events[0]
          );
        }) ||
        originalMilestones.some(om => !years.some(m => m.id === om.id));
  
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        navigator.sendBeacon(
          `/api/projects/${projectId}`,
          JSON.stringify(dataRef.current)
        );
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleSave, originalMilestones, projectId, years]);

  const handleDeleteBall = useCallback((ballToDelete) => {
    setYears(prev => prev.filter(item => item !== ballToDelete));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setSelectedBall(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculatePosition = (year) => {
    if (years.length < 2) return 50;
    const yearsArray = years.map(item => item.year);
    const minYear = Math.min(...yearsArray);
    const maxYear = Math.max(...yearsArray);
    return ((year - minYear) / (maxYear - minYear || 1)) * 90 + 5;
  };

  const handleDoubleClick = (ball, e) => {
    const container = projectContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scale = zoomLevel;
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const x = (e.clientX - rect.left + scrollLeft) / scale;
    const y = (e.clientY - rect.top + scrollTop) / scale;

    setSelectedBall(ball);
    setEditPosition({
      x: x + 20,
      y: y - 50
    });
  };

  const handleUpdateBall = (updatedBall) => {
    setYears(prev =>
      prev.map(item =>
        item.year === selectedBall.year ? updatedBall : item
      ).sort((a, b) => a.year - b.year)
    );
    setSelectedBall(null);
  };

  const handleAddYear = (newYear) => {
    setYears(prev => [...prev, {
      ...newYear,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }].sort((a, b) => a.year - b.year));
  };

  return (
    <div>
      <Navbar
        items={items}
        addLogout={true}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      <TimelineControls
        onLineSizeChange={setLineSize}
        onBallSizeChange={setBallSize}
        onAddYear={handleAddYear}
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      <div className="project-main-content">
        <div className="project-container-wrapper">
          <div
            className="project-container"
            ref={projectContainerRef}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: '0 0'
            }}
          >
            <div className="timeline-line" style={{ height: `${lineSize}px` }}></div>
            <div className="timeline-items">
              {years.map((item) => (
                <div
                  key={item.year}
                  className="timeline-item"
                  style={{ left: `${calculatePosition(item.year)}%` }}
                >
                  <div
                    className="timeline-ball"
                    style={{
                      width: `${ballSize}px`,
                      height: `${ballSize}px`,
                      backgroundColor: item.color
                    }}
                    onDoubleClick={(e) => handleDoubleClick(item, e)}
                  >
                    {item.year}
                  </div>
                </div>
              ))}
            </div>

            {selectedBall && (
              <div
                className="edit-popup"
                ref={popupRef}
                style={{
                  left: `${editPosition.x}px`,
                  top: `${editPosition.y}px`
                }}
              >
                {selectedBall && (
                  <EditForm
                    ball={selectedBall}
                    onUpdate={handleUpdateBall}
                    onDelete={handleDeleteBall}
                    onClose={() => setSelectedBall(null)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditForm = ({ ball, onUpdate, onDelete, onClose }) => {
  const [formData, setFormData] = useState(ball);

  useEffect(() => {
    setFormData(ball);
  }, [ball]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      year: parseInt(formData.year)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <h3>Редактирование шарика</h3>

      <div className="form-group">
        <label>Год:</label>
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Цвет:</label>
        <input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Описание:</label>
        <textarea
          value={formData.events[0]}
          onChange={(e) => setFormData({ ...formData, events: [e.target.value] })}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onClose}>Отмена</button>
        <button type="submit">Сохранить</button>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onClose}>Отмена</button>
        <button type="button" onClick={() => onDelete(ball)}>Удалить</button>
        <button type="submit">Сохранить</button>
      </div>
    </form>
  );

};

export default LinearProjectPage;