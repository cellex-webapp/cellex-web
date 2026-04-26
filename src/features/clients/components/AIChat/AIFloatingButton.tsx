import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tooltip } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import AIChatContainer from './AIChatContainer';

/**
 * Floating AI Chat button that appears on all client pages.
 * Toggles a draggable and resizable mini-chat panel.
 */
const AIFloatingButton: React.FC = () => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Position and Size states
  const [position, setPosition] = useState({ x: 24, y: 24 }); // distance from bottom-right
  const [size, setSize] = useState({ width: 380, height: 600 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const sizeStart = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

  // Handle Dragging
  const handleDragMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX + position.x,
      y: e.clientY + position.y
    };
    e.stopPropagation();
  };

  // Handle Resizing (from top-left corner)
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    sizeStart.current = {
      width: size.width,
      height: size.height,
      mouseX: e.clientX,
      mouseY: e.clientY
    };
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = dragStart.current.x - e.clientX;
      const newY = dragStart.current.y - e.clientY;
      
      // Boundaries
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      
      setPosition({
        x: Math.min(Math.max(newX, 0), maxX),
        y: Math.min(Math.max(newY, 0), maxY)
      });
    }

    if (isResizing) {
      const deltaX = sizeStart.current.mouseX - e.clientX;
      const deltaY = sizeStart.current.mouseY - e.clientY;
      
      const newWidth = Math.min(Math.max(sizeStart.current.width + deltaX, 300), 800);
      const newHeight = Math.min(Math.max(sizeStart.current.height + deltaY, 400), window.innerHeight - 100);
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  }, [isDragging, isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Don't show on the AI chat page itself
  if (location.pathname === '/ai-chat') {
    return null;
  }

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div 
        className="fixed z-50 transition-all duration-300"
        style={{ 
          right: isOpen ? `${position.x}px` : '24px', 
          bottom: isOpen ? `${position.y}px` : '96px' 
        }}
      >
        {!isOpen && (
          <Tooltip title="Trò chuyện với AI" placement="left">
            <button
              id="ai-chat-floating-btn"
              onClick={handleClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`
                group relative flex items-center justify-center
                w-14 h-14 rounded-full
                bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600
                hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500
                text-white shadow-lg hover:shadow-xl
                transition-all duration-300 ease-in-out
                hover:scale-110 border-none cursor-pointer
                ${isHovered ? 'ring-4 ring-purple-300/50' : ''}
              `}
              style={{ animation: 'ai-float-pulse 3s ease-in-out infinite' }}
            >
              <RobotOutlined className="text-2xl" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              <span className="absolute -inset-1 rounded-full border-2 border-purple-400/30 animate-ping" style={{ animationDuration: '3s' }} />
            </button>
          </Tooltip>
        )}

        {/* Label that shows on hover */}
        <div
          className={`
            absolute right-16 top-1/2 -translate-y-1/2
            bg-gray-900/90 backdrop-blur-sm text-white text-sm
            px-3 py-1.5 rounded-lg whitespace-nowrap
            transition-all duration-200
            ${isHovered && !isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}
          `}
        >
          Cellex AI ✨
        </div>

        <style>{`
          @keyframes ai-float-pulse {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </div>

      {/* AI Chat Popup Window */}
      {isOpen && (
        <div 
          className="fixed z-50 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-gray-200 bg-white transition-shadow"
          style={{ 
            right: `${position.x}px`, 
            bottom: `${position.y}px`,
            width: `${size.width}px`,
            height: `${size.height}px`,
            boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : undefined
          }}
        >
          {/* Draggable Header Overlay Handle */}
          <div 
            onMouseDown={handleDragMouseDown}
            className="absolute top-0 left-0 right-32 h-14 z-10"
            title="Giữ để di chuyển"
          />

          {/* Resize Handle (Top-Left) */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-20 hover:bg-white/10 transition-colors"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            title="Kéo để thay đổi kích thước"
          />

          <AIChatContainer embedded={true} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default AIFloatingButton;
