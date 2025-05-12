import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type StepperProps = {
  currentStep: "personal" | "success"
}

const steps = [
  { id: "personal", label: "Personal Info" },
  { id: "success", label: "Complete" },
]

const VerificationStepper = ({ currentStep }: StepperProps) => {
  return (
    <div className="w-full">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index
          
          return (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                <div className={cn(
                  "flex-1 h-1",
                  index === 0 ? "hidden" : "block",
                  isCompleted ? "bg-primary" : "bg-gray-200"
                )} />
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                  isActive ? "bg-primary text-white" : 
                  isCompleted ? "bg-primary text-white" : 
                  "bg-gray-200 text-gray-600"
                )}>
                  {isCompleted ? <Check size={16} /> : index + 1}
                </div>
                <div className={cn(
                  "flex-1 h-1",
                  index === steps.length - 1 ? "hidden" : "block",
                  isCompleted ? "bg-primary" : "bg-gray-200"
                )} />
              </div>
              <div className="text-center mt-2">
                <span className="text-xs font-medium">
                  {step.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VerificationStepper
