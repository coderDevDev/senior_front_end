import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';

export const PersonalInfoStep = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium">Personal Information Verified</h3>
        <p className="text-sm text-gray-600">
          Please review your information before proceeding
        </p>
      </div>
      <Button className="w-full" onClick={onNext} variant="default">
        Complete Registration
      </Button>
    </div>
  );
};

export const SuccessStep = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
        <UserCheck className="h-12 w-12 text-green-600" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Registration Complete!</h3>
        <p className="text-gray-600">You can now log in to your account</p>
      </div>
      <Button onClick={onComplete}>Go to Login</Button>
    </div>
  );
};
