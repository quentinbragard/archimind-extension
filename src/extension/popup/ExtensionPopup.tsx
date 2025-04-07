import React, { useState, useEffect } from 'react';
import { 
  Mail,
  Lock,
  LogIn,
  LogOut,
  UserPlus,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import './popup.css';
import { getMessage } from '@/core/utils/i18n';
import { authService } from '@/services/auth/AuthService';
import { AuthState } from '@/types';

// AI Tool Configuration
const AI_TOOLS = [
  {
    name: 'ChatGPT',
    icon: <img src="https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images//chatgpt_logo.png" alt="ChatGPT" className="h-8 w-8" />,
    url: 'https://chat.openai.com/',
    description: 'OpenAI\'s conversational AI',
    disabled: false,
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    name: 'Claude',
    icon: <img src="https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images//claude_logo.png" alt="Claude" className="h-8 w-8" />,
    url: 'https://claude.ai/',
    description: 'Anthropic\'s AI assistant',
    disabled: true,
    color: 'from-purple-500/20 to-indigo-500/20'
  },
  {
    name: 'Gemini',
    icon: <img src="https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images//gemini_logo.png" alt="Gemini" className="h-8 w-8" />,
    url: 'https://gemini.google.com/',
    description: 'Google\'s generative AI',
    disabled: true,
    color: 'from-blue-500/20 to-sky-500/20'
  },
  {
    name: 'Mistral',
    icon: <img src="https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images//mistral_logo.png" alt="Mistral" className="h-8 w-8" />,
    url: 'https://chat.mistral.ai/',
    description: 'Mistral AI\'s conversational model',
    disabled: true,
    color: 'from-amber-500/20 to-yellow-500/20'
  },
  {
    name: 'Perplexity',
    icon: <img src="https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images//perplexity_logo.png" alt="Perplexity" className="h-8 w-8" />,
    url: 'https://www.perplexity.ai/',
    description: 'AI-powered search and chat',
    disabled: true,
    color: 'from-pink-500/20 to-rose-500/20'
  }
];

// Function to sort chart data by date
const sortChartDataByDate = (data: Array<{ name: string; value: number }>) => {
  return [...data].sort((a, b) => {
    return new Date(a.name).getTime() - new Date(b.name).getTime();
  });
};

const ExtensionPopup: React.FC = () => {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(state => {
      setAuthState(state);
    });

    // Initialize auth service if needed
    if (!authService.isInitialized()) {
      authService.initialize();
    }

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  const openTool = (url: string) => {
    chrome.tabs.create({ url });
  };

  const openWelcomePage = () => {
    chrome.tabs.create({ url: 'welcome.html' });
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      setLoginError(getMessage('invalidCredentials', undefined, 'Please enter both email and password'));
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const success = await authService.signInWithEmail(email, password);
      
      if (success) {
        toast.success(getMessage('signInSuccessful', undefined, 'Sign-in successful'));
      } else {
        // Error is set via authService subscription
        setLoginError(authState.error || getMessage('invalidCredentials', undefined, 'Invalid email or password'));
      }
    } catch (error) {
      setLoginError(getMessage('loginFailed', undefined, 'Login failed. Please try again.'));
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const success = await authService.signInWithGoogle();
      
      if (success) {
        toast.success(getMessage('signInSuccessful', undefined, 'Sign-in successful'));
      } else {
        // Error is set via authService subscription
        setLoginError(authState.error || getMessage('loginFailed', undefined, 'Google login failed'));
      }
    } catch (error) {
      setLoginError(getMessage('loginFailed', undefined, 'Login failed. Please try again.'));
      console.error('Google login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success(getMessage('signedOut', undefined, 'Signed out successfully'));
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(getMessage('logoutFailed', undefined, 'Failed to sign out'));
    }
  };

  // Loading state
  if (authState.isLoading) {
    return (
      <div className="w-80 bg-gradient-to-b from-background to-background/90 text-white flex flex-col items-center justify-center h-64 p-4 space-y-4">
        <div className="relative">
          <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-xl rounded-full"></div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-white animate-pulse">Loading your AI tools</p>
          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-1/2 animate-[gradient-shift_1s_ease_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view
  if (authState.isAuthenticated && authState.user) {
    return (
      <div className="w-80 bg-gradient-to-b from-background to-background/80 backdrop-blur overflow-hidden">
        <Card className="w-full -none shadow-none relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
          <CardHeader className="pb-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-90 bg-animate"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwMC44NzYgMTYwLjAwOGM2LjgxOCA2LjgxOCAxNi4xMTQgMTEuMDM5IDI2LjQxNCAxMS4wMzlzMTkuNTk2LTQuMjIxIDI2LjQxNC0xMS4wMzlsLjAwMS0uMDAxYzYuODE5LTYuODE4IDExLjA0MS0xNi4xMTQgMTEuMDQxLTI2LjQxNCAwLTEwLjMtNC4yMjItMTkuNTk3LTExLjA0MS0yNi40MTYtNi44MTgtNi44MTgtMTYuMTE0LTExLjA0LTI2LjQxNC0xMS4wNC0xMC4zIDAtMTkuNTk2IDQuMjIyLTI2LjQxNCAxMS4wNGwtLjAwMi4wMDFjLTYuODE4IDYuODE5LTExLjAzOSAxNi4xMTQtMTEuMDM5IDI2LjQxNCAwIDEwLjMgNC4yMjEgMTkuNTk2IDExLjAzOSAyNi40MTRsLjAwMS4wMDFaIiBmaWxsPSIjZmZmZmZmMTAiLz48cGF0aCBkPSJNMjU2IDMwNmM4LjI4NCAwIDE1LTYuNzE2IDE1LTE1IDAtOC4yODQtNi43MTYtMTUtMTUtMTVzLTE1IDYuNzE2LTE1IDE1YzAgOC4yODQgNi43MTYgMTUgMTUgMTVaIiBmaWxsPSIjZmZmZmZmMTAiLz48cGF0aCBkPSJNMTg4IDM3MC41YzAgMTEuODc0IDkuNjI2IDIxLjUgMjEuNSAyMS41UzIzMSAzODIuMzc0IDIzMSAzNzAuNSAyMjEuMzc0IDM0OSAyMDkuNSAzNDkgMTg4IDM1OC42MjYgMTg4IDM3MC41WiIgZmlsbD0iI2ZmZmZmZjEwIi8+PHBhdGggZD0iTTMxNCAyODVjMCA0LjQ0Mi0zLjU1OCA4LTggOHMtOC0zLjU1OC04LTggMy41NTgtOCA4LTggOCAzLjU1OCA4IDhaIiBmaWxsPSIjZmZmZmZmMTAiLz48L3N2Zz4=')] bg-cover opacity-50"></div>
            
            {/* Add geometric shapes for modern touch */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-5 rounded-full transform -translate-x-8 translate-y-8"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl font-bold">
                    {getMessage('aiToolLauncher', undefined, 'AI Tool Launcher')}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-white/90 font-medium">Online</span>
                </div>
              </div>
              <div className="text-sm text-blue-100 mt-2 flex items-center">
                <div className="glass px-3 py-1 rounded-full text-xs flex items-center space-x-1 backdrop-blur-sm bg-white/10 shadow-inner">
                  <span className="text-white/90">{getMessage('signedInAs', undefined, 'Signed in as')}</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {authState.user.email || authState.user.name}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 mt-2">
            {AI_TOOLS.map((tool) => (
              <div key={tool.name} className="relative group perspective">
                <div className={`absolute inset-0 bg-gradient-to-r ${tool.color} rounded-lg -m-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <Button 
                  variant={tool.disabled ? "outline" : "ghost"}
                  className={`w-full justify-start py-7 relative bg-card/95  shadow-sm hover:shadow-md transition-all card-3d ${tool.disabled ? 'opacity-80 hover:opacity-80 cursor-not-allowed' : ''}`}
                  onClick={() => !tool.disabled && openTool(tool.url)}
                  disabled={tool.disabled}
                >
                  <div className="flex items-center w-full">
                    <div className="flex-shrink-0 mr-3 p-1.5 bg-gradient-to-br from-background/80 to-background rounded-md tool-icon">
                      {tool.icon}
                    </div>
                    <div className="flex-grow text-left">
                      <div className="font-semibold text-white">{tool.name}</div>
                      <div className="text-xs text-white truncate max-w-[160px]">
                        {tool.description}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2 text-white/70">
                      {!tool.disabled ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">Soon</span>
                      )}
                    </div>
                  </div>
                  {!tool.disabled && (
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg pointer-events-none">
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500/10 rounded-full"></div>
                      <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-indigo-500/10 rounded-full"></div>
                    </div>
                  )}
                </Button>
                {tool.disabled && (
                  <Badge 
                    className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white -none text-xs font-medium px-2 py-1 rounded-full shadow-md coming-soon-badge badge-glow"
                  >
                    Coming Soon
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter className="-t -gray-200 dark:-gray-800 pt-3 pb-3 flex justify-center">
            <div className="w-full px-2">
              <Button 
                variant="ghost" 
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2 transition-all duration-300 py-5 rounded-lg group"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">{getMessage('signOut', undefined, 'Sign Out')}</span>
              </Button>
              <div className="text-xs text-center text-white mt-2">
                Archimind v1.0.0
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Unauthenticated view
  return (
    <div className="w-80 bg-gradient-to-b from-background to-background/90 backdrop-blur overflow-hidden">
      <Card className="w-full -none shadow-none relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
        <CardHeader className="pb-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-90 bg-animate"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold">
                  {getMessage('aiToolLauncher', undefined, 'AI Tool Launcher')}
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Login Form */}
          <div className="space-y-3">
            {loginError && (
              <div className="bg-red-500/10 text-red-500  -red-300/20 p-3 rounded-lg text-sm font-medium shadow-sm backdrop-blur-sm flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className="flex-1">
                  {loginError}
                </div>
              </div>
            )}
            
            <div className="space-y-2 text-white">
              <Label htmlFor="email-signin" className="text-white font-medium text-sm">
                {getMessage('email', undefined, 'Email')}
              </Label>
              <div className="relative group">
                <Input 
                  id="email-signin"
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 pr-4 py-2 bg-background/80 backdrop-blur-sm -input focus:ring-2 focus:ring-blue-500/20 focus:-blue-500 transition-all rounded-lg"
                  disabled={isLoggingIn}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white group-focus-within:text-blue-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-white">
              <div className="flex justify-between items-center">
                <Label htmlFor="password-signin" className="text-white font-medium text-sm">
                  {getMessage('password', undefined, 'Password')}
                </Label>
                <Button variant="link" className="p-0 h-auto text-xs text-blue-500 hover:text-blue-400 transition-colors">Forgot?</Button>
              </div>
              <div className="relative group">
                <Input 
                  id="password-signin"
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-4 py-2 bg-background/80 backdrop-blur-sm -input focus:ring-2 focus:ring-blue-500/20 focus:-blue-500 transition-all rounded-lg"
                  disabled={isLoggingIn}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEmailLogin();
                    }
                  }}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white group-focus-within:text-blue-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleEmailLogin} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 py-5 mt-3 rounded-lg relative overflow-hidden group"
              disabled={isLoggingIn}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/0 via-blue-400/10 to-blue-600/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              {isLoggingIn ? (
                <span className="flex items-center justify-center">
                  <div className="spinner-sm mr-2">
                    <div className="double-bounce1"></div>
                    <div className="double-bounce2"></div>
                  </div>
                  <span>{getMessage('signingIn', undefined, 'Signing in...')}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>{getMessage('signIn', undefined, 'Sign In')}</span>
                </span>
              )}
            </Button>
          </div>
  
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full -t -muted"></div>
            </div>
            <div className="relative flex justify-center text-xs font-medium">
              <span className="px-4 py-1 bg-background text-white rounded-full  -muted">
                {getMessage('or', undefined, 'Or continue with')}
              </span>
            </div>
          </div>
  
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              onClick={handleGoogleLogin} 
              className="w-full  -gray-200 hover:bg-gray-50/50 hover:-gray-300 dark:hover:bg-gray-800/50 transition-all duration-300 py-5 rounded-lg group relative overflow-hidden"
              disabled={isLoggingIn}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="flex items-center justify-center relative z-10">
                <div className="p-1.5 bg-white rounded-full shadow-sm mr-3 group-hover:shadow group-hover:scale-110 transition-all duration-300">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
                </div>
                <span className="font-medium text-white">{getMessage('signInWith', ['Google'], 'Sign in with Google')}</span>
              </span>
            </Button>
            
            <div className="relative">
              <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-muted to-transparent -translate-y-1/2"></div>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={openWelcomePage}
              className="w-full text-blue-600 hover:text-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-300 py-5 rounded-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="flex items-center justify-center space-x-2 relative z-10">
                <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">{getMessage('createAccount', undefined, 'Create Account')}</span>
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensionPopup;