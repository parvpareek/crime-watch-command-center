
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="animate-fade-in text-center space-y-6 max-w-lg">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Shield size={60} className="text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Crime Watch Command Center</h1>
        <p className="text-muted-foreground text-lg">
          Interactive dashboard for law enforcement and authorities to visualize and analyze crime reports.
        </p>
        <div>
          <Button size="lg" onClick={() => navigate("/dashboard")} className="mt-4">
            Enter Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
