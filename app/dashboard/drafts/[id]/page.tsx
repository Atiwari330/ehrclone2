'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, ChevronLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data for development
const mockTranscript = [
  { speaker: 'Provider', time: '00:00', text: 'Good morning, how are you feeling today?' },
  { speaker: 'Patient', time: '00:05', text: 'I\'ve been having some headaches for the past week.' },
  { speaker: 'Provider', time: '00:10', text: 'Can you describe the headaches? Where do you feel them?' },
  { speaker: 'Patient', time: '00:15', text: 'They\'re mostly on the right side of my head, and they come and go throughout the day.' },
  { speaker: 'Provider', time: '00:25', text: 'On a scale of 1 to 10, how would you rate the pain?' },
  { speaker: 'Patient', time: '00:30', text: 'Usually around a 6 or 7. Sometimes it gets worse when I\'m stressed.' },
  { speaker: 'Provider', time: '00:38', text: 'Have you noticed any other symptoms with the headaches?' },
  { speaker: 'Patient', time: '00:45', text: 'Sometimes I feel a bit nauseous, and bright lights bother me.' },
  { speaker: 'Provider', time: '00:52', text: 'Those sound like migraine symptoms. Let\'s discuss treatment options.' },
];

const mockDraftNote = {
  chiefComplaint: 'Headaches for the past week',
  historyOfPresentIllness: 'Patient reports experiencing headaches for approximately one week. Pain is localized to the right side of the head, intermittent throughout the day. Pain severity rated 6-7/10, exacerbated by stress.',
  reviewOfSystems: 'Associated symptoms include nausea and photophobia. No fever, vision changes, or neck stiffness reported.',
  assessment: 'Probable migraine headaches based on unilateral location, moderate to severe intensity, and associated symptoms of nausea and photophobia.',
  plan: 'Discussed lifestyle modifications including stress management and regular sleep schedule. Prescribed sumatriptan 50mg as needed for acute episodes. Follow-up in 2 weeks to assess response to treatment.',
};

// Mapping between transcript sections and note fields
const transcriptToNoteMapping: Record<string, keyof typeof mockDraftNote> = {
  'transcript-1': 'chiefComplaint',
  'transcript-2': 'chiefComplaint',
  'transcript-3': 'historyOfPresentIllness',
  'transcript-4': 'historyOfPresentIllness',
  'transcript-5': 'historyOfPresentIllness',
  'transcript-6': 'historyOfPresentIllness',
  'transcript-7': 'reviewOfSystems',
  'transcript-8': 'reviewOfSystems',
  'transcript-9': 'assessment',
};

export default function DraftReviewPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.id as string;
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeNoteField, setActiveNoteField] = useState<keyof typeof mockDraftNote | null>(null);
  const [noteContent, setNoteContent] = useState(mockDraftNote);
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Calculate word count
  const calculateWordCount = () => {
    const text = Object.values(noteContent).join(' ');
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };
  
  const handleNoteChange = (section: keyof typeof noteContent, value: string) => {
    setNoteContent(prev => ({
      ...prev,
      [section]: value
    }));
    setWordCount(calculateWordCount());
  };
  
  const handleTranscriptClick = (transcriptId: string) => {
    setActiveSection(transcriptId);
    // Highlight corresponding note field
    const noteField = transcriptToNoteMapping[transcriptId];
    if (noteField) {
      setActiveNoteField(noteField);
      // Scroll to the note field
      const element = document.getElementById(`note-field-${noteField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  const handleNoteFieldFocus = (field: keyof typeof noteContent) => {
    setActiveNoteField(field);
    // Find and highlight corresponding transcript sections
    const transcriptIds = Object.entries(transcriptToNoteMapping)
      .filter(([_, noteField]) => noteField === field)
      .map(([transcriptId]) => transcriptId);
    
    if (transcriptIds.length > 0) {
      setActiveSection(transcriptIds[0]);
      // Scroll to first matching transcript
      const element = document.getElementById(transcriptIds[0]);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  const validateNote = (): string[] => {
    const errors: string[] = [];
    const minWordCount = 100;
    
    // Check minimum word count
    if (calculateWordCount() < minWordCount) {
      errors.push(`Note must contain at least ${minWordCount} words (current: ${calculateWordCount()})`);
    }
    
    // Check required fields
    if (!noteContent.chiefComplaint.trim()) {
      errors.push('Chief Complaint is required');
    }
    if (!noteContent.historyOfPresentIllness.trim()) {
      errors.push('History of Present Illness is required');
    }
    if (!noteContent.assessment.trim()) {
      errors.push('Assessment is required');
    }
    if (!noteContent.plan.trim()) {
      errors.push('Plan is required');
    }
    
    // Check minimum length for each section
    if (noteContent.historyOfPresentIllness.trim().split(' ').length < 20) {
      errors.push('History of Present Illness should be more detailed (minimum 20 words)');
    }
    
    return errors;
  };
  
  const handleSubmitForReview = async () => {
    // Validate the note
    const errors = validateNote();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors([]);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Actual API call to update note status
      console.log('Submitting note for review:', noteContent);
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/drafts');
      }, 2000);
      
    } catch (error) {
      setValidationErrors(['Failed to submit note. Please try again.']);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/drafts">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Drafts
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Draft Review</h1>
            <p className="text-sm text-muted-foreground">Session from {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {wordCount} words
          </div>
          <Button 
            onClick={handleSubmitForReview} 
            className="gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Submit for Co-Sign
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Please fix the following issues:</p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Success message */}
      {showSuccess && (
        <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Note submitted successfully!</p>
              <p className="text-sm text-green-700 mt-1">Redirecting to drafts list...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Two-pane layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane - Transcript */}
        <div className="w-1/2 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Session Transcript</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockTranscript.map((entry, index) => (
              <div
                key={index}
                id={`transcript-${index}`}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeSection === `transcript-${index}` 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleTranscriptClick(`transcript-${index}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{entry.speaker}</span>
                  <span className="text-xs text-muted-foreground">{entry.time}</span>
                </div>
                <p className="text-sm">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right pane - Note Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Medical Note</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Chief Complaint */}
              <div>
                <label className="text-sm font-medium mb-2 block">Chief Complaint</label>
                <textarea
                  id="note-field-chiefComplaint"
                  className={`w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    activeNoteField === 'chiefComplaint' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  rows={2}
                  value={noteContent.chiefComplaint}
                  onChange={(e) => handleNoteChange('chiefComplaint', e.target.value)}
                  onFocus={() => handleNoteFieldFocus('chiefComplaint')}
                />
              </div>
              
              {/* History of Present Illness */}
              <div>
                <label className="text-sm font-medium mb-2 block">History of Present Illness</label>
                <textarea
                  id="note-field-historyOfPresentIllness"
                  className={`w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    activeNoteField === 'historyOfPresentIllness' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  rows={4}
                  value={noteContent.historyOfPresentIllness}
                  onChange={(e) => handleNoteChange('historyOfPresentIllness', e.target.value)}
                  onFocus={() => handleNoteFieldFocus('historyOfPresentIllness')}
                />
              </div>
              
              {/* Review of Systems */}
              <div>
                <label className="text-sm font-medium mb-2 block">Review of Systems</label>
                <textarea
                  id="note-field-reviewOfSystems"
                  className={`w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    activeNoteField === 'reviewOfSystems' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  rows={3}
                  value={noteContent.reviewOfSystems}
                  onChange={(e) => handleNoteChange('reviewOfSystems', e.target.value)}
                  onFocus={() => handleNoteFieldFocus('reviewOfSystems')}
                />
              </div>
              
              {/* Assessment */}
              <div>
                <label className="text-sm font-medium mb-2 block">Assessment</label>
                <textarea
                  id="note-field-assessment"
                  className={`w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    activeNoteField === 'assessment' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  rows={3}
                  value={noteContent.assessment}
                  onChange={(e) => handleNoteChange('assessment', e.target.value)}
                  onFocus={() => handleNoteFieldFocus('assessment')}
                />
              </div>
              
              {/* Plan */}
              <div>
                <label className="text-sm font-medium mb-2 block">Plan</label>
                <textarea
                  id="note-field-plan"
                  className={`w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    activeNoteField === 'plan' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  rows={4}
                  value={noteContent.plan}
                  onChange={(e) => handleNoteChange('plan', e.target.value)}
                  onFocus={() => handleNoteFieldFocus('plan')}
                />
              </div>
              
              {/* Compliance indicator */}
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Compliance Status</span>
                  {calculateWordCount() >= 100 && 
                   noteContent.chiefComplaint.trim() && 
                   noteContent.historyOfPresentIllness.trim() && 
                   noteContent.assessment.trim() && 
                   noteContent.plan.trim() ? (
                    <span className="text-green-600 font-medium">✓ Meets requirements</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">⚠ Missing required information</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
