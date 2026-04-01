'use client';

import { LaneId, LaneSettings, ReasoningMessage, LANE_CONFIGS, MODEL_OPTIONS, PERSONALITY_OPTIONS } from '@/types/ui';
import { mockReasoningTexts } from '@/lib/mockData';
import { Circle } from 'lucide-react';

interface ReasoningLanesProps {
  messages: ReasoningMessage[];
  laneSettings: Record<LaneId, LaneSettings>;
}

export default function ReasoningLanes({ 
  messages, 
  laneSettings
}: ReasoningLanesProps) {
  return (
    <div className="bg-[#0a0a0e]/95 backdrop-blur-sm border border-[#2a2a34] rounded-lg shadow-xl overflow-hidden">
      {/* Container with 4 stacked horizontal rows */}
      <div className="flex flex-col">
        {LANE_CONFIGS.map((lane, index) => {
          const settings = laneSettings[lane.id];
          const laneMessages = messages.filter(m => m.laneId === lane.id);
          const modelLabel = MODEL_OPTIONS.find(m => m.value === settings.model)?.label || settings.model;
          const personalityLabel = PERSONALITY_OPTIONS.find(p => p.value === settings.personality)?.label || settings.personality;
          
          // Determine speaking status based on messages
          const isSpeaking = laneMessages.length > 0 && laneMessages[laneMessages.length - 1]?.isUser !== true;
          
          return (
            <div 
              key={lane.id}
              className={`flex items-center gap-3 px-3 py-2 ${index < LANE_CONFIGS.length - 1 ? 'border-b border-[#1e1e24]' : ''}`}
            >
              {/* Lane Info - Fixed width */}
              <div className="flex-shrink-0 w-32 flex items-center gap-2">
                <span className="text-lg">{lane.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-[#d4d4d8] truncate">{lane.label}</span>
                    <Circle className={`w-1.5 h-1.5 flex-shrink-0 ${isSpeaking ? 'text-green-400 fill-current animate-pulse' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex gap-1">
                    <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-400 truncate">
                      {modelLabel}
                    </span>
                    <span className="text-[10px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-400 truncate">
                      {personalityLabel}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Horizontal scrolling stream area */}
              <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-[#2a2a34] scrollbar-track-transparent">
                <div className="flex gap-2 min-w-max">
                  {/* Show messages if any */}
                  {laneMessages.length > 0 ? (
                    laneMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap flex-shrink-0 ${
                          msg.isUser 
                            ? 'bg-blue-500/20 text-blue-200' 
                            : 'bg-[#1e1e24] text-gray-300'
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))
                  ) : (
                    // Show mock reasoning text when no messages
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {mockReasoningTexts[lane.id] || 'Waiting for input...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}