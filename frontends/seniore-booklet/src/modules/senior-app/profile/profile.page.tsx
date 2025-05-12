import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useCurrentUser from "@/modules/authentication/hooks/useCurrentUser";
import { Fingerprint, Loader2, Save, User, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FingerprintListener } from "./FingerprintListener";
import { FingerprintService } from "./fingerprint-sdk";

interface RegisterFingerprintParams {
  seniorId: string;
  templateData: string;
  qualityScore: number;
  fingerPosition?: string;
}

const MAX_PRINTS = 3; 
export function ProfilePage() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [showScanner, setShowScanner] = useState(false);
  const [prints, setPrints] = useState<
    { img: string; template: string; quality: number }[]
  >([]);

  const fingerprintService = new FingerprintService(); 

  const { data: fingerprintStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["fingerprintStatus", user?.user_metadata?.id],
    enabled: !!user?.user_metadata?.id,
    queryFn: async () => {
      if (!user?.user_metadata?.id) return { hasFingerprint: false };
      const templates = await fingerprintService.getActiveTemplates(
        user.user_metadata.id
      );
      return { hasFingerprint: templates.length > 0 };
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({
      seniorId,
      templateData,
      qualityScore,
      fingerPosition = "right_thumb",
    }: RegisterFingerprintParams) => {
      const ok = await fingerprintService.registerFingerprint(
        seniorId,
        templateData,
        qualityScore,
        fingerPosition
      );
    
      console.log("Registering fingerprint", {
        seniorId,
        templateData,
        qualityScore,
        fingerPosition,
      });
    
      if (!ok) {
        throw new Error("Failed to register fingerprint. Please check the logs for details.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fingerprintStatus", user?.user_metadata?.id],
      });
      toast.success("Fingerprint registered successfully!");
      setShowScanner(false);
      setPrints([]);
    },
    onError: (e: Error) =>
      toast.error(e.message || "Failed to register fingerprint"),
  });


  const handleSocketPrint = (data: {
    fingerprint_image: string;
    template: string;
    quality?: number;
  }) => {
    setPrints((prev) => {
      if (prev.length >= MAX_PRINTS) return prev;
      return [
        ...prev,
        {
          img: data.fingerprint_image,
          template: data.template,
          quality: data.quality ?? 0,
        },
      ];
    });

    if (!registerMutation.isPending && prints.length === 0) {
      toast.loading("Registering fingerprint...", { id: "fp" });
      registerMutation
        .mutateAsync({
          seniorId: user!.user_metadata.id,
          templateData: data.template,
          qualityScore: data.quality ?? 0,
        })
        .finally(() => toast.dismiss("fp"));
    }
  };

  const hasFingerprint = fingerprintStatus?.hasFingerprint ?? false;


  const openScanner = () => setShowScanner(true);
  const closeScanner = () => {
    setShowScanner(false);
    setPrints([]);
  };

  return (
    <div className="container mx-auto max-w-4xl">

      <header className="mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-primary">
              <User className="h-16 w-16 text-primary" />
            </div>
            <Button
              size="sm"
              className="absolute bottom-0 right-0 rounded-full"
            >
              Change
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold dark:text-white mb-1">
              {user?.user_metadata?.firstName ?? "Senior Citizen"}
            </h1>
            <p className="text-lg text-muted-foreground">
              Senior Citizen ID: {user?.user_metadata.id}
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  defaultValue={
                    user?.user_metadata?.firstName || "Senior Citizen"
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || "email@example.com"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={
                      user?.user_metadata?.phoneNumber || "+63 XXX XXX XXXX"
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  defaultValue={user?.user_metadata?.address || "Address"}
                />
              </div>

              <Button size="lg">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Fingerprint Registration
            </h2>

            {isCheckingStatus ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
              </div>
            ) : showScanner ? (
              <>
                <FingerprintListener onCapture={handleSocketPrint} />
                <div className="flex gap-4 mt-6">
                  <Button
                    variant="secondary"
                    onClick={closeScanner}
                    disabled={registerMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              </>
            ) : hasFingerprint ? (
   
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-8 w-8 text-green-600" />
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Fingerprint registered successfully!
                    </p>
                  </div>
                </div>
              </div>
            ) : (

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-8 w-8 text-blue-600" />
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      No Fingerprint Registered
                    </p>
                  </div>
                </div>
                <Button
                  onClick={openScanner}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering…
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Register Fingerprint
                    </>
                  )}
                </Button>
              </div>
            )}

            {prints.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                {prints.map((p, i) => (
                  <img
                    key={i}
                    src={`data:image/png;base64,${p.img}`}
                    alt={`Fingerprint ${i + 1}`}
                    className="rounded shadow"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
