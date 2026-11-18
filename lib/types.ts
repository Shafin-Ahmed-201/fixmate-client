/** Shared API/domain types mirroring the FixMate server responses. */

export type Role = "customer" | "technician" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  phone?: string;
  area?: string;
  bio?: string;
  createdAt?: string;
}

export type ServiceCategory =
  | "Smartphone"
  | "Laptop & PC"
  | "AC"
  | "Refrigerator"
  | "TV"
  | "Washing Machine"
  | "Electrical";

export type ServiceMode = "Home Visit" | "Shop Drop-off";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Service {
  _id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: string;
}

export interface ServiceListResponse {
  success: boolean;
  services: Service[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface StatusHistoryEntry {
  status: BookingStatus;
  changedAt: string;
}

export interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: ServiceCategory;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount: number;
  paymentStatus: "unpaid" | "paid";
  statusHistory?: StatusHistoryEntry[];
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string | null;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: string;
}

export interface AdminStats {
  users: { total: number; customer: number; technician: number; admin: number };
  services: { total: number; pending: number; approved: number; rejected: number };
  bookings: { total: number; byStatus: Record<BookingStatus, number> };
  payments: { totalPaid: number; revenue: number };
  recentBookings: Booking[];
}
