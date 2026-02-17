import { useState, useMemo } from "react";
import { type Task } from "@shared/schema";
import { TaskCard } from "./TaskCard";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@hello-pangea/dnd";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@hello-pangea/dnd";
import { useUpdateTask } from "@/hooks/use-tasks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CircleDashed, LayoutList, Loader2, CheckCircle2 } from "lucide-react";

type ColumnId = "pending" | "todo" | "in_progress" | "done";

const COLUMNS: { id: ColumnId; title: string; color: string; icon: any }[] = [
  { id: "pending", title: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: CircleDashed },
  { id: "todo", title: "To Do", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: LayoutList },
  { id: "in_progress", title: "In Progress", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Loader2 },
  { id: "done", title: "Done", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
];

interface KanbanBoardProps {
  tasks: Task[];
  isLoading: boolean;
}

export function KanbanBoard({ tasks, isLoading }: KanbanBoardProps) {
  const updateTask = useUpdateTask();
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const columns = useMemo(() => {
    const cols: Record<ColumnId, Task[]> = {
      pending: [],
      todo: [],
      in_progress: [],
      done: [],
    };
    
    tasks.forEach((task) => {
      // Handle failed/cancelled as pending or a separate list if needed,
      // for now mapping them to pending or ignoring based on status
      const status = task.status as ColumnId;
      if (cols[status]) {
        cols[status].push(task);
      } else if (task.status === 'failed' || task.status === 'cancelled') {
        // Option: Show failed in pending for review
        cols.pending.push(task); 
      }
    });
    return cols;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    const overId = over.id;

    if (!activeTask) return;

    // Check if dropped on a column container
    const isOverColumn = COLUMNS.some(col => col.id === overId);
    let newStatus = isOverColumn ? overId : null;

    // If not dropped on a column, check if dropped on a task card
    if (!newStatus) {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus && newStatus !== activeTask.status) {
      updateTask.mutate({
        id: activeTask.id,
        status: newStatus as any,
      });
    }

    setActiveId(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col h-full bg-card/20 rounded-xl border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded bg-muted animate-pulse" />
              <div className="h-6 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-32 rounded-lg bg-muted/50 animate-pulse" />
              <div className="h-32 rounded-lg bg-muted/50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          return (
            <div
              key={col.id}
              className="flex flex-col h-full min-w-[280px] bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 shadow-inner"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur z-10 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className={cn("p-1.5 rounded-md", col.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm tracking-tight text-foreground/90">
                    {col.title}
                  </h3>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {columns[col.id].length}
                </div>
              </div>

              {/* Droppable Area */}
              <SortableContext
                id={col.id}
                items={columns[col.id].map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div 
                  ref={(node) => {
                    // This creates a drop zone for the entire column body
                    // We need to register the column ID as a droppable container
                  }}
                  className="flex-1 p-3 min-h-[150px]"
                >
                  <ScrollArea className="h-[calc(100vh-280px)] pr-3">
                    {/* Add a specific droppable for the empty column case */}
                     <DroppableColumn id={col.id} className="h-full min-h-[100px]">
                      {columns[col.id].map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      {columns[col.id].length === 0 && (
                        <div className="h-24 border-2 border-dashed border-muted-foreground/10 rounded-lg flex items-center justify-center text-muted-foreground/40 text-sm">
                          Drop here
                        </div>
                      )}
                    </DroppableColumn>
                  </ScrollArea>
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper component to make the column droppable
import { useDroppable } from "@hello-pangea/dnd";

function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode, className?: string }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}
