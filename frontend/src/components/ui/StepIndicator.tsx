interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-primary-container text-on-primary-container'
                    : isCurrent
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-[#E5E7EB] text-slate-heavy/50'
                }`}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              <span
                className={`text-sm whitespace-nowrap overflow-hidden text-ellipsis hidden sm:block ${
                  isCurrent ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-primary-container' : 'bg-[#E5E7EB]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
