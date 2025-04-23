import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./LinearProjectPage.css"
import TimelineControls from './TimelineControls';
import EditForm from './EditForm';
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

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedBall, setSelectedBall] = useState(null);
  const [selectedReadOnlyBall, setSelectedReadOnlyBall] = useState(null);
  const [lineSize, setLineSize] = useState(2);
  const [ballSize, setBallSize] = useState(60);
  const [years, setYears] = useState([]);
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const [readOnlyPosition, setReadOnlyPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);
  const readOnlyPopupRef = useRef(null);
  const clickTimer = useRef(null);

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
          events: m.description,
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

    const payload = {
      created: years
        .filter(m => !m.id)
        .map(m => ({
          year: m.year,
          color: m.color,
          description: m.events,
        })),
      updated: years
        .filter(m => m.id)
        .filter(m => {
          const original = originalMilestones.find(om => om.id === m.id);
          return original && (
            original.year !== m.year ||
            original.color !== m.color ||
            original.events !== m.events
          );
        })
        .map(m => ({
          id: m.id,
          year: m.year,
          color: m.color,
          description: m.events,
        })),
      deleted: originalMilestones
        .filter(om => !years.some(m => m.id === om.id))
        .map(om => ({ id: om.id })),
      line_width: lineSize,
      balls_size: ballSize
    };
    console.log(payload);

    try {
      await projectService.update("linear", projectId, payload);

      const projectData = await projectService.getProject(projectId);
      const updatedMilestones = projectData.milestones.map(m => ({
        id: m.id,
        year: m.year,
        color: m.color,
        events: m.description,
      }));

      setYears(updatedMilestones);
      setOriginalMilestones(updatedMilestones);
      setBallSize(projectData.balls_size);
      setLineSize(projectData.line_width);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }, [projectId, years, originalMilestones, lineSize, ballSize]);

  useEffect(() => {
    dataRef.current = { handleSave, years, originalMilestones, projectId };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        e.stopPropagation();
        dataRef.current.handleSave();
        return false;
      }
    };

    const handleBeforeUnload = (e) => {
      const { years, originalMilestones, projectId } = dataRef.current;
      if (!projectId) return;

      const hasChanges = years.some(m => !m.id) ||
        years.some(m => {
          const original = originalMilestones.find(om => om.id === m.id);
          return original && (
            original.year !== m.year ||
            original.color !== m.color ||
            original.events !== m.events
          );
        }) ||
        originalMilestones.some(om => !years.some(m => m.id === om.id));

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
  }, [handleSave, originalMilestones, projectId, years]);

  const handleDeleteBall = useCallback((ballToDelete) => {
    setYears(prev => prev.filter(item => item !== ballToDelete));
    setSelectedBall(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) && !e.target.closest('.timeline-ball')) {
        setSelectedBall(null);
      }

      if (readOnlyPopupRef.current &&
        !readOnlyPopupRef.current.contains(e.target) &&
        !e.target.closest('.timeline-ball')) {
        setSelectedReadOnlyBall(null);
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

  const handleBallClick = (ball, e) => {
    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      if (!selectedBall) {
        const container = projectContainerRef.current;
        const rect = container.getBoundingClientRect();
        const scale = zoomLevel;
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;

        const x = (e.clientX - rect.left + scrollLeft) / scale;
        const y = (e.clientY - rect.top + scrollTop) / scale;

        setSelectedReadOnlyBall(ball);
        setReadOnlyPosition({ x: x + 20, y: y - 50 });
      }
    }, 350);
  };

  const handleDoubleClick = (ball, e) => {
    clearTimeout(clickTimer.current);
    clickTimer.current = null;

    const container = projectContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scale = zoomLevel;
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const x = (e.clientX - rect.left + scrollLeft) / scale;
    const y = (e.clientY - rect.top + scrollTop) / scale;

    setSelectedReadOnlyBall(null);
    setSelectedBall(ball);
    setEditPosition({
      x: x + 20,
      y: y - 50
    });
  };

  const handleUpdateBall = (updatedBall) => {
    const isYearExist = years.some(y => 
      y !== selectedBall && y.year === updatedBall.year
    );
    if (isYearExist) {
      alert('Шарик с таким годом уже существует!');
      return;
    }
    setYears(prev =>
      prev.map(item =>
        item.year === selectedBall.year ? updatedBall : item
      ).sort((a, b) => a.year - b.year)
    );
    setSelectedBall(null);
  };

  const handleAddYear = (newYear) => {
    const isYearExist = years.some(y => y.year === newYear.year);
    if (isYearExist) {
      alert('Шарик с таким годом уже существует!');
      return;
    }
    setYears(prev => [...prev, {
      ...newYear,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }].sort((a, b) => a.year - b.year));
  };

  const ReadOnlyPopup = ({ ball, onClose }) => (
    <div className="read-only-popup">
      <h3>{ball.year}</h3>
      <div className="events">

        <p>{ball.events}</p>
      </div>
      <button className="close-button" onClick={onClose}>
        ×
      </button>
    </div>
  );

  return (
    <div>
      <Navbar
        items={items}
        addLogout={true}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      <TimelineControls
        lineSize={lineSize}
        onLineSizeChange={setLineSize}
        ballSize={ballSize}
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
                    onClick={(e) => handleBallClick(item, e)}
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
                <EditForm
                  ball={selectedBall}
                  onUpdate={handleUpdateBall}
                  onDelete={handleDeleteBall}
                  onClose={() => setSelectedBall(null)}
                />
              </div>
            )}

            {selectedReadOnlyBall && (
              <div
                className="edit-popup"
                ref={readOnlyPopupRef}
                style={{
                  left: `${readOnlyPosition.x}px`,
                  top: `${readOnlyPosition.y}px`
                }}
              >
                <ReadOnlyPopup
                  ball={selectedReadOnlyBall}
                  onClose={() => setSelectedReadOnlyBall(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinearProjectPage;