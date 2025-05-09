import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimelineControls from './TimelineControls';
import EditForm from './EditForm';
import Navbar from '../../components/Navbar/Navbar';
import { WELCOME_PAGE } from '../../routing/consts';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/ProjectService';
import './sharedStyles.css';
import styles from './LinearProjectPage.module.css';

const LinearProjectPage = () => {
  const { project: projectId } = useParams();
  const [originalMilestones, setOriginalMilestones] = useState([]);
  const dataRef = useRef();
  const { user } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedBall, setSelectedBall] = useState(null);
  const [selectedReadOnlyBall, setSelectedReadOnlyBall] = useState(null);
  const [lineSize, setLineSize] = useState(2);
  const [ballSize, setBallSize] = useState(60);
  const [years, setYears] = useState([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const projectContainerRef = useRef(null);
  const clickTimer = useRef(null);
  const [isDragging, setIsDragging] = useState(null); // 'left' или 'right'
  const timelineLineRef = useRef(null);
  const dragStartX = useRef(0);
  const dragStartRange = useRef({ start: 0, end: 0 });

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

  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const [readOnlyPosition, setReadOnlyPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);
  const readOnlyPopupRef = useRef(null);

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

        if (milestones.length > 0) {
          const yearsArray = milestones.map(m => m.year);
          setVisibleRange({
            start: Math.min(...yearsArray) - 1,
            end: Math.max(...yearsArray) + 1,
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
      }
    };

    if (projectId) loadProject();
  }, [projectId]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const ZOOM_SPEED = 0.1;
    const delta = e.deltaY > 0 ? 1 : -1;
  
    if (!timelineLineRef.current) return;
  
    const timelineRect = timelineLineRef.current.getBoundingClientRect();
    const localX = e.clientX - timelineRect.left;
    const cursorPositionFraction = localX / timelineRect.width;
  
    if (cursorPositionFraction < 0 || cursorPositionFraction > 1) return;
  
    setVisibleRange(prev => {
      const currentStart = prev.start;
      const currentEnd = prev.end;
      const currentRange = currentEnd - currentStart;
      
      const yearAtCursor = currentStart + cursorPositionFraction * currentRange;
      
      const newRange = delta > 0 
        ? currentRange * (1 + ZOOM_SPEED) 
        : currentRange * (1 - ZOOM_SPEED);
  
      const newStart = yearAtCursor - cursorPositionFraction * newRange;
      const newEnd = yearAtCursor + (1 - cursorPositionFraction) * newRange;
  
      return {
        start: Math.round(newStart * 100) / 100,
        end: Math.round(newEnd * 100) / 100
      };
    });
  }, []);

  const handleMouseDown = (side) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(side);
    dragStartX.current = e.clientX;
    dragStartRange.current = { ...visibleRange };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !timelineLineRef.current) return;

    const timelineRect = timelineLineRef.current.getBoundingClientRect();
    const fullWidth = timelineRect.width;
    const deltaX = e.clientX - dragStartX.current;

    const deltaYears = (dragStartRange.current.end - dragStartRange.current.start) *
      (deltaX / fullWidth) *
      (isDragging === 'left' ? -1 : 1);

    setVisibleRange(prev => {
      let newStart = prev.start;
      let newEnd = prev.end;

      if (isDragging === 'left') {
        newStart = dragStartRange.current.start + deltaYears;
        newStart = Math.min(newStart, prev.end - 1);
      } else {
        newEnd = dragStartRange.current.end + deltaYears;
        newEnd = Math.max(newEnd, prev.start + 1);
      }

      if (newStart >= newEnd) {
        [newStart, newEnd] = [newEnd - 1, newStart + 1];
      }

      return {
        start: Math.round(newStart * 100) / 100,
        end: Math.round(newEnd * 100) / 100
      };
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);


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

  const calculatePosition = useCallback((year) => {
    if (!visibleRange.start || !visibleRange.end) return 5;
    const range = visibleRange.end - visibleRange.start;
    return Math.max(0, Math.min(100, ((year - visibleRange.start) / range) * 100));
  }, [visibleRange]);

  const handleBallClick = (ball, e) => {
    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      if (!selectedBall) {
        const container = projectContainerRef.current;
        const rect = container.getBoundingClientRect();
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;

        const x = (e.clientX - rect.left + scrollLeft);
        const y = (e.clientY - rect.top + scrollTop);

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
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const x = (e.clientX - rect.left + scrollLeft);
    const y = (e.clientY - rect.top + scrollTop);

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
    <div className={styles.readOnlyPopup}>
      <h3>{ball.year}</h3>
      <div className={styles.events}>

        <p>{ball.events}</p>
      </div>
      <button className={styles.closeButton} onClick={onClose}>
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
        onZoomRangeReset={() => {
          if (years.length > 0) {
            const yearsArray = years.map(m => m.year);
            setVisibleRange({
              start: Math.min(...yearsArray),
              end: Math.max(...yearsArray),
            });
          }
        }}
        visibleRange={visibleRange}
      />

      <div className={styles.projectMainContent}>
        <div
          className={styles.projectContainerWrapper}
          ref={projectContainerRef}
          onWheel={handleWheel}
        >
          <div className={styles.projectContainer}>
            <div
              className={styles.timelineLine}
              ref={timelineLineRef}
              style={{ height: `${lineSize}px` }}
            >
              <div
                className={`${styles.timelineBorderHandle} ${styles.left}`}
                onMouseDown={handleMouseDown('left')}
              />
              <div
                className={`${styles.timelineBorderHandle} ${styles.right}`}
                onMouseDown={handleMouseDown('right')}
              />
            </div>
            <div className={styles.timelineItems}>
              {years
                .filter(item => item.year >= visibleRange.start && item.year <= visibleRange.end)
                .map((item) => (
                  <div
                    key={item.year}
                    className={styles.timelineItem}
                    style={{
                      left: `${calculatePosition(item.year)}%`,
                      pointerEvents: 'auto'
                    }}
                  >
                    <div
                      className={styles.timelineBall}
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
                className={styles.editPopup}
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
                className={styles.editPopup}
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