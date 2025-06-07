import { textArtifact } from '@/artifacts/text/client';

export const clinicalNoteArtifact = {
  ...textArtifact,
  kind: 'clinical-note',
  icon: 'FileText', // Or another suitable icon from lucide-react
};
