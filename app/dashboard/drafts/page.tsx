'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data for draft notes
const mockDrafts = [
  {
    id: '1',
    patientName: 'John Doe',
    sessionDate: '2024-01-15T09:00:00',
    lastModified: '2024-01-15T10:30:00',
    status: 'pending',
    wordCount: 245,
    complianceStatus: 'compliant',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    sessionDate: '2024-01-15T10:30:00',
    lastModified: '2024-01-15T11:45:00',
    status: 'pending',
    wordCount: 189,
    complianceStatus: 'warning',
  },
  {
    id: '3',
    patientName: 'Robert Johnson',
    sessionDate: '2024-01-15T14:00:00',
    lastModified: '2024-01-15T15:20:00',
    status: 'draft',
    wordCount: 312,
    complianceStatus: 'compliant',
  },
  {
    id: '4',
    patientName: 'Emily Davis',
    sessionDate: '2024-01-15T15:30:00',
    lastModified: '2024-01-15T16:45:00',
    status: 'draft',
    wordCount: 156,
    complianceStatus: 'compliant',
  },
];

export default function DraftsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending'>('all');
  
  const filteredDrafts = mockDrafts.filter(draft => {
    if (filter === 'all') return true;
    return draft.status === filter;
  });
  
  const handleReviewDraft = (draftId: string) => {
    router.push(`/dashboard/drafts/${draftId}`);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
            Ready for Review
          </span>
        );
      default:
        return null;
    }
  };
  
  const getComplianceIcon = (status: string) => {
    if (status === 'warning') {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Drafts</h1>
        <p className="text-muted-foreground">
          Review and finalize your session notes
        </p>
      </div>
      
      {/* Filter buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({mockDrafts.length})
        </Button>
        <Button
          variant={filter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('draft')}
        >
          In Progress ({mockDrafts.filter(d => d.status === 'draft').length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Ready for Review ({mockDrafts.filter(d => d.status === 'pending').length})
        </Button>
      </div>
      
      {/* Drafts list */}
      <div className="grid gap-4">
        {filteredDrafts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No drafts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDrafts.map((draft) => (
            <Card 
              key={draft.id} 
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleReviewDraft(draft.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{draft.patientName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Session: {new Date(draft.sessionDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getComplianceIcon(draft.complianceStatus)}
                    {getStatusBadge(draft.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Modified {new Date(draft.lastModified).toLocaleTimeString()}
                    </span>
                    <span>{draft.wordCount} words</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
