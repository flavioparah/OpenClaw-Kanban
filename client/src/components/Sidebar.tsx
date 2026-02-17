import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, Settings, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/settings", label: "API & Settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          OpenClaw
          <span className="text-xs font-sans font-normal text-muted-foreground block mt-1">
            Task Manager
          </span>
        </h1>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive/50"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function MobileHeader() {
  const { user } = useAuth();
  
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
      <h1 className="text-lg font-display font-bold text-primary">OpenClaw</h1>
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.profileImageUrl || undefined} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around items-center z-50 pb-safe">
      <Link href="/" className={cn("p-2 rounded-lg flex flex-col items-center gap-1", location === "/" ? "text-primary" : "text-muted-foreground")}>
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-[10px]">Board</span>
      </Link>
      <Link href="/settings" className={cn("p-2 rounded-lg flex flex-col items-center gap-1", location === "/settings" ? "text-primary" : "text-muted-foreground")}>
        <Settings className="h-5 w-5" />
        <span className="text-[10px]">Settings</span>
      </Link>
    </div>
  );
}
