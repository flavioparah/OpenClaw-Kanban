import { useState } from "react";
import { useCreateTask } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTaskSchema.pick({
  title: true,
  description: true,
  priority: true,
  status: true,
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "todo",
      priority: "medium",
    },
  });

  const onSubmit = (data: FormValues) => {
    createTask.mutate(data as InsertTask, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg hover:shadow-primary/25 transition-all">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">Create New Task</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new task to your board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground/90">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Implement user authentication"
              className="bg-background/50 border-input focus:border-primary"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-destructive text-sm">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground/90">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this task..."
              className="bg-background/50 border-input focus:border-primary min-h-[100px]"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground/90">Status</Label>
              <Select 
                onValueChange={(val) => setValue("status", val as any)} 
                defaultValue="todo"
              >
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-foreground/90">Priority</Label>
              <Select 
                onValueChange={(val) => setValue("priority", val as any)} 
                defaultValue="medium"
              >
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={createTask.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {createTask.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
