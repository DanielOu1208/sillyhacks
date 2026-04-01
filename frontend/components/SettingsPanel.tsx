'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { LaneId, LaneSettings, LANE_CONFIGS, MODEL_OPTIONS, PERSONALITY_OPTIONS } from '@/types/ui';

interface SettingsPanelProps {
  laneSettings: Record<LaneId, LaneSettings>;
  onLaneSettingsChange: (laneId: LaneId, settings: LaneSettings) => void;
}

export default function SettingsPanel({ 
  laneSettings, 
  onLaneSettingsChange
}: SettingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-[#0a0a0e]/95 backdrop-blur-sm border border-[#2a2a34] rounded-lg shadow-xl w-96 max-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-[#1e1e24] cursor-pointer hover:bg-[#111116]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-[#d4d4d8]">
            Configuration
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
      
      {/* Settings Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {LANE_CONFIGS.map((lane) => {
            const settings = laneSettings[lane.id];
            
            return (
              <div 
                key={lane.id}
                className="p-2 rounded-lg border bg-[#111116] border-[#1e1e24]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{lane.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-[#d4d4d8] truncate">{lane.label}</h3>
                    <p className="text-[10px] text-gray-500 truncate">{lane.role}</p>
                  </div>
                </div>
                
                {/* Model Dropdown */}
                <div className="mb-1.5">
                  <label className="block text-[10px] text-gray-500 mb-0.5">Model</label>
                  <select
                    value={settings.model}
                    onChange={(e) => onLaneSettingsChange(lane.id, { 
                      ...settings, 
                      model: e.target.value as LaneSettings['model'] 
                    })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-[#1e1e24] border border-[#2a2a34] rounded px-1.5 py-1 text-xs text-[#d4d4d8] focus:outline-none focus:border-[#89b4fa]"
                  >
                    {MODEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Personality Dropdown */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Personality</label>
                  <select
                    value={settings.personality}
                    onChange={(e) => onLaneSettingsChange(lane.id, { 
                      ...settings, 
                      personality: e.target.value as LaneSettings['personality'] 
                    })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-[#1e1e24] border border-[#2a2a34] rounded px-1.5 py-1 text-xs text-[#d4d4d8] focus:outline-none focus:border-[#89b4fa]"
                  >
                    {PERSONALITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
