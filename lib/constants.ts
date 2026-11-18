import type { ApprovalStatus, BookingStatus, Role, ServiceCategory, ServiceMode } from "@/lib/types";

export const CATEGORIES: ServiceCategory[] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

export const SERVICE_MODES: ServiceMode[] = ["Home Visit", "Shop Drop-off"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

/** Consistent status badge colours across every dashboard. */
export const STATUS_BADGE: Record<BookingStatus, string> = {
  requested: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  accepted: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  "in-progress": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
  cancelled: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
};

export const APPROVAL_BADGE: Record<ApprovalStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export const ROLE_BADGE: Record<Role, string> = {
  customer: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  technician: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  admin: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

/** Landing dashboard route for each role. */
export function dashboardHome(role: Role): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "technician") return "/dashboard/technician";
  return "/dashboard/customer";
}

export const TECHNICIAN_PASSWORD_RULE =
  "Password must be at least 6 characters with 1 uppercase and 1 lowercase letter.";
