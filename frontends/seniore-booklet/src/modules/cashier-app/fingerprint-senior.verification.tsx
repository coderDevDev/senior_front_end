
import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Fingerprint,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FingerprintListener } from "./FingerprintListener";
import { FingerprintService } from "../senior-app/profile/fingerprint-sdk"; 


interface SeniorInfo {
  id: string;
  firstName?: string;
  lastName?: string;
  birthdate?: string;
  contactNumb?: string;
  healthStatus?: string;
  address?: string;
}

interface FingerprintVerificationProps {
  onVerificationComplete: (success: boolean, seniorId?: string) => void;
  onCancel: () => void;
}

type VerificationState =
  | "initial"
  | "listening" 
  | "verifying" 
  | "success"
  | "failed";

const FingerprintVerification: React.FC<FingerprintVerificationProps> = ({
  onVerificationComplete,
  onCancel,
}) => {

  const [state, setState] = useState<VerificationState>("initial");
  const [error, setError] = useState<string | null>(null);
  const [senior, setSenior] = useState<SeniorInfo | null>(null);


  const fingerprintService = useMemo(() => new FingerprintService(), []);
  const queryClient = useQueryClient();


  const verifyMutation = useMutation<
    SeniorInfo,
    Error,
    { id: string; ip: string }
  >({
    mutationFn: async ({ id }) => {

      const info = await fingerprintService.getSeniorById(id);
      if (!info) throw new Error("Senior not found in records");
      return info;
    },
    onSuccess: (info) => {
      setSenior(info);
      setState("success");

      const name = `${info.firstName ?? ""} ${info.lastName ?? ""}`.trim();
      toast.success(`${name || "Senior citizen"} verified successfully!`);

      queryClient.invalidateQueries({ queryKey: ["senior", info.id] });

      setTimeout(() => onVerificationComplete(true, info.id), 2000);
    },
    onError: (err) => {
      setState("failed");
      setError(err.message || "Could not identify the senior citizen.");
      toast.error(err.message || "Verification failed");
    },
  });

 
  const handleMatch = useCallback(
    ({ id, ipaddress }: { id: string; ipaddress: string }) => {
      console.log("🔍 match_fingerprint received", { id, ipaddress });
      setState("verifying");
      verifyMutation.mutate({ id, ip: ipaddress });
    },
    [verifyMutation]
  );


  const reset = () => {
    setState("initial");
    setError(null);
    setSenior(null);
    verifyMutation.reset();
  };


  const renderBody = () => {
    switch (state) {

      case "initial":
        return (
          <div className="text-center p-6">
            <Fingerprint className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">
              Senior Citizen Identification
            </h3>
            <p className="text-gray-500 mb-6">
              Please place the senior citizen's finger on the scanner to
              identify them and continue.
            </p>
            <Button onClick={() => setState("listening")} className="w-full">
              Start Scanning
            </Button>
          </div>
        );


      case "listening":
        return (
          <div className="text-center p-6">
            {/* Listener renders nothing visible */}
            <FingerprintListener onMatch={handleMatch} />
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="text-lg font-medium mb-2">
              Waiting for Fingerprint…
            </h3>
            <p className="text-gray-500">
              Ask the senior citizen to tap the scanner.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                reset();
                onCancel();
              }}
              className="mt-4"
            >
              Cancel
            </Button>
          </div>
        );


      case "verifying":
        return (
          <div className="text-center p-6">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="text-lg font-medium mb-2">
              Identifying Senior Citizen
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch records…
            </p>
          </div>
        );

      /* ————————————————— success ————————————————— */
      case "success":
        return (
          <div className="text-center p-6">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium mb-2">
              Senior Citizen Identified
            </h3>
            {senior && (
              <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-center mb-2">
                  <User className="w-8 h-8 text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-green-800">
                    {`${senior.firstName ?? ""} ${senior.lastName ?? ""}`.trim() ||
                      "Senior Citizen"}
                  </h4>
                </div>
                {senior.birthdate && (
                  <p className="text-sm text-green-600">
                    DOB:{" "}
                    {new Date(senior.birthdate).toLocaleDateString("en-US")}
                  </p>
                )}
                {senior.address && (
                  <p className="text-sm text-green-600">
                    Address: {senior.address}
                  </p>
                )}
                {senior.healthStatus && (
                  <p className="text-sm text-green-600">
                    Health Status: {senior.healthStatus}
                  </p>
                )}
              </div>
            )}
            <p className="text-gray-500 mt-4">Proceeding with checkout…</p>
          </div>
        );

      case "failed":
        return (
          <div className="text-center p-6">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Identification Failed</h3>
            <p className="text-gray-500 mb-6">
              {error ||
                "Could not identify the senior citizen. Please try again."}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={reset} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="bg-white rounded-lg shadow-md">{renderBody()}</div>;
};

export default FingerprintVerification;
