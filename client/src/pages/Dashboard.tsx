import { useState } from "react";
import { Sidebar, MobileHeader, MobileNav } from "@/components/Sidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { useTasks } from "@/hooks/use-tasks";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  
  // Debounce could be added here for production app
  const { data: tasks, isLoading } = useTasks({ search, status: statusFilter });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full w-full relative">
        <MobileHeader />
        
        {/* Header */}
        <header className="px-6 py-5 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/95 backdrop-blur z-20">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground text-sm">Manage and track your agent tasks.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-9 bg-card/50 border-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <CreateTaskDialog />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden p-4 md:p-6 bg-muted/5">
          <KanbanBoard tasks={tasks || []} isLoading={isLoading} />
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}
