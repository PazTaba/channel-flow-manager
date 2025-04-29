// src/pages/Unauthorized.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthProvider";
import { Shield, ArrowLeft } from "lucide-react";

/**
 * Unauthorized page shown when users don't have sufficient permissions
 */
export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold">Access Denied</h1>
        
        <p className="text-muted-foreground">
          You don't have permission to access this page. {user ? `Your current role (${user.role}) doesn't have the required permissions.` : 'Please log in with an account that has the necessary permissions.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button onClick={() => navigate("/")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}