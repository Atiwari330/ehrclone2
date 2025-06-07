'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ParsedSoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

function parseSoapNote(content: string): ParsedSoapNote {
  // Initialize sections
  const sections: ParsedSoapNote = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  };

  // Split content into lines
  const lines = content.split('\n');
  let currentSection = '';

  for (const line of lines) {
    // Check for section headers
    if (line.includes('### Subjective') || line.includes('## Subjective')) {
      currentSection = 'subjective';
      continue;
    } else if (line.includes('### Objective') || line.includes('## Objective')) {
      currentSection = 'objective';
      continue;
    } else if (line.includes('### Assessment') || line.includes('## Assessment')) {
      currentSection = 'assessment';
      continue;
    } else if (line.includes('### Plan') || line.includes('## Plan')) {
      currentSection = 'plan';
      continue;
    }

    // Add content to current section
    if (currentSection && line.trim()) {
      sections[currentSection as keyof ParsedSoapNote] += line + '\n';
    }
  }

  // Trim whitespace from all sections
  Object.keys(sections).forEach(key => {
    sections[key as keyof ParsedSoapNote] = sections[key as keyof ParsedSoapNote].trim();
  });

  return sections;
}

export default function DraftReviewPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<any>(null);
  const [parsedNote, setParsedNote] = useState<ParsedSoapNote | null>(null);
  const [noteContent, setNoteContent] = useState<ParsedSoapNote>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Fetch the document
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/documents/${draftId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch document');
        }
        
        const data = await response.json();
        setDocument(data.document);
        
        // Parse the SOAP note from the document content
        const parsed = parseSoapNote(data.document.content);
        setParsedNote(parsed);
        setNoteContent(parsed);
        
        // Calculate initial word count
        const text = Object.values(parsed).join(' ');
        setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
        
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocument();
  }, [draftId]);
  
  // Calculate word count
  const calculateWordCount = () => {
    const text = Object.values(noteContent).join(' ');
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };
  
  const handleNoteChange = (section: keyof ParsedSoapNote, value: string) => {
    setNoteContent(prev => ({
      ...prev,
      [section]: value
    }));
    setWordCount(calculateWordCount());
  };
  
  const validateNote = (): string[] => {
    const errors: string[] = [];
    const minWordCount = 100;
    
    // Check minimum word count
    if (calculateWordCount() < minWordCount) {
      errors.push(`Note must contain at least ${minWordCount} words (current: ${calculateWordCount()})`);
    }
    
    // Check required fields
    if (!noteContent.subjective.trim()) {
      errors.push('Subjective section is required');
    }
    if (!noteContent.objective.trim()) {
      errors.push('Objective section is required');
    }
    if (!noteContent.assessment.trim()) {
      errors.push('Assessment is required');
    }
    if (!noteContent.plan.trim()) {
      errors.push('Plan is required');
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
      // TODO: Update document in database with edited content
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error || !document) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>{error || 'Document not found'}</p>
          </div>
          <Link href="/dashboard/drafts">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Drafts
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
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
            <h1 className="text-xl font-semibold">{document.title || 'Clinical Note'}</h1>
            <p className="text-sm text-muted-foreground">
              Created on {new Date(document.createdAt).toLocaleDateString()} at {new Date(document.createdAt).toLocaleTimeString()}
            </p>
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
      
      {/* Note editor */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Subjective */}
          <div>
            <label className="text-sm font-medium mb-2 block">Subjective</label>
            <p className="text-xs text-muted-foreground mb-2">
              Document the patient's chief complaint and history of present illness
            </p>
            <textarea
              className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={6}
              value={noteContent.subjective}
              onChange={(e) => handleNoteChange('subjective', e.target.value)}
              placeholder="Patient's self-reported symptoms, feelings, and concerns..."
            />
          </div>
          
          {/* Objective */}
          <div>
            <label className="text-sm font-medium mb-2 block">Objective</label>
            <p className="text-xs text-muted-foreground mb-2">
              Provider's observations of the patient during the session
            </p>
            <textarea
              className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              value={noteContent.objective}
              onChange={(e) => handleNoteChange('objective', e.target.value)}
              placeholder="Mental status exam, observed behaviors, appearance..."
            />
          </div>
          
          {/* Assessment */}
          <div>
            <label className="text-sm font-medium mb-2 block">Assessment</label>
            <p className="text-xs text-muted-foreground mb-2">
              Clinical assessment and diagnoses
            </p>
            <textarea
              className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              value={noteContent.assessment}
              onChange={(e) => handleNoteChange('assessment', e.target.value)}
              placeholder="Summary of key themes, clinical status, diagnoses..."
            />
          </div>
          
          {/* Plan */}
          <div>
            <label className="text-sm font-medium mb-2 block">Plan</label>
            <p className="text-xs text-muted-foreground mb-2">
              Treatment plan and next steps
            </p>
            <textarea
              className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={5}
              value={noteContent.plan}
              onChange={(e) => handleNoteChange('plan', e.target.value)}
              placeholder="Medications, interventions, referrals, follow-up schedule..."
            />
          </div>
          
          {/* Compliance indicator */}
          <div className="border-t pt-4 mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Compliance Status</span>
              {calculateWordCount() >= 100 && 
               noteContent.subjective.trim() && 
               noteContent.objective.trim() && 
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
  );
}
