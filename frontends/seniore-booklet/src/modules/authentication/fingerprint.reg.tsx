import { Card } from "@/components/ui/card"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import VerificationStepper from "../../components/verification-stepper"
import { PersonalInfoStep, SuccessStep } from "../../components/verification-steps"

type VerificationStep = "personal" | "success"

const VerificationPage = () => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>("personal")
  const navigate = useNavigate()

  const renderStepContent = () => {
    switch (currentStep) {
      case "personal":
        return (
          <PersonalInfoStep 
            onNext={() => setCurrentStep("success")} 
          />
        )
      case "success":
        return (
          <SuccessStep
            onComplete={() => navigate("/")}
          />
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl p-8">
        <VerificationStepper currentStep={currentStep} />
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}

export default VerificationPage
