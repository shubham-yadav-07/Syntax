import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";

interface Step {
  id: number;
  label: string;
  status: "pending" | "processing" | "completed";
}

const analysisSteps: Step[] = [
  { id: 1, label: "Parsing Code", status: "completed" },
  { id: 2, label: "Analyzing Complexity", status: "processing" },
  { id: 3, label: "Generating Insights", status: "pending" },
  { id: 4, label: "Creating Visualizations", status: "pending" },
];

export function ProgressIndicator() {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border/50 backdrop-blur-sm">
      <h3 className="text-lg mb-6">Analysis Progress</h3>

      <div className="space-y-4">
        {analysisSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl ${
              step.status === "completed"
                ? "bg-green-500/10 border border-green-500/30"
                : step.status === "processing"
                ? "bg-primary/10 border border-primary/30"
                : "bg-muted/30 border border-border/50"
            }`}
          >
            <div
              className={`size-10 rounded-full flex items-center justify-center ${
                step.status === "completed"
                  ? "bg-green-500/20"
                  : step.status === "processing"
                  ? "bg-primary/20"
                  : "bg-muted/50"
              }`}
            >
              {step.status === "completed" ? (
                <Check className="size-5 text-green-400" />
              ) : step.status === "processing" ? (
                <Loader2 className="size-5 text-primary animate-spin" />
              ) : (
                <span className="text-sm text-muted-foreground">{step.id}</span>
              )}
            </div>

            <div className="flex-1">
              <p
                className={`text-sm ${
                  step.status === "pending"
                    ? "text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {step.label}
              </p>
            </div>

            {step.status === "processing" && (
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="size-2 rounded-full bg-primary"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="size-2 rounded-full bg-primary"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="size-2 rounded-full bg-primary"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="text-primary">50%</span>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "50%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </div>
    </div>
  );
}
