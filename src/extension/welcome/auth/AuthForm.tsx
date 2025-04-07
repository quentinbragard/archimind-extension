import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Lock, 
  User, 
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from "sonner";
import { getMessage } from '@/core/utils/i18n';
import { authService } from '@/services/auth/AuthService';

export interface AuthFormProps {
  initialMode?: 'signin' | 'signup';
  isSessionExpired?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

export interface AuthMessage {
  text: string; 
  type: 'error' | 'success' | 'info';
}

// The AuthForm component using the AuthService
export const AuthForm: React.FC<AuthFormProps> = ({ 
  initialMode = 'signin',
  isSessionExpired = false,
  onSuccess,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(
    isSessionExpired 
      ? { text: getMessage('sessionExpired', undefined, 'Session expired'), type: 'info' }
      : null
  );

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    // Set message when session expired flag changes
    if (isSessionExpired) {
      setMessage({ 
        text: getMessage('sessionExpired', undefined, 'Session expired'), 
        type: 'info' 
      });
    }
  }, [isSessionExpired]);

  // Listen for auth state changes
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((state) => {
      if (state.error) {
        setMessage({
          text: state.error,
          type: 'error'
        });
      } else if (state.user && state.isAuthenticated) {
        // Success state - user is authenticated
        if (onSuccess) {
          onSuccess();
        }
      }
    });
    
    // Clean up subscription
    return () => {
      unsubscribe();
      authService.clearError();
    };
  }, [onSuccess]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setMessage(null);
    authService.clearError();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetForm();
  };

  // Form validation functions
  const validateSignInInputs = (): boolean => {
    if (!email.trim()) {
      setMessage({
        text: getMessage('enterEmail', undefined, 'Please enter your email'), 
        type: 'error'
      });
      return false;
    }
    
    if (!password) {
      setMessage({
        text: getMessage('enterPassword', undefined, 'Please enter your password'), 
        type: 'error'
      });
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage({
        text: getMessage('invalidEmail', undefined, 'Invalid email address'), 
        type: 'error'
      });
      return false;
    }
    
    return true;
  }

  const validateSignUpInputs = (): boolean => {
    if (!validateSignInInputs()) {
      return false;
    }
    
    if (password.length < 8) {
      setMessage({
        text: getMessage('passwordTooShort', undefined, 'Password must be at least 8 characters'), 
        type: 'error'
      });
      return false;
    }
    
    return true;
  }

  // Auth submission handlers using the authService
  const handleEmailSignIn = async () => {
    if (!validateSignInInputs()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    
    try {
      const success = await authService.signInWithEmail(email.trim(), password);

      if (success) {
        toast.success(
          getMessage('signInSuccessful', undefined, 'Sign-in successful'), 
          {
            description: getMessage('youCanNowAccess', undefined, 'You can now access your conversations')
          }
        );
        
        // Open ChatGPT in a new tab
        window.open('https://chat.openai.com', '_blank');
        
        if (onClose) {
          onClose();
        }
      }
      // If not successful, the AuthService subscription will update the message
    } catch (error) {
      setMessage({
        text: getMessage('invalidCredentials', undefined, 'Invalid email or password'),
        type: 'error'
      });
      console.error('Auth form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateSignUpInputs()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    
    try {
      const success = await authService.signUp(email.trim(), password, name.trim());
      
      if (success) {
        toast.success(
          getMessage('signUpSuccessful', undefined, 'Sign-up successful'), 
          {
            description: getMessage('redirectingToChatGPT', undefined, 'Redirecting to ChatGPT...')
          }
        );
        
        // Open ChatGPT in a new tab
        window.open('https://chat.openai.com', '_blank');
        
        // Close the dialog
        if (onClose) {
          onClose();
        }
      }
      // If not successful, the AuthService subscription will update the message
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : String(error),
        type: 'error'
      });
      console.error('Auth form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const success = await authService.signInWithGoogle();
      
      if (success) {
        toast.success(
          getMessage('signInSuccessful', undefined, 'Sign-in successful'), 
          {
            description: getMessage('youCanNowAccess', undefined, 'You can now access your conversations')
          }
        );
        
        // Open ChatGPT in a new tab
        window.open('https://chat.openai.com', '_blank');
        
        if (onClose) {
          onClose();
        }
      }
      // If not successful, the AuthService subscription will update the message
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : String(error),
        type: 'error'
      });
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2 bg-background bg-opacity-100">
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800">
          <TabsTrigger 
            value="signin" 
            className="font-heading text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {getMessage('signIn', undefined, 'Sign In')}
          </TabsTrigger>
          <TabsTrigger 
            value="signup" 
            className="font-heading text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
              {getMessage('signUp', undefined, 'Sign Up')}
          </TabsTrigger>
        </TabsList>
        
        {message && (
          <div 
            className={`p-3 rounded-md mb-4 flex items-start gap-2 ${
              message.type === 'error' 
                ? 'bg-red-900/30 text-red-300 border border-red-700/50' 
                : message.type === 'success'
                  ? 'bg-green-900/30 text-green-300 border border-green-700/50'
                  : 'bg-blue-900/30 text-blue-300 border border-blue-700/50'
            }`}
          >
            {message.type === 'error' ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <RefreshCw className="h-5 w-5 shrink-0" />
            )}
            <span className="text-sm font-sans">{message.text}</span>
          </div>
        )}
        
        <TabsContent value="signin" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email-signin" className="text-gray-300 font-sans">
                {getMessage('email', undefined, 'Email')}
              </Label>
              <div className="relative">
                <Input 
                  id="email-signin"
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white font-sans focus:border-blue-500 focus:ring-blue-500"
                />
                <Mail className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password-signin" className="text-gray-300 font-sans">
                {getMessage('password', undefined, 'Password')}
              </Label>
              <div className="relative">
                <Input 
                  id="password-signin"
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white font-sans focus:border-blue-500 focus:ring-blue-500"
                />
                <Lock className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleEmailSignIn} 
            className="w-full font-heading bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {getMessage('signingIn', undefined, 'Signing in...')}
              </span>
            ) : getMessage('signIn', undefined, 'Sign In')}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400 font-sans">
                {getMessage('or', undefined, 'Or continue with')}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button 
              variant="outline" 
              onClick={handleGoogleSignIn} 
              className="w-full font-heading border-gray-700 text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
              {getMessage('signInWith', ['Google']) || 'Sign in with Google'}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="signup" className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name-signup" className="text-gray-300 font-sans">
              {getMessage('name', undefined, 'Name')}
            </Label>
            <div className="relative">
              <Input 
                id="name-signup"
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white font-sans focus:border-blue-500 focus:ring-blue-500"
              />
              <User className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="email-signup" className="text-gray-300 font-sans">
              {getMessage('email', undefined, 'Email')}
            </Label>
            <div className="relative">
              <Input 
                id="email-signup"
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white font-sans focus:border-blue-500 focus:ring-blue-500"
              />
              <Mail className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="password-signup" className="text-gray-300 font-sans">
              {getMessage('password', undefined, 'Password')}
            </Label>
            <div className="relative">
              <Input 
                id="password-signup"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white font-sans focus:border-blue-500 focus:ring-blue-500"
              />
              <Lock className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSignUp} 
          className="w-full font-heading bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {getMessage('signingUp', undefined, 'Creating account...')}
            </span>
          ) : getMessage('signUp', undefined, 'Sign Up')}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400 font-sans">
              {getMessage('or', undefined, 'Or sign up with')}
            </span>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn}
            className="w-full font-heading border-gray-700 text-white hover:bg-gray-800"
            disabled={isLoading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
            {getMessage('signUpWith', ['Google']) || 'Sign up with Google'}
          </Button>
        </div>
      </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;