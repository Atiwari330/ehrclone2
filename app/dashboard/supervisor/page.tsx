'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, User, AlertCircle, Eye, Check, X } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DiffView } from '@/components/diffview';

// Mock data for supervisor review queue
const mockReviewQueue = {
  waiting: [
    {
      id: '1',
      clinicianName: 'Dr. Sarah Johnson',
      patientName: 'John Doe',
      sessionDate: '2024-01-15T09:00:00',
      submittedAt: '2024-01-15T10:30:00',
      priority: 'normal',
      wordCount: 245,
    },
    {
      id: '2',
      clinicianName: 'Dr. Michael Chen',
      patientName: 'Jane Smith',
      sessionDate: '2024-01-15T10:30:00',
      submittedAt: '2024-01-15T11:45:00',
      priority: 'high',
      wordCount: 189,
    },
  ],
  reviewing: [
    {
      id: '3',
      clinicianName: 'Dr. Emily Davis',
      patientName: 'Robert Johnson',
      sessionDate: '2024-01-15T14:00:00',
      submittedAt: '2024-01-15T15:20:00',
      priority: 'normal',
      wordCount: 312,
    },
  ],
  signed: [
    {
      id: '4',
      clinicianName: 'Dr. James Wilson',
      patientName: 'Emily Davis',
      sessionDate: '2024-01-15T08:00:00',
      submittedAt: '2024-01-15T09:15:00',
      signedAt: '2024-01-15T09:45:00',
      priority: 'normal',
      wordCount: 156,
    },
    {
      id: '5',
      clinicianName: 'Dr. Sarah Johnson',
      patientName: 'Michael Brown',
      sessionDate: '2024-01-14T16:00:00',
      submittedAt: '2024-01-14T17:30:00',
      signedAt: '2024-01-15T08:00:00',
      priority: 'normal',
      wordCount: 278,
    },
  ],
};

type ReviewStatus = 'waiting' | 'reviewing' | 'signed';
type ReviewItem = typeof mockReviewQueue.waiting[0] & { signedAt?: string };

// Mock original and edited note content for diff view
const mockNoteDiffs = {
  '1': {
    original: `Chief Complaint: Headaches
History of Present Illness: Patient reports headaches for one week. Pain on right side.
Assessment: Possible migraine
Plan: Prescribed medication`,
    edited: `Chief Complaint: Headaches for the past week
History of Present Illness: Patient reports experiencing headaches for approximately one week. Pain is localized to the right side of the head, intermittent throughout the day. Pain severity rated 6-7/10, exacerbated by stress.
Assessment: Probable migraine headaches based on unilateral location, moderate to severe intensity, and associated symptoms
Plan: Prescribed sumatriptan 50mg as needed for acute episodes. Follow-up in 2 weeks.`,
  },
  '2': {
    original: `Chief Complaint: Anxiety
History: Patient has been experiencing increased anxiety
Assessment: Generalized anxiety disorder
Plan: Continue therapy`,
    edited: `Chief Complaint: Anxiety and panic attacks
History of Present Illness: Patient has been experiencing increased anxiety with occasional panic attacks over the past month. Symptoms worse in social situations. No specific triggers identified.
Assessment: Generalized anxiety disorder with panic features
Plan: Continue cognitive behavioral therapy. Consider SSRI if symptoms persist. Follow-up in 3 weeks.`,
  },
};

export default function SupervisorPage() {
  const [reviewQueue, setReviewQueue] = useState(mockReviewQueue);
  const [draggedItem, setDraggedItem] = useState<ReviewItem | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<ReviewStatus | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  const handleDragStart = (item: ReviewItem, column: ReviewStatus) => {
    setDraggedItem(item);
    setDraggedFromColumn(column);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toColumn: ReviewStatus) => {
    e.preventDefault();
    
    if (!draggedItem || !draggedFromColumn || draggedFromColumn === toColumn) {
      return;
    }

    // Remove from source column
    const sourceItems = [...reviewQueue[draggedFromColumn]];
    const filteredSource = sourceItems.filter(item => item.id !== draggedItem.id);

    // Add to destination column
    const destItems = [...reviewQueue[toColumn]];
    const updatedItem = { ...draggedItem };
    
    // Add timestamp when moving to signed
    if (toColumn === 'signed' && !updatedItem.signedAt) {
      updatedItem.signedAt = new Date().toISOString();
    }
    
    destItems.push(updatedItem);

    // Update state
    setReviewQueue({
      ...reviewQueue,
      [draggedFromColumn]: filteredSource,
      [toColumn]: destItems,
    });

    setDraggedItem(null);
    setDraggedFromColumn(null);
  };

  const handleViewDiff = (item: ReviewItem) => {
    setSelectedReview(item);
    setShowDiffModal(true);
  };

  const handleApprove = (item: ReviewItem) => {
    // Move from reviewing to signed
    const updatedItem = { ...item, signedAt: new Date().toISOString() };
    setReviewQueue({
      ...reviewQueue,
      reviewing: reviewQueue.reviewing.filter(i => i.id !== item.id),
      signed: [...reviewQueue.signed, updatedItem],
    });
    setShowDiffModal(false);
  };

  const handleReject = (item: ReviewItem) => {
    // Move back to waiting
    setReviewQueue({
      ...reviewQueue,
      reviewing: reviewQueue.reviewing.filter(i => i.id !== item.id),
      waiting: [...reviewQueue.waiting, item],
    });
    setShowDiffModal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'normal':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  const columns: { 
    key: ReviewStatus; 
    title: string; 
    count: number;
    color: string;
  }[] = [
    { 
      key: 'waiting', 
      title: 'Waiting', 
      count: reviewQueue.waiting.length,
      color: 'border-yellow-500'
    },
    { 
      key: 'reviewing', 
      title: 'Reviewing', 
      count: reviewQueue.reviewing.length,
      color: 'border-blue-500'
    },
    { 
      key: 'signed', 
      title: 'Signed', 
      count: reviewQueue.signed.length,
      color: 'border-green-500'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supervisor Board</h1>
        <p className="text-muted-foreground">
          Review and approve clinical documentation
        </p>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reviewQueue.waiting.length + reviewQueue.reviewing.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {reviewQueue.waiting.filter(item => item.priority === 'high').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Signed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{reviewQueue.signed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Review Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">24 min</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Kanban board */}
      <div className="grid grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.key}
            className={`border-t-4 ${column.color} bg-muted/30 rounded-lg p-4`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{column.title}</h2>
              <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded-full">
                {column.count}
              </span>
            </div>
            
            <div className="space-y-3">
              {reviewQueue[column.key].map((item) => (
                <Card
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item, column.key)}
                  className="cursor-move hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.clinicianName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.patientName}
                        </p>
                      </div>
                      {item.priority === 'high' && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(item.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {item.wordCount} words
                      </span>
                    </div>
                    {column.key === 'reviewing' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => handleViewDiff(item)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Review Changes
                      </Button>
                    )}
                    {column.key === 'waiting' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => {
                          // Move to reviewing
                          const newItem = { ...item };
                          setReviewQueue({
                            ...reviewQueue,
                            waiting: reviewQueue.waiting.filter(i => i.id !== item.id),
                            reviewing: [...reviewQueue.reviewing, newItem],
                          });
                        }}
                      >
                        Start Review
                      </Button>
                    )}
                    {column.key === 'signed' && 'signedAt' in item && item.signedAt && (
                      <p className="text-xs text-green-600 mt-2">
                        Signed {getTimeAgo(item.signedAt)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {reviewQueue[column.key].length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Diff View Modal */}
      <Sheet open={showDiffModal} onOpenChange={setShowDiffModal}>
        <SheetContent className="sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle>Review Note Changes</SheetTitle>
            <SheetDescription>
              {selectedReview && (
                <span>
                  {selectedReview.clinicianName} - {selectedReview.patientName}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>
          
          {selectedReview && (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-3">Document Changes</h3>
                <div className="prose prose-sm max-w-none">
                  <DiffView
                    oldContent={mockNoteDiffs[selectedReview.id as keyof typeof mockNoteDiffs]?.original || ''}
                    newContent={mockNoteDiffs[selectedReview.id as keyof typeof mockNoteDiffs]?.edited || ''}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <p>Submitted: {getTimeAgo(selectedReview.submittedAt)}</p>
                  <p>Word count: {selectedReview.wordCount}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedReview)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Request Changes
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedReview)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve & Sign
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
