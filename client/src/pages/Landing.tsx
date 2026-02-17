import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Shield, Zap, Layout } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-60 -left-20 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Layout className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">OpenClaw Manager</span>
        </div>
        <Button onClick={handleLogin} variant="outline" className="hidden sm:flex hover:bg-primary/10 hover:text-primary hover:border-primary/50">
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 container mx-auto px-6 pt-12 pb-20 md:pt-24 md:pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Secure Task Management
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight">
                Manage AI Agents <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary animate-gradient-x">
                  Without The Cost
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Track OpenClaw tasks securely without spending tokens on status checks. 
                A dedicated Kanban dashboard for your AI operations.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="w-full sm:w-auto text-lg h-12 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full sm:w-auto text-lg h-12 px-8"
                onClick={() => window.open('https://github.com/replit/openclaw', '_blank')}
              >
                View Documentation
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-none">
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              <Card className="relative bg-card/80 backdrop-blur-xl border-border/50 p-6 rounded-2xl shadow-2xl transform transition-transform duration-500 hover:rotate-y-2 hover:rotate-x-2">
                {/* Mock UI */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-white/5" />
                      <div className="h-8 w-24 rounded bg-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((col) => (
                      <div key={col} className="space-y-3">
                        <div className="h-4 w-20 bg-white/10 rounded mb-4" />
                        {[1, 2].map((card) => (
                          <div key={card} className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
                            <div className="h-3 w-full bg-white/10 rounded" />
                            <div className="h-3 w-2/3 bg-white/10 rounded" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your data stays private. OpenClaw interacts indirectly through our secure API layer."
              },
              {
                icon: Zap,
                title: "Token Efficient",
                desc: "Stop wasting expensive tokens on simple status checks. Poll our lightweight API instead."
              },
              {
                icon: Layout,
                title: "Visual Control",
                desc: "Full Kanban board to track progress, assign priorities, and manage task lifecycles."
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-card/40 border-border/50 p-6 hover:bg-card/60 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
