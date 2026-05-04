import { useState, useEffect, useCallback } from "react";
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
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto text-center section-fade">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 pill">
            <UserIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Account Required</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">Translation History</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Sign in to save your translations and access them anytime
          </p>
          
          <Card className="premium-panel panel-border-glow rounded-[28px] border-0 shadow-xl max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                   style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}>
                <HistoryIcon className="w-8 h-8 text-black" />
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 pill">
            <HistoryIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Your Translations</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Translation History</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Access and manage your saved caption translations
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* User Info */}
        <Card className="premium-panel panel-border-glow rounded-[28px] border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}>
                <UserIcon className="w-6 h-6 text-black" />
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
          <div className="grid gap-6">
            {history.map((translation) => (
              <Card key={translation.id} className="premium-panel panel-border-glow rounded-[28px] border-0 shadow-lg hover-lift transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                           style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}>
                        <Languages className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                            {translation.source_language} → {translation.target_language}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                            {translation.translation_style}
                          </Badge>
                          {translation.gender_context && (
                            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
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
                
                <CardContent className="space-y-4">
                  {/* Original Text */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-300">Original ({translation.source_language})</div>
                    <div className="p-4 bg-black/50 border border-white/10 rounded-2xl text-gray-200 text-sm shadow-inner">
                      {translation.original_text}
                    </div>
                  </div>

                  {/* Translated Text */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-300">Translation ({translation.target_language})</div>
                    <div className="p-4 bg-black/50 border border-white/10 rounded-2xl text-yellow-300 text-sm shadow-inner">
                      {translation.translated_text}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
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
          <Card className="premium-panel panel-border-glow rounded-[28px] border-0 shadow-xl hover-lift">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-6 text-gray-400" />
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