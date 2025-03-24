import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import AuthModal from '@/extension/welcome/auth/AuthModal';
import { MoveRight, LogIn, Zap, BookOpen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import "./welcome.css";

const WelcomePage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  
  // Tasks are now localized using chrome.i18n and kept short for a single line
  const tasks = React.useMemo(
    () => [
      "write professional emails",
      "organize complex data",
      "create content",
      "summarize documents",
      "draft reports"
    ],
    []
  );

  // Animation effect for changing tasks
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTaskIndex((prevIndex) => 
        prevIndex === tasks.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [taskIndex, tasks]);

  const handleGetStarted = () => {
    setAuthMode('signup');
    setIsAuthOpen(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center py-16">
          {/* Logo */}
          <div className="logo-container bg-gray-900 border border-gray-800 mb-8">
            <img 
              src="https://gjszbwfzgnwblvdehzcq.supabase.co/storage/v1/object/public/chrome_extension_assets/archimind-logo.png" 
              alt="Archimind Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-medium text-white text-center mb-6 font-heading">
            Welcome to Archimind
          </h1>
          
          {/* Animation Section with Single Line */}
          <div className="animation-container mb-10">
            <div className="text-3xl md:text-4xl text-blue-500 font-semibold whitespace-nowrap font-heading">
              <span>Use AI to </span>
              <span className="relative inline-block min-w-60 text-left">
                {tasks.map((task, index) => (
                  <motion.span
                    key={index}
                    className="absolute left-0 whitespace-nowrap"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: taskIndex === index ? 1 : 0,
                      y: taskIndex === index ? 0 : 20
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {task}
                  </motion.span>
                ))}
                {/* This maintains space even when animation is changing */}
                <span className="invisible">{tasks[0]}</span>
              </span>
            </div>
          </div>

          <p className="text-lg text-gray-300 max-w-2xl text-center mb-12 font-sans">
            Your Intelligent AI Usage Companion. Our goal is to help you harness the power of AI while maintaining your unique human expertise.
          </p>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 w-full mb-12">
            <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6 text-left feature-card">
              <div className="flex items-start mb-4">
                <Zap className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0" />
                <h3 className="text-lg font-medium text-white font-heading">Energy Insights</h3>
              </div>
              <p className="text-gray-300 text-sm font-sans">
                Track and optimize your AI usage with real-time energy consumption metrics.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6 text-left feature-card">
              <div className="flex items-start mb-4">
                <BookOpen className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0" />
                <h3 className="text-lg font-medium text-white font-heading">Smart Templates</h3>
              </div>
              <p className="text-gray-300 text-sm font-sans">
                Access a library of curated prompt templates to enhance your AI interactions.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6 text-left feature-card">
              <div className="flex items-start mb-4">
                <TrendingUp className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0" />
                <h3 className="text-lg font-medium text-white font-heading">Skill Development</h3>
              </div>
              <p className="text-gray-300 text-sm font-sans">
                Receive personalized recommendations to upskill and maintain human expertise.
              </p>
            </div>
          </div>
          
          {/* Call-to-Action Buttons */}
          <div className="flex flex-row gap-4 mb-8">
            <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 min-w-32 text-white border-gray-700 hover:bg-gray-800 font-heading"
                  onClick={handleSignIn}
                >
                  Sign in <LogIn className="w-4 h-4 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <AuthModal 
                  onClose={() => setIsAuthOpen(false)} 
                  initialMode={authMode}
                />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="gap-2 bg-blue-600 hover:bg-blue-700 min-w-32 font-heading"
                  onClick={handleGetStarted}
                >
                  Get started <MoveRight className="w-4 h-4 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <AuthModal 
                  onClose={() => setIsAuthOpen(false)} 
                  initialMode={authMode}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Email Verification Notice */}
          <p className="text-sm text-gray-500 mb-8 font-sans">
            Email verification required after signup
          </p>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 font-sans">
            &copy; {new Date().getFullYear()} Archimind. All rights reserved
          </div>
        </div>
      </div>
      
      <Toaster richColors />
    </div>
  );
};

export default WelcomePage;