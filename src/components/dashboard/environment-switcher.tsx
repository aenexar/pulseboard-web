"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEnvironment } from "@/hooks/useEnvironment";
import { cn } from "@/lib/utils";
import { ChevronDown, Globe } from "lucide-react";

const ENVIRONMENTS = [
  { value: "production", label: "Production", color: "bg-brand" },
  { value: "staging", label: "Staging", color: "bg-yellow-500" },
  { value: "development", label: "Development", color: "bg-blue-500" },
];

export function EnvironmentSwitcher() {
  const { environment, setEnvironment } = useEnvironment();

  const current = ENVIRONMENTS.find((e) => e.value === environment);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-xs font-medium"
        >
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              current ? current.color : "bg-muted-foreground",
            )}
          />
          {current?.label ?? "All environments"}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Filter by environment
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={!environment}
          onCheckedChange={() => setEnvironment(null)}
        >
          <Globe className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          All environments
        </DropdownMenuCheckboxItem>
        {ENVIRONMENTS.map((env) => (
          <DropdownMenuCheckboxItem
            key={env.value}
            checked={environment === env.value}
            onCheckedChange={() =>
              setEnvironment(environment === env.value ? null : env.value)
            }
          >
            <div
              className={cn("w-2 h-2 rounded-full mr-2 shrink-0", env.color)}
            />
            {env.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
