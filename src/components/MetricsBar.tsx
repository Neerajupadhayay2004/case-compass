import { Card } from "@/components/ui/card";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp 
} from "lucide-react";

const metrics = [
  {
    icon: Clock,
    label: "Avg. Handling Time",
    value: "4.2 min",
    change: "-18%",
    positive: true,
  },
  {
    icon: CheckCircle,
    label: "Resolution Rate",
    value: "94.7%",
    change: "+5.2%",
    positive: true,
  },
  {
    icon: AlertTriangle,
    label: "Compliance Errors",
    value: "0.3%",
    change: "-67%",
    positive: true,
  },
  {
    icon: TrendingUp,
    label: "AI Accuracy",
    value: "98.1%",
    change: "+2.1%",
    positive: true,
  },
];

export function MetricsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card 
          key={metric.label} 
          variant="glass" 
          className="p-4 animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-xl lg:text-2xl font-semibold">{metric.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${metric.positive ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <metric.icon className={`h-4 w-4 ${metric.positive ? 'text-success' : 'text-destructive'}`} />
            </div>
          </div>
          <p className={`text-xs mt-2 ${metric.positive ? 'text-success' : 'text-destructive'}`}>
            {metric.change} from last week
          </p>
        </Card>
      ))}
    </div>
  );
}
