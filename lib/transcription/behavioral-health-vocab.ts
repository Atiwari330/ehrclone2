/**
 * Behavioral Health Vocabulary for AssemblyAI
 * 
 * This vocabulary list helps improve transcription accuracy for behavioral health
 * terms, medications, assessment tools, and common clinical terminology.
 */

// Common behavioral health conditions and disorders
const CONDITIONS = [
  // Mood disorders
  'major depressive disorder',
  'bipolar disorder',
  'bipolar I',
  'bipolar II',
  'cyclothymia',
  'dysthymia',
  'persistent depressive disorder',
  'seasonal affective disorder',
  
  // Anxiety disorders
  'generalized anxiety disorder',
  'panic disorder',
  'social anxiety disorder',
  'specific phobia',
  'agoraphobia',
  'separation anxiety disorder',
  
  // Trauma and stress-related
  'post-traumatic stress disorder',
  'PTSD',
  'acute stress disorder',
  'adjustment disorder',
  'complex PTSD',
  
  // Psychotic disorders
  'schizophrenia',
  'schizoaffective disorder',
  'delusional disorder',
  'brief psychotic disorder',
  
  // Neurodevelopmental
  'attention deficit hyperactivity disorder',
  'ADHD',
  'autism spectrum disorder',
  'ASD',
  
  // Substance use
  'substance use disorder',
  'alcohol use disorder',
  'opioid use disorder',
  'cannabis use disorder',
  'stimulant use disorder',
  
  // Other conditions
  'borderline personality disorder',
  'antisocial personality disorder',
  'obsessive-compulsive disorder',
  'OCD',
  'eating disorder',
  'anorexia nervosa',
  'bulimia nervosa',
  'binge eating disorder',
];

// Common medications in behavioral health
const MEDICATIONS = [
  // Antidepressants - SSRIs
  'sertraline',
  'Zoloft',
  'fluoxetine',
  'Prozac',
  'paroxetine',
  'Paxil',
  'citalopram',
  'Celexa',
  'escitalopram',
  'Lexapro',
  
  // Antidepressants - SNRIs
  'venlafaxine',
  'Effexor',
  'duloxetine',
  'Cymbalta',
  'desvenlafaxine',
  'Pristiq',
  
  // Antidepressants - Other
  'bupropion',
  'Wellbutrin',
  'mirtazapine',
  'Remeron',
  'trazodone',
  'Desyrel',
  
  // Anxiolytics
  'lorazepam',
  'Ativan',
  'alprazolam',
  'Xanax',
  'clonazepam',
  'Klonopin',
  'diazepam',
  'Valium',
  'buspirone',
  'BuSpar',
  
  // Mood stabilizers
  'lithium',
  'Lithobid',
  'valproic acid',
  'Depakote',
  'lamotrigine',
  'Lamictal',
  'carbamazepine',
  'Tegretol',
  
  // Antipsychotics
  'risperidone',
  'Risperdal',
  'quetiapine',
  'Seroquel',
  'olanzapine',
  'Zyprexa',
  'aripiprazole',
  'Abilify',
  'paliperidone',
  'Invega',
  'ziprasidone',
  'Geodon',
  'haloperidol',
  'Haldol',
  
  // ADHD medications
  'methylphenidate',
  'Ritalin',
  'Concerta',
  'amphetamine',
  'Adderall',
  'Vyvanse',
  'lisdexamfetamine',
  'atomoxetine',
  'Strattera',
  
  // Sleep medications
  'zolpidem',
  'Ambien',
  'eszopiclone',
  'Lunesta',
  'melatonin',
  
  // Substance use treatment
  'naltrexone',
  'Vivitrol',
  'buprenorphine',
  'Suboxone',
  'Subutex',
  'methadone',
  'disulfiram',
  'Antabuse',
  'acamprosate',
  'Campral',
];

// Assessment tools and scales
const ASSESSMENT_TOOLS = [
  // Depression
  'PHQ-9',
  'Patient Health Questionnaire 9',
  'PHQ-2',
  'Beck Depression Inventory',
  'BDI',
  'Hamilton Depression Rating Scale',
  'HAM-D',
  
  // Anxiety
  'GAD-7',
  'Generalized Anxiety Disorder 7',
  'GAD-2',
  'Beck Anxiety Inventory',
  'BAI',
  'Hamilton Anxiety Rating Scale',
  'HAM-A',
  
  // Trauma
  'PCL-5',
  'PTSD Checklist for DSM-5',
  'ACE score',
  'Adverse Childhood Experiences',
  
  // Substance use
  'CAGE questionnaire',
  'AUDIT',
  'Alcohol Use Disorders Identification Test',
  'DAST',
  'Drug Abuse Screening Test',
  
  // General
  'Columbia Suicide Severity Rating Scale',
  'C-SSRS',
  'Mental Status Examination',
  'MSE',
  'Global Assessment of Functioning',
  'GAF',
  'Clinical Global Impression',
  'CGI',
  
  // Cognitive
  'Mini Mental State Examination',
  'MMSE',
  'Montreal Cognitive Assessment',
  'MoCA',
];

// Therapy and treatment modalities
const THERAPY_TERMS = [
  // Therapy types
  'cognitive behavioral therapy',
  'CBT',
  'dialectical behavior therapy',
  'DBT',
  'acceptance and commitment therapy',
  'ACT',
  'eye movement desensitization and reprocessing',
  'EMDR',
  'interpersonal therapy',
  'IPT',
  'psychodynamic therapy',
  'solution-focused brief therapy',
  'motivational interviewing',
  'MI',
  
  // DBT specific
  'distress tolerance',
  'emotion regulation',
  'interpersonal effectiveness',
  'mindfulness',
  'TIPP',
  'PLEASE skills',
  'wise mind',
  
  // CBT specific
  'cognitive restructuring',
  'thought challenging',
  'behavioral activation',
  'exposure therapy',
  'systematic desensitization',
];

// Clinical terminology
const CLINICAL_TERMS = [
  // Mental status
  'affect',
  'mood',
  'euthymic',
  'dysthymic',
  'anhedonia',
  'avolition',
  'alogia',
  'psychomotor agitation',
  'psychomotor retardation',
  
  // Symptoms
  'suicidal ideation',
  'homicidal ideation',
  'auditory hallucinations',
  'visual hallucinations',
  'delusions',
  'paranoia',
  'hypervigilance',
  'dissociation',
  'derealization',
  'depersonalization',
  'rumination',
  'catastrophizing',
  
  // Clinical observations
  'insight',
  'judgment',
  'impulse control',
  'reality testing',
  'thought process',
  'thought content',
  'speech patterns',
  'executive functioning',
];

// Combine all vocabularies
export const BEHAVIORAL_HEALTH_VOCABULARY: string[] = [
  ...CONDITIONS,
  ...MEDICATIONS,
  ...ASSESSMENT_TOOLS,
  ...THERAPY_TERMS,
  ...CLINICAL_TERMS,
];

// Export individual categories for specific use cases
export {
  CONDITIONS,
  MEDICATIONS,
  ASSESSMENT_TOOLS,
  THERAPY_TERMS,
  CLINICAL_TERMS,
};

// Function to get vocabulary for AssemblyAI configuration
export function getBehavioralHealthVocabulary(): string[] {
  // AssemblyAI has a limit on word boost array size
  // Return the most important terms if needed
  return BEHAVIORAL_HEALTH_VOCABULARY.slice(0, 1000);
}
