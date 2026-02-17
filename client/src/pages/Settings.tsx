import { Sidebar, MobileHeader, MobileNav } from "@/components/Sidebar";
import { useApiTokens, useCreateApiToken, useDeleteApiToken } from "@/hooks/use-tokens";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, Key, Copy, Check } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Settings() {
  const { data: tokens, isLoading } = useApiTokens();
  const createToken = useCreateApiToken();
  const deleteToken = useDeleteApiToken();
  const [newTokenName, setNewTokenName] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    
    createToken.mutate({ name: newTokenName }, {
      onSuccess: (data) => {
        setCreatedToken(data.token);
        setNewTokenName("");
        setIsDialogOpen(true);
      }
    });
  };

  const copyToClipboard = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Token copied to clipboard" });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full w-full overflow-y-auto pb-20 md:pb-0">
        <MobileHeader />
        
        <header className="px-6 py-5 border-b border-border/50 bg-background/95 backdrop-blur z-20">
          <h2 className="text-2xl font-display font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground text-sm">Manage your API tokens and integrations.</p>
        </header>

        <main className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
          
          {/* Create Token Section */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                API Tokens
              </CardTitle>
              <CardDescription>
                Create tokens to authenticate your OpenClaw agent. These tokens allow the agent to fetch and update tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateToken} className="flex gap-4 items-end">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input 
                    type="text" 
                    id="tokenName" 
                    placeholder="e.g. Agent - Production"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                  />
                </div>
                <Button disabled={createToken.isPending || !newTokenName.trim()}>
                  {createToken.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Generate Token
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tokens List */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle>Active Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tokens?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tokens created yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens?.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell className="font-medium">{token.name}</TableCell>
                        <TableCell>
                          {token.createdAt && format(new Date(token.createdAt), "PPP")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteToken.mutate(token.id)}
                            disabled={deleteToken.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Integration Guide */}
          <Card className="bg-muted/30 border-dashed border-border shadow-none">
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>
                How to use the API with your OpenClaw agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>1. Add Token Header</Label>
                <div className="bg-black/50 p-3 rounded-md font-mono text-sm text-muted-foreground overflow-x-auto">
                  Authorization: Bearer YOUR_TOKEN_HERE
                </div>
              </div>
              <div className="space-y-2">
                <Label>2. Fetch Pending Tasks (cURL example)</Label>
                <div className="bg-black/50 p-3 rounded-md font-mono text-sm text-green-400 overflow-x-auto whitespace-pre">
                  {`curl -X GET "${window.location.origin}/api/agent/tasks?status=pending" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"`}
                </div>
              </div>
            </CardContent>
          </Card>

        </main>
        
        <MobileNav />
      </div>

      {/* New Token Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Token Generated Successfully</DialogTitle>
            <DialogDescription>
              Please copy your new API token now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={createdToken || ""}
                readOnly
                className="font-mono text-sm bg-muted"
              />
            </div>
            <Button size="sm" className="px-3" onClick={copyToClipboard}>
              <span className="sr-only">Copy</span>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
