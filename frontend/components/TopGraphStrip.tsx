'use client';

import { useCallback, useMemo, useState, useRef } from 'react';
import ReactFlow, { 
  Node, 
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { mockNodes, mockEdges, nodeConversations } from '@/lib/mockData';
import { X, GripVertical } from 'lucide-react';

interface OpenPopout {
  id: string;
  x: number;
  y: number;
}

// Constants for popout positioning
const POPOUT_WIDTH = 320;
const POPOUT_HEIGHT = 200;
const POPOUT_GAP = 16;
const POPOUT_COLUMNS = 2;
const MIN_X_CLEAR_SETTINGS = 340;
const POPOUT_START_Y = 24;

export default function TopGraphStrip() {
  const [openPopouts, setOpenPopouts] = useState<Map<string, OpenPopout>>(new Map());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate next non-overlapping position for a new popout
  const getNextPosition = useCallback((): { x: number; y: number } => {
    const count = openPopouts.size;
    const col = count % POPOUT_COLUMNS;
    const row = Math.floor(count / POPOUT_COLUMNS);
    const containerWidth = containerRef.current?.clientWidth ?? 1200;
    const totalGridWidth = POPOUT_COLUMNS * POPOUT_WIDTH + (POPOUT_COLUMNS - 1) * POPOUT_GAP;
    const preferredStartX = containerWidth - totalGridWidth - POPOUT_GAP;
    const startX = Math.max(MIN_X_CLEAR_SETTINGS, preferredStartX);

    return {
      x: startX + col * (POPOUT_WIDTH + POPOUT_GAP),
      y: POPOUT_START_Y + row * (POPOUT_HEIGHT + POPOUT_GAP),
    };
  }, [openPopouts]);

  // Use memoized nodes with selection highlight for open popouts
  const nodes = useMemo(() => {
    return mockNodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        border: openPopouts.has(node.id) 
          ? '2px solid #89b4fa' 
          : node.style?.border || '2px solid #2a2a34',
        boxShadow: openPopouts.has(node.id) 
          ? '0 0 12px rgba(137, 180, 250, 0.4)' 
          : 'none',
        cursor: 'pointer',
      },
    }));
  }, [openPopouts]);

  const edges = useMemo(() => {
    return mockEdges;
  }, []);

  const togglePopout = useCallback((nodeId: string) => {
    setOpenPopouts(prev => {
      const newMap = new Map(prev);
      if (newMap.has(nodeId)) {
        newMap.delete(nodeId);
      } else {
        newMap.set(nodeId, {
          id: nodeId,
          ...getNextPosition(),
        });
      }
      return newMap;
    });
  }, [getNextPosition]);

  const closePopout = useCallback((nodeId: string) => {
    setOpenPopouts(prev => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const popout = openPopouts.get(nodeId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!popout || !rect) return;
    
    dragOffset.current = {
      x: e.clientX - rect.left - popout.x,
      y: e.clientY - rect.top - popout.y,
    };
    setDraggingId(nodeId);
  }, [openPopouts]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!draggingId || !rect) return;
    
    const maxX = Math.max(0, rect.width - POPOUT_WIDTH);
    const maxY = Math.max(0, rect.height - POPOUT_HEIGHT);
    const newX = Math.min(maxX, Math.max(0, e.clientX - rect.left - dragOffset.current.x));
    const newY = Math.min(maxY, Math.max(0, e.clientY - rect.top - dragOffset.current.y));
    
    setOpenPopouts(prev => {
      const newMap = new Map(prev);
      const popout = newMap.get(draggingId);
      if (popout) {
        newMap.set(draggingId, { ...popout, x: newX, y: newY });
      }
      return newMap;
    });
  }, [draggingId]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      togglePopout(node.id);
    },
    [togglePopout]
  );

  // Handle empty data gracefully
  if (mockNodes.length === 0) {
    return (
      <div className="absolute inset-0 bg-[#111116] flex items-center justify-center">
        <p className="text-gray-500">No graph data available</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 bg-[#111116]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        preventScrolling={true}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        style={{ background: '#111116' }}
      >
        <Background color="#1e1e24" gap={16} />
      </ReactFlow>
      
      {/* Open Popouts */}
      {Array.from(openPopouts.entries()).map(([nodeId, popout]) => {
        const nodeData = nodeConversations[nodeId];
        if (!nodeData) return null;
        
        return (
          <div
            key={nodeId}
            className="absolute bg-[#0a0a0e] border border-[#2a2a34] rounded-lg shadow-lg z-30"
            style={{
              left: popout.x,
              top: popout.y,
              width: POPOUT_WIDTH,
              userSelect: draggingId === nodeId ? 'none' : 'auto',
            }}
          >
            {/* Popup Header - Draggable */}
            <div 
              className="flex items-center justify-between p-3 border-b border-[#1e1e24] cursor-move"
              onMouseDown={(e) => handleMouseDown(e, nodeId)}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-500" />
                <div className="w-1.5 h-4 bg-[#89b4fa] rounded-full" />
                <div>
                  <h3 className="text-sm font-semibold text-[#d4d4d8]">{nodeData.title}</h3>
                  <span className="text-xs text-gray-500">{nodeData.lane}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closePopout(nodeId);
                }}
                className="p-1 hover:bg-[#1e1e24] rounded transition-colors"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            {/* Popup Content */}
            <div className="p-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                {nodeData.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
