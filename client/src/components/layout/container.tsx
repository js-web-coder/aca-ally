import { ReactNode } from "react";
import { RecommendationSidebar } from "@/components/recommendation/sidebar";
import { useAuth } from "@/hooks/use-auth";

interface ContainerProps {
  children: ReactNode;
  showSidebar?: boolean;
  centered?: boolean;
  className?: string;
}

export function Container({
  children,
  showSidebar = true,
  centered = false,
  className = "",
}: ContainerProps) {
  const { user } = useAuth();
  const hasSidebar = showSidebar && user;

  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-6">
        <div
          className={`${
            hasSidebar ? "md:w-3/4" : "w-full"
          } ${
            centered && !hasSidebar ? "mx-auto max-w-3xl" : ""
          }`}
        >
          {children}
        </div>

        {hasSidebar && (
          <div className="md:w-1/4 flex-shrink-0">
            <div className="sticky top-24">
              <RecommendationSidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}