'use client';

import { ChevronDown, ChevronUp, Settings2, Sparkles, Shield, User, Bot, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ApiModel,
  ApiPersonality,
  LaneConfig,
  LaneId,
  LaneSettings,
} from '@/types/ui';

const LANE_ICONS = [Shield, User, Bot, Sparkles, Shield, User, Bot, Sparkles];

function getLaneIcon(lane: LaneConfig, index: number) {
  if (lane.id === 'orchestrator') return <Sparkles className="size-4 text-muted-foreground" />;
  const Icon = LANE_ICONS[index % LANE_ICONS.length];
  return <Icon className="size-4 text-muted-foreground" />;
}

interface SettingsPanelProps {
  laneConfigs: LaneConfig[];
  laneSettings: Record<LaneId, LaneSettings>;
  onLaneSettingsChange: (laneId: LaneId, settings: LaneSettings) => void;
  modelOptions: ApiModel[];
  personalityOptions: ApiPersonality[];
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onAddAgent: () => void;
  onRemoveAgent: (laneId: LaneId) => void;
  canAddAgent: boolean;
  canRemoveAgent: boolean;
}

export default function SettingsPanel({
  laneConfigs,
  laneSettings,
  onLaneSettingsChange,
  modelOptions,
  personalityOptions,
  isExpanded,
  onExpandedChange,
  onAddAgent,
  onRemoveAgent,
  canAddAgent,
  canRemoveAgent,
}: SettingsPanelProps) {
  return (
    <Card className="bg-popover/95 backdrop-blur-sm flex w-60 min-h-0 flex-col border border-border shadow-xl">
      <Collapsible open={isExpanded} onOpenChange={onExpandedChange}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              <CardTitle className="text-sm">Configuration</CardTitle>
            </div>
            <CardAction>
              <Button variant="ghost" size="icon-xs" className="pointer-events-none">
                {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </CardAction>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="min-h-0">
          <Separator />
          <CardContent className="flex min-h-0 flex-1 p-2">
            <ScrollArea className="h-full min-h-0 flex-1">
              <div className="flex flex-col gap-2">
                {laneConfigs.map((lane, index) => {
                  const settings = laneSettings[lane.id];
                  const modelValue = settings?.modelKey ?? '';
                  const personalityValue = settings?.personalityId ?? '';
                  const isDebater = lane.id !== 'orchestrator';

                  return (
                    <div
                      key={lane.id}
                      className="p-2 bg-card border border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center">
                          {getLaneIcon(lane, index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-medium text-foreground truncate">
                            {lane.label}
                          </h3>
                        </div>
                        {isDebater && canRemoveAgent && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-5 text-muted-foreground hover:text-destructive"
                            onClick={() => onRemoveAgent(lane.id)}
                            title="Remove agent"
                          >
                            <X className="size-3" />
                          </Button>
                        )}
                      </div>

                      {/* Model Select */}
                      <div className="mb-1.5">
                        <label className="block text-[10px] text-muted-foreground mb-0.5">
                          Model
                        </label>
                        <Select
                          value={modelValue}
                          onValueChange={(value) =>
                            onLaneSettingsChange(lane.id, {
                              ...settings,
                              modelKey: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {modelOptions.map((opt) => (
                                <SelectItem key={opt.key} value={opt.key}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Personality Select */}
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">
                          Personality
                        </label>
                        <Select
                          value={personalityValue}
                          onValueChange={(value) =>
                            onLaneSettingsChange(lane.id, {
                              ...settings,
                              personalityId: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {personalityOptions.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}

                {canAddAgent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1"
                    onClick={onAddAgent}
                  >
                    <Plus className="size-3" />
                    Add Agent
                  </Button>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
