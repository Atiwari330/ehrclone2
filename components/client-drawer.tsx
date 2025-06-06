'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Phone,
  Mail,
  Home,
  User,
  Calendar,
  CreditCard,
  Heart,
  Clock,
} from 'lucide-react';
import { ClientListItem, formatPhoneNumber, getStatusBadgeColor } from '@/lib/types/client';

interface ClientDrawerProps {
  client: ClientListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDrawer({ client, open, onOpenChange }: ClientDrawerProps) {
  if (!client) return null;

  // Mock visit data - in a real app, this would come from the database
  const recentVisits = [
    { date: new Date(2024, 11, 15), type: 'Follow-up', provider: 'Dr. Smith' },
    { date: new Date(2024, 10, 20), type: 'Annual Check-up', provider: 'Dr. Johnson' },
    { date: new Date(2024, 9, 5), type: 'Sick Visit', provider: 'Dr. Smith' },
  ];

  const fullName = `${client.firstName} ${client.lastName}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Patient Details</SheetTitle>
          <SheetDescription>
            View and manage patient information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Header Section with Patient Photo and Basic Info */}
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {client.age} years old • MRN: {client.mrn}
              </p>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(client.status)}`}>
                {client.status}
              </span>
            </div>
          </div>

          <Separator />

          {/* Contact Information Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
            <div className="space-y-2">
              {client.contactPhone && (
                <a
                  href={`tel:${client.contactPhone}`}
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {formatPhoneNumber(client.contactPhone)}
                </a>
              )}
              {client.contactEmail && (
                <a
                  href={`mailto:${client.contactEmail}`}
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {client.contactEmail}
                </a>
              )}
              {client.address && (
                <div className="flex items-start gap-3 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Insurance Information */}
          {client.insurance && (
            <>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Insurance Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{client.insurance.provider}</p>
                      <p className="text-muted-foreground">Member ID: {client.insurance.memberId}</p>
                      {client.insurance.groupNumber && (
                        <p className="text-muted-foreground">Group: {client.insurance.groupNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Medical Conditions */}
          {client.conditions && client.conditions.length > 0 && (
            <>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Medical Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {client.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Recent Visits */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Recent Visits</h4>
            {recentVisits.length > 0 ? (
              <div className="space-y-3">
                {recentVisits.map((visit, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{visit.type}</span>
                        <span className="text-muted-foreground">
                          {format(visit.date, 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{visit.provider}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent visits</p>
            )}
          </div>

          {/* Next Appointment */}
          {client.nextAppointment && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Next Appointment</h4>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(client.nextAppointment, 'MMMM d, yyyy \'at\' h:mm a')}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
