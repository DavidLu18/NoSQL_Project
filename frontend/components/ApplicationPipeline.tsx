'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Application } from '@ats/shared';

interface ApplicationPipelineProps {
  stages: any[];
  applications: Application[];
  onDragEnd: (result: DropResult) => void;
}

export default function ApplicationPipeline({ stages, applications, onDragEnd }: ApplicationPipelineProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter((app) => app.currentStageId === stageId);
  };

  if (!isMounted) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div
              className="mb-4 p-4 border-4 border-black font-bold rounded-lg"
              style={{ backgroundColor: stage.color }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{stage.name}</span>
                <Badge variant="default">0</Badge>
              </div>
            </div>
            <div className="space-y-3 min-h-[400px] p-2">
              <div className="text-center py-12 text-neutral-400">
                <p className="text-sm">Loading...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageApplications = getApplicationsByStage(stage.id);
          return (
            <div key={stage.id} className="flex-shrink-0 w-80">
              {/* Stage Header */}
              <div
                className="mb-4 p-4 border-4 border-black font-bold rounded-lg"
                style={{ backgroundColor: stage.color }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{stage.name}</span>
                  <Badge variant="default">{stageApplications.length}</Badge>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[400px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary/10 border-2 border-dashed border-primary' : 'bg-neutral-50'
                    }`}
                  >
                    <AnimatePresence>
                      {stageApplications.map((application, index) => (
                        <Draggable
                          key={application.id}
                          draggableId={application.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                            >
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`transition-transform ${
                                  snapshot.isDragging ? 'scale-105 rotate-2 opacity-80' : ''
                                }`}
                              >
                                <Card 
                                  hover 
                                  padding="sm" 
                                  className={`cursor-grab active:cursor-grabbing ${
                                    snapshot.isDragging ? 'shadow-brutal-lg' : ''
                                  }`}
                                >
                                  <div>
                                    <h3 className="font-bold mb-2">
                                      Candidate #{application.candidateId.slice(-8)}
                                    </h3>
                                    <p className="text-sm text-neutral-600 mb-2">
                                      Job #{application.jobId.slice(-8)}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <Badge
                                        variant={
                                          application.status === 'hired'
                                            ? 'success'
                                            : application.status === 'rejected'
                                            ? 'danger'
                                            : 'info'
                                        }
                                        size="sm"
                                      >
                                        {application.status}
                                      </Badge>
                                      <span className="text-xs text-neutral-500">
                                        {new Date(application.appliedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </Card>
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                    {stageApplications.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-12 text-neutral-400">
                        <p className="text-sm">Drag applications here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

