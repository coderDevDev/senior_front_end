import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: 'active' | 'archived';
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const variants = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <Badge className={variants[status]} variant="outline">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
