// Client-related type definitions for the EHR system

import type { Patient } from '@/lib/db/schema';

export type ClientStatus = 'active' | 'inactive' | 'new';

export interface InsuranceInfo {
  provider: string;
  memberId: string;
  groupNumber?: string;
  coverageType?: string;
}

export interface ClientVisit {
  id: string;
  date: Date;
  type: string;
  provider: string;
  notes?: string;
}

// Extended client type for list views
export interface ClientListItem extends Patient {
  status: ClientStatus;
  lastVisit?: Date;
  nextAppointment?: Date;
  insurance?: InsuranceInfo;
  conditions?: string[];
  mrn: string; // Medical Record Number
  age: number; // Calculated from dateOfBirth
}

// Type for client detail view
export interface ClientDetail extends ClientListItem {
  visits: ClientVisit[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryProvider?: {
    id: string;
    name: string;
    specialty: string;
  };
}

// Helper type for filtering
export interface ClientFilters {
  search: string;
  status: ClientStatus | 'all';
  hasUpcomingAppointment?: boolean;
  provider?: string;
}

// Helper functions for client data
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

export function getStatusColor(status: ClientStatus): string {
  switch (status) {
    case 'active':
      return 'text-green-600';
    case 'new':
      return 'text-blue-600';
    case 'inactive':
      return 'text-gray-400';
    default:
      return 'text-gray-600';
  }
}

export function getStatusBadgeColor(status: ClientStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
