import { type Task } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { GripVertical, Clock, AlertCircle, CheckCircle2, MoreVertical, Trash2, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { useSortable } from "@hello-pangea/dnd";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const priorityConfig = {
  low: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
  medium: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertCircle },
  high: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle },
};

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const PriorityIcon = priorityConfig[task.priority as keyof typeof priorityConfig].icon;

  const handleSaveEdit = () => {
    updateTask.mutate({ 
      id: task.id, 
      title: editTitle, 
      description: editDesc 
    }, {
      onSuccess: () => setIsEditOpen(false)
    });
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative mb-3 touch-none",
          isDragging && "z-50 opacity-50"
        )}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md group">
          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
            <div {...attributes} {...listeners} className="cursor-grab hover:text-primary transition-colors absolute top-4 left-3 text-muted-foreground/50">
              <GripVertical className="h-5 w-5" />
            </div>
            
            <div className="pl-6 pr-2 w-full">
              <h4 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                {task.title}
              </h4>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground/50 hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => deleteTask.mutate(task.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className="p-4 pt-1 pb-3 pl-10">
            <p className="text-xs text-muted-foreground line-clamp-3 mb-3 min-h-[1.5em]">
              {task.description || "No description provided."}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <Badge variant="outline" className={cn("text-[10px] py-0 h-5 px-2 gap-1 uppercase tracking-wider font-semibold", priorityConfig[task.priority as keyof typeof priorityConfig].color)}>
                <PriorityIcon className="h-3 w-3" />
                {task.priority}
              </Badge>
              
              <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                {task.createdAt && formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the details of your task.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={editDesc} 
                onChange={(e) => setEditDesc(e.target.value)} 
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateTask.isPending}>
              {updateTask.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
