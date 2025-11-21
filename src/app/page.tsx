"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// The WakeLockSentinel interface is part of the modern DOM API.
// We declare it here to ensure TypeScript recognizes it.
interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: "screen";
  release(): Promise<void>;
}

export default function Home() {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("Stopped");
  const { toast } = useToast();

  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const fallbackInterval = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const charIndex = useRef(0);

  const textToSimulate = "PseudoSAP activity simulation... All systems nominal... ";

  const simulateActivity = () => {
    // 1. Simulate scrolling
    window.scrollBy(0, 10);
    setTimeout(() => window.scrollBy(0, -10), 100);

    // 2. Simulate typing
    if (textareaRef.current) {
      // Add a character
      textareaRef.current.value += textToSimulate[charIndex.current];
      charIndex.current = (charIndex.current + 1) % textToSimulate.length;

      // Auto-scroll textarea to the bottom
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;

      // Keep textarea value from getting too long
      if (textareaRef.current.value.length > 1000) {
        textareaRef.current.value = textareaRef.current.value.slice(-500);
      }
    }
  };

  const stopActivity = async () => {
    // Stop Wake Lock
    if (wakeLock.current) {
      try {
        await wakeLock.current.release();
      } catch (err) {
        console.error("Error releasing wake lock:", err);
      }
      wakeLock.current = null;
    }

    // Stop Fallback
    if (fallbackInterval.current) {
      clearInterval(fallbackInterval.current);
      fallbackInterval.current = null;
    }

    setIsActive(false);
    setStatus("Stopped");
    charIndex.current = 0;
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  };

  const startActivity = async () => {
    setIsActive(true);
    try {
      if ("wakeLock" in navigator) {
        wakeLock.current = await (navigator.wakeLock as any).request("screen");
        setStatus("Wake Lock Active");

        wakeLock.current.addEventListener("release", () => {
          // This happens if the user switches tabs, minimizes the window, etc.
          if (wakeLock.current && !wakeLock.current.released) return;
          stopActivity();
          toast({
            title: "Wake Lock Released",
            description: "Screen lock prevention was stopped by the browser.",
            variant: "destructive",
          });
        });

      } else {
        throw new Error("Wake Lock API not supported.");
      }
    } catch (err) {
      console.error(`Wake Lock failed: ${(err as Error).name}, ${(err as Error).message}`);
      setStatus("Fallback Active");
      fallbackInterval.current = setInterval(simulateActivity, Math.random() * 2000 + 3000);
    }
  };

  const handleToggle = () => {
    if (isActive) {
      stopActivity();
    } else {
      startActivity();
    }
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopActivity();
    };
  }, []);

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground font-body">
        <Card className="w-full max-w-lg border-border shadow-2xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl md:text-5xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              PseudoSAP
            </CardTitle>
            <CardDescription className="pt-2 text-base">
              Keep your screen awake, no admin rights required.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-8 pt-2">
            <Button
              onClick={handleToggle}
              size="lg"
              className={`w-48 text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isActive ? "Stop" : "Start"}
            </Button>

            <div className="h-8 flex items-center justify-center">
              <p
                className={`text-lg font-medium transition-colors duration-300 ${
                  status === "Stopped"
                    ? "text-muted-foreground"
                    : "text-accent-foreground"
                }`}
              >
                Status:{" "}
                <span className={`font-bold ${isActive ? "text-accent" : ""}`}>
                  {status}
                </span>
                {isActive && (
                  <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-accent animate-pulse"></span>
                )}
              </p>
            </div>

            <Textarea
              ref={textareaRef}
              placeholder="Simulated activity will appear here when fallback mode is active..."
              readOnly
              className="h-40 resize-none bg-muted font-code focus-visible:ring-accent"
              aria-label="Simulated activity log"
            />
          </CardContent>
        </Card>
      </main>
      {/* Extra vertical space to ensure the page is scrollable for the fallback mechanism */}
      <div className="h-[150vh]" />
    </>
  );
}
