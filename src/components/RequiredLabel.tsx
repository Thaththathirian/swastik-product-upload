import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RequiredLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  htmlFor?: string;
  error?: boolean;
}

export function RequiredLabel({ children, required = false, className, htmlFor, error }: RequiredLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={cn(error && "text-destructive", className)}>
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
  );
}
