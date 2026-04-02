'use client';

import { Circle, User, Bot, Sparkles, Shield } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ApiModel,
  ApiPersonality,
  LaneId,
  LaneSettings,
  ReasoningMessage,
  LANE_CONFIGS,
} from '@/types/ui';
import { cn } from '@/lib/utils';

const laneIconComponents: Record<
  LaneId,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  orchestrator: Sparkles,
  'debater-a': Shield,
  'debater-b': User,
  'debater-c': Bot,
};

function LaneAvatarIcon({ laneId, active }: { laneId: LaneId; active: boolean }) {
  const Icon = laneIconComponents[laneId];
  return (
    <Icon
      className={cn(
        'size-12 text-muted-foreground',
        active && 'text-foreground/85 animate-lane-pulse'
      )}
      aria-hidden
    />
  );
}

interface ReasoningLanesProps {
  messages: ReasoningMessage[];
  laneSettings: Record<LaneId, LaneSettings>;
  modelOptions: ApiModel[];
  personalityOptions: ApiPersonality[];
}

export default function ReasoningLanes({
  messages,
  laneSettings,
  modelOptions,
  personalityOptions,
}: ReasoningLanesProps) {
  const streamRefs = useRef<Record<LaneId, HTMLDivElement | null>>({
    orchestrator: null,
    'debater-a': null,
    'debater-b': null,
    'debater-c': null,
  });

  const modelLabelByKey = useMemo(() => {
    return new Map(modelOptions.map((model) => [model.key, model.label]));
  }, [modelOptions]);

  const personalityLabelById = useMemo(() => {
    return new Map(personalityOptions.map((personality) => [personality.id, personality.name]));
  }, [personalityOptions]);

  useEffect(() => {
    for (const lane of LANE_CONFIGS) {
      const stream = streamRefs.current[lane.id];
      if (!stream) continue;

      stream.scrollLeft = stream.scrollWidth;
    }
  }, [messages]);

  return (
    <Card className="border-0 py-0 ring-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-6 py-2 md:grid-cols-2 xl:grid-cols-4">
          {LANE_CONFIGS.map((lane) => {
            const settings = laneSettings[lane.id];
            const laneMessages = messages.filter((m) => m.laneId === lane.id);
            const modelLabel = modelLabelByKey.get(settings.modelKey) ?? settings.modelKey;
            const personalityLabel =
              personalityLabelById.get(settings.personalityId) ?? settings.personalityId;

            const isSpeaking = laneMessages.some((message) => message.isStreaming);

            return (
              <div
                key={lane.id}
                className="flex flex-col items-center px-4 py-3"
              >
                <LaneAvatarIcon laneId={lane.id} active={isSpeaking} />

                <div className="mt-2 flex items-center gap-1.5" role="status" aria-label={isSpeaking ? 'Currently speaking' : 'Idle'}>
                  <span className="text-xs font-medium text-foreground truncate">{lane.label}</span>
                  <Circle
                    className={cn(
                      'size-2.5 flex-shrink-0',
                      isSpeaking
                        ? 'text-foreground/80 fill-current animate-lane-pulse'
                        : 'text-muted-foreground'
                    )}
                  />
                </div>

                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
                  <Badge
                    variant="secondary"
                    className="h-4 px-1 text-[10px] bg-muted text-muted-foreground border-0"
                    title={modelLabel || 'No model'}
                  >
                    {modelLabel || 'No model'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="h-4 px-1 text-[10px] bg-muted text-muted-foreground border-0"
                    title={personalityLabel || 'No personality'}
                  >
                    {personalityLabel || 'No personality'}
                  </Badge>
                </div>

                <div className="mt-3 h-7 w-full min-w-0">
                  <div
                    ref={(node) => {
                      streamRefs.current[lane.id] = node;
                    }}
                    className={cn(
                      'h-full overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                    )}
                    role="log"
                    aria-live="polite"
                    aria-label={`${lane.label} output stream`}
                  >
                    <div className="inline-flex h-full min-w-full items-center gap-2 px-1">
                      {laneMessages.length > 0 ? (
                        laneMessages.map((msg) => (
                          <span
                            key={msg.id}
                            className={cn(
                              'text-xs',
                              msg.isUser ? 'text-primary' : 'text-foreground'
                            )}
                          >
                            {msg.content}
                            {msg.isStreaming && (
                              <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-foreground/70 align-[-1px]" />
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Waiting for input...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
