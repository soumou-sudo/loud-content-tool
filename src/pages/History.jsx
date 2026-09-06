import { useState, useEffect, useCallback } from "react";
import WorkspaceHeading from '@/components/WorkspaceHeading';
import { User, CaptionHistory } from "@/entities/all";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  History as HistoryIcon,
  Copy,
  Languages,
  Clock,
  User as UserIcon,
  LogIn,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function History() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use a stable callback for loading history
  const loadHistory = useCallback(async (userId) => {
    try {
      const translations = await CaptionHistory.filter(
        { user_id: userId },
        '-created_date',
        50
      );
      setHistory(translations);
    } catch (error) {
      console.error("Failed to load history:", error);
      setError("Failed to load translation history");
    }
  }, []);

  // Stable function for checking user and loading history
  const checkUserAndLoadHistory = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      await loadHistory(userData.id);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadHistory]); // loadHistory is now a stable dependency

  useEffect(() => {
    checkUserAndLoadHistory();
  }, [checkUserAndLoadHistory]); // checkUserAndLoadHistory is now a stable dependency

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      setError("Failed to copy to clipboard");
    }
  };

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
    } catch (error) {
      setError("Login failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto section-fade">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                 style={{borderColor: 'var(--accent-yellow)'}}></div>
            <p className="mt-4 text-gray-300">Loading your history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="studio-workspace studio-tool-page min-h-screen px-6 lg:px-10 bg-background text-foreground">
        <div className="max-w-7xl mx-auto">
          <WorkspaceHeading number="03" label="Your library" title="Translation history" description="Sign in to keep your translations together and return to them whenever inspiration calls." />
          <Card className="studio-panel max-w-lg mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 border border-border rounded-md flex items-center justify-center mx-auto mb-6">
                <HistoryIcon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">Save Your Work</h3>
              <p className="text-gray-300 mb-6">
                Keep track of all your caption translations with automatic history saving
              </p>
              <Button 
                onClick={handleLogin}
                className="w-full btn-primary"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-workspace studio-tool-page min-h-screen px-6 lg:px-10 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <WorkspaceHeading number="03" label="Your library" title="Translation history" description="Good words are worth keeping. Find, revisit, and reuse your saved caption translations." />

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* User Info */}
        <Card className="studio-panel mb-5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-border rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Welcome back, {user.full_name}</h3>
                <p className="text-gray-300">You have {history.length} saved translations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        {history.length > 0 ? (
          <div className="grid gap-4">
            {history.map((translation) => (
              <Card key={translation.id} className="studio-panel">
                <CardHeader className="studio-panel-header">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-border rounded-md flex items-center justify-center shrink-0">
                        <Languages className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="outline" className="rounded-sm text-xs text-muted-foreground border-border font-normal">
                            {translation.source_language} → {translation.target_language}
                          </Badge>
                          <Badge variant="outline" className="rounded-sm text-xs text-muted-foreground border-border font-normal">
                            {translation.translation_style}
                          </Badge>
                          {translation.gender_context && (
                            <Badge variant="outline" className="rounded-sm text-xs text-muted-foreground border-border font-normal">
                              {translation.gender_context}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-3 h-3" />
                          {format(new Date(translation.created_date), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
                  {/* Original Text */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-300">Original ({translation.source_language})</div>
                    <div className="studio-subpanel min-h-28 text-sm text-foreground">
                      {translation.original_text}
                    </div>
                  </div>

                  {/* Translated Text */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-300">Translation ({translation.target_language})</div>
                    <div className="studio-subpanel min-h-28 text-sm text-primary">
                      {translation.translated_text}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-border pt-5 md:col-span-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(translation.original_text)} className="btn-outline-dark">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Original
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(translation.translated_text)} className="btn-outline-dark">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Translation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="studio-panel">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-6 w-fit border border-border p-4"><FileText className="h-7 w-7 text-primary" strokeWidth={1.4} /></div>
              <h3 className="text-xl font-semibold text-white mb-2">No translations yet</h3>
              <p className="text-gray-300 mb-6">
                Start translating captions to see your history here
              </p>
              <Button className="btn-primary">
                <Languages className="w-4 h-4 mr-2" />
                Start Translating
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}