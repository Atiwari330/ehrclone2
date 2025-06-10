import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  stream,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind: kind as 'text' | 'code' | 'image' | 'sheet',
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

// Import all new tables for AI Pipeline Infrastructure
import { 
  patient,
  provider,
  session,
  transcript,
  treatmentPlan,
  treatmentGoal,
  diagnosis,
  medication,
  assessment,
  aiPipelineExecution,
  alert,
  billingSuggestion,
  type Patient,
  type Provider,
  type Session,
  type TreatmentPlan,
  type TreatmentGoal,
  type Diagnosis,
  type Medication,
  type Assessment,
  type AIPipelineExecution,
  type Alert,
  type BillingSuggestion
} from './schema';

export async function saveTranscript({
  sessionId,
  entries,
  duration,
  startTime,
  endTime,
  wordCount,
}: {
  sessionId: string;
  entries: any;
  duration: number;
  startTime: Date;
  endTime?: Date;
  wordCount?: number;
}) {
  try {
    const [savedTranscript] = await db
      .insert(transcript)
      .values({
        sessionId,
        entries,
        duration,
        startTime,
        endTime,
        wordCount,
      })
      .returning();

    return savedTranscript;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save transcript',
    );
  }
}

export async function getTranscriptBySessionId({ sessionId }: { sessionId: string }) {
  try {
    const [sessionTranscript] = await db
      .select()
      .from(transcript)
      .where(eq(transcript.sessionId, sessionId))
      .orderBy(desc(transcript.createdAt))
      .limit(1);

    return sessionTranscript;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get transcript by session id',
    );
  }
}

export async function getTranscriptById({ id }: { id: string }) {
  try {
    const [selectedTranscript] = await db
      .select()
      .from(transcript)
      .where(eq(transcript.id, id))
      .limit(1);

    return selectedTranscript;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get transcript by id',
    );
  }
}

// Treatment Plan queries
export async function createTreatmentPlan({
  patientId,
  providerId,
  title,
  description,
  status = 'active',
  startDate,
  endDate,
}: {
  patientId: string;
  providerId: string;
  title: string;
  description?: string;
  status?: string;
  startDate: Date;
  endDate?: Date;
}) {
  try {
    console.log('[DB] Creating treatment plan for patient:', patientId);
    const [plan] = await db
      .insert(treatmentPlan)
      .values({
        patientId,
        providerId,
        title,
        description,
        status,
        startDate,
        endDate,
      })
      .returning();
    
    console.log('[DB] Treatment plan created:', plan.id);
    return plan;
  } catch (error) {
    console.error('[DB] Failed to create treatment plan:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create treatment plan',
    );
  }
}

export async function getTreatmentPlansByPatientId({
  patientId,
  status,
}: {
  patientId: string;
  status?: string;
}) {
  try {
    console.log('[DB] Getting treatment plans for patient:', patientId);
    const query = db
      .select()
      .from(treatmentPlan)
      .where(
        status
          ? and(eq(treatmentPlan.patientId, patientId), eq(treatmentPlan.status, status))
          : eq(treatmentPlan.patientId, patientId)
      )
      .orderBy(desc(treatmentPlan.createdAt));
    
    const plans = await query;
    console.log('[DB] Found treatment plans:', plans.length);
    return plans;
  } catch (error) {
    console.error('[DB] Failed to get treatment plans:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get treatment plans',
    );
  }
}

export async function updateTreatmentPlan({
  id,
  status,
  endDate,
}: {
  id: string;
  status?: string;
  endDate?: Date;
}) {
  try {
    console.log('[DB] Updating treatment plan:', id);
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (endDate) updates.endDate = endDate;
    
    const [updated] = await db
      .update(treatmentPlan)
      .set(updates)
      .where(eq(treatmentPlan.id, id))
      .returning();
    
    console.log('[DB] Treatment plan updated:', updated?.id);
    return updated;
  } catch (error) {
    console.error('[DB] Failed to update treatment plan:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update treatment plan',
    );
  }
}

// Treatment Goal queries
export async function createTreatmentGoal({
  treatmentPlanId,
  goalText,
  targetDate,
  priority = 3,
}: {
  treatmentPlanId: string;
  goalText: string;
  targetDate?: Date;
  priority?: number;
}) {
  try {
    console.log('[DB] Creating treatment goal for plan:', treatmentPlanId);
    const [goal] = await db
      .insert(treatmentGoal)
      .values({
        treatmentPlanId,
        goalText,
        targetDate,
        priority,
      })
      .returning();
    
    console.log('[DB] Treatment goal created:', goal.id);
    return goal;
  } catch (error) {
    console.error('[DB] Failed to create treatment goal:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create treatment goal',
    );
  }
}

export async function getTreatmentGoalsByPlanId({
  treatmentPlanId,
}: {
  treatmentPlanId: string;
}) {
  try {
    console.log('[DB] Getting treatment goals for plan:', treatmentPlanId);
    const goals = await db
      .select()
      .from(treatmentGoal)
      .where(eq(treatmentGoal.treatmentPlanId, treatmentPlanId))
      .orderBy(asc(treatmentGoal.priority), desc(treatmentGoal.createdAt));
    
    console.log('[DB] Found treatment goals:', goals.length);
    return goals;
  } catch (error) {
    console.error('[DB] Failed to get treatment goals:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get treatment goals',
    );
  }
}

export async function updateTreatmentGoal({
  id,
  status,
  progressPercentage,
  achievedAt,
}: {
  id: string;
  status?: string;
  progressPercentage?: number;
  achievedAt?: Date;
}) {
  try {
    console.log('[DB] Updating treatment goal:', id);
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (progressPercentage !== undefined) updates.progressPercentage = progressPercentage;
    if (achievedAt) updates.achievedAt = achievedAt;
    
    const [updated] = await db
      .update(treatmentGoal)
      .set(updates)
      .where(eq(treatmentGoal.id, id))
      .returning();
    
    console.log('[DB] Treatment goal updated:', updated?.id);
    return updated;
  } catch (error) {
    console.error('[DB] Failed to update treatment goal:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update treatment goal',
    );
  }
}

// Diagnosis queries
export async function createDiagnosis({
  patientId,
  providerId,
  sessionId,
  icd10Code,
  description,
  status = 'active',
  onsetDate,
}: {
  patientId: string;
  providerId: string;
  sessionId?: string;
  icd10Code: string;
  description: string;
  status?: string;
  onsetDate?: Date;
}) {
  try {
    console.log('[DB] Creating diagnosis for patient:', patientId, 'ICD-10:', icd10Code);
    const [diag] = await db
      .insert(diagnosis)
      .values({
        patientId,
        providerId,
        sessionId,
        icd10Code,
        description,
        status,
        onsetDate,
      })
      .returning();
    
    console.log('[DB] Diagnosis created:', diag.id);
    return diag;
  } catch (error) {
    console.error('[DB] Failed to create diagnosis:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create diagnosis',
    );
  }
}

export async function getDiagnosesByPatientId({
  patientId,
  status,
}: {
  patientId: string;
  status?: string;
}) {
  try {
    console.log('[DB] Getting diagnoses for patient:', patientId);
    const query = db
      .select()
      .from(diagnosis)
      .where(
        status
          ? and(eq(diagnosis.patientId, patientId), eq(diagnosis.status, status))
          : eq(diagnosis.patientId, patientId)
      )
      .orderBy(desc(diagnosis.createdAt));
    
    const diagnoses = await query;
    console.log('[DB] Found diagnoses:', diagnoses.length);
    return diagnoses;
  } catch (error) {
    console.error('[DB] Failed to get diagnoses:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get diagnoses',
    );
  }
}

export async function updateDiagnosis({
  id,
  status,
  resolvedDate,
}: {
  id: string;
  status?: string;
  resolvedDate?: Date;
}) {
  try {
    console.log('[DB] Updating diagnosis:', id);
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (resolvedDate) updates.resolvedDate = resolvedDate;
    
    const [updated] = await db
      .update(diagnosis)
      .set(updates)
      .where(eq(diagnosis.id, id))
      .returning();
    
    console.log('[DB] Diagnosis updated:', updated?.id);
    return updated;
  } catch (error) {
    console.error('[DB] Failed to update diagnosis:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update diagnosis',
    );
  }
}

// Medication queries
export async function createMedication({
  patientId,
  providerId,
  medicationName,
  dosage,
  frequency,
  route = 'oral',
  startDate,
  endDate,
  notes,
}: {
  patientId: string;
  providerId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}) {
  try {
    console.log('[DB] Creating medication for patient:', patientId, 'Medication:', medicationName);
    const [med] = await db
      .insert(medication)
      .values({
        patientId,
        providerId,
        medicationName,
        dosage,
        frequency,
        route,
        startDate,
        endDate,
        notes,
      })
      .returning();
    
    console.log('[DB] Medication created:', med.id);
    return med;
  } catch (error) {
    console.error('[DB] Failed to create medication:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create medication',
    );
  }
}

export async function getMedicationsByPatientId({
  patientId,
  status,
}: {
  patientId: string;
  status?: string;
}) {
  try {
    console.log('[DB] Getting medications for patient:', patientId);
    const query = db
      .select()
      .from(medication)
      .where(
        status
          ? and(eq(medication.patientId, patientId), eq(medication.status, status))
          : eq(medication.patientId, patientId)
      )
      .orderBy(desc(medication.startDate));
    
    const medications = await query;
    console.log('[DB] Found medications:', medications.length);
    return medications;
  } catch (error) {
    console.error('[DB] Failed to get medications:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get medications',
    );
  }
}

export async function updateMedication({
  id,
  status,
  endDate,
  notes,
}: {
  id: string;
  status?: string;
  endDate?: Date;
  notes?: string;
}) {
  try {
    console.log('[DB] Updating medication:', id);
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (endDate) updates.endDate = endDate;
    if (notes) updates.notes = notes;
    
    const [updated] = await db
      .update(medication)
      .set(updates)
      .where(eq(medication.id, id))
      .returning();
    
    console.log('[DB] Medication updated:', updated?.id);
    return updated;
  } catch (error) {
    console.error('[DB] Failed to update medication:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update medication',
    );
  }
}

// Assessment queries
export async function createAssessment({
  patientId,
  providerId,
  sessionId,
  assessmentType,
  totalScore,
  severity,
  responses,
  administeredAt,
}: {
  patientId: string;
  providerId: string;
  sessionId?: string;
  assessmentType: string;
  totalScore: number;
  severity?: string;
  responses: any;
  administeredAt: Date;
}) {
  try {
    console.log('[DB] Creating assessment for patient:', patientId, 'Type:', assessmentType);
    const [assess] = await db
      .insert(assessment)
      .values({
        patientId,
        providerId,
        sessionId,
        assessmentType,
        totalScore,
        severity,
        responses,
        administeredAt,
      })
      .returning();
    
    console.log('[DB] Assessment created:', assess.id, 'Score:', totalScore);
    return assess;
  } catch (error) {
    console.error('[DB] Failed to create assessment:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create assessment',
    );
  }
}

export async function getAssessmentsByPatientId({
  patientId,
  assessmentType,
  limit = 10,
}: {
  patientId: string;
  assessmentType?: string;
  limit?: number;
}) {
  try {
    console.log('[DB] Getting assessments for patient:', patientId, 'Type:', assessmentType);
    const query = db
      .select()
      .from(assessment)
      .where(
        assessmentType
          ? and(eq(assessment.patientId, patientId), eq(assessment.assessmentType, assessmentType))
          : eq(assessment.patientId, patientId)
      )
      .orderBy(desc(assessment.administeredAt))
      .limit(limit);
    
    const assessments = await query;
    console.log('[DB] Found assessments:', assessments.length);
    return assessments;
  } catch (error) {
    console.error('[DB] Failed to get assessments:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get assessments',
    );
  }
}

// AI Pipeline Execution queries
export async function createAIPipelineExecution({
  pipelineType,
  sessionId,
  patientId,
  userId,
  inputData,
  startTime,
}: {
  pipelineType: string;
  sessionId?: string;
  patientId?: string;
  userId: string;
  inputData: any;
  startTime: Date;
}) {
  try {
    console.log('[AI-Pipeline] Creating execution for pipeline:', pipelineType);
    const [execution] = await db
      .insert(aiPipelineExecution)
      .values({
        pipelineType,
        sessionId,
        patientId,
        userId,
        inputData,
        outputData: {},
        startTime,
        status: 'started',
      })
      .returning();
    
    console.log('[AI-Pipeline] Execution created:', execution.id);
    return execution;
  } catch (error) {
    console.error('[AI-Pipeline] Failed to create execution:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create AI pipeline execution',
    );
  }
}

export async function updateAIPipelineExecution({
  id,
  outputData,
  endTime,
  durationMs,
  inputTokens,
  outputTokens,
  totalTokens,
  modelUsed,
  status,
  errorMessage,
  cacheHit,
  cacheKey,
}: {
  id: string;
  outputData?: any;
  endTime?: Date;
  durationMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  modelUsed?: string;
  status?: string;
  errorMessage?: string;
  cacheHit?: boolean;
  cacheKey?: string;
}) {
  try {
    console.log('[AI-Pipeline] Updating execution:', id, 'Status:', status);
    const updates: any = {};
    if (outputData !== undefined) updates.outputData = outputData;
    if (endTime) updates.endTime = endTime;
    if (durationMs !== undefined) updates.durationMs = durationMs;
    if (inputTokens !== undefined) updates.inputTokens = inputTokens;
    if (outputTokens !== undefined) updates.outputTokens = outputTokens;
    if (totalTokens !== undefined) updates.totalTokens = totalTokens;
    if (modelUsed) updates.modelUsed = modelUsed;
    if (status) updates.status = status;
    if (errorMessage) updates.errorMessage = errorMessage;
    if (cacheHit !== undefined) updates.cacheHit = cacheHit;
    if (cacheKey) updates.cacheKey = cacheKey;
    
    const [updated] = await db
      .update(aiPipelineExecution)
      .set(updates)
      .where(eq(aiPipelineExecution.id, id))
      .returning();
    
    console.log('[AI-Pipeline] Execution updated:', updated?.id, 'Duration:', durationMs, 'ms');
    return updated;
  } catch (error) {
    console.error('[AI-Pipeline] Failed to update execution:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update AI pipeline execution',
    );
  }
}

// Alert queries
export async function createAlert({
  patientId,
  providerId,
  sessionId,
  pipelineExecutionId,
  alertType,
  severity,
  riskScore,
  alertTitle,
  alertDescription,
  recommendedActions,
}: {
  patientId: string;
  providerId: string;
  sessionId?: string;
  pipelineExecutionId: string;
  alertType: string;
  severity: string;
  riskScore?: number;
  alertTitle: string;
  alertDescription: string;
  recommendedActions?: any;
}) {
  try {
    console.log('[Alert] Creating alert for patient:', patientId, 'Type:', alertType, 'Severity:', severity);
    const [newAlert] = await db
      .insert(alert)
      .values({
        patientId,
        providerId,
        sessionId,
        pipelineExecutionId,
        alertType,
        severity,
        riskScore,
        alertTitle,
        alertDescription,
        recommendedActions,
      })
      .returning();
    
    console.log('[Alert] Alert created:', newAlert.id);
    return newAlert;
  } catch (error) {
    console.error('[Alert] Failed to create alert:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create alert',
    );
  }
}

export async function getAlertsByPatientId({
  patientId,
  status,
  severity,
}: {
  patientId: string;
  status?: string;
  severity?: string;
}) {
  try {
    console.log('[Alert] Getting alerts for patient:', patientId);
    const conditions = [eq(alert.patientId, patientId)];
    if (status) conditions.push(eq(alert.status, status));
    if (severity) conditions.push(eq(alert.severity, severity));
    
    const alerts = await db
      .select()
      .from(alert)
      .where(and(...conditions))
      .orderBy(desc(alert.createdAt));
    
    console.log('[Alert] Found alerts:', alerts.length);
    return alerts;
  } catch (error) {
    console.error('[Alert] Failed to get alerts:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get alerts',
    );
  }
}

export async function updateAlert({
  id,
  status,
  acknowledgedBy,
  acknowledgedAt,
}: {
  id: string;
  status?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}) {
  try {
    console.log('[Alert] Updating alert:', id, 'Status:', status);
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (acknowledgedBy) updates.acknowledgedBy = acknowledgedBy;
    if (acknowledgedAt) updates.acknowledgedAt = acknowledgedAt;
    
    const [updated] = await db
      .update(alert)
      .set(updates)
      .where(eq(alert.id, id))
      .returning();
    
    console.log('[Alert] Alert updated:', updated?.id);
    return updated;
  } catch (error) {
    console.error('[Alert] Failed to update alert:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update alert',
    );
  }
}

// Billing Suggestion queries
export async function createBillingSuggestion({
  sessionId,
  pipelineExecutionId,
  cptCodes,
  icd10Codes,
  modifiers,
  documentationComplete,
  missingElements,
}: {
  sessionId: string;
  pipelineExecutionId: string;
  cptCodes: any;
  icd10Codes: any;
  modifiers?: any;
  documentationComplete?: boolean;
  missingElements?: any;
}) {
  try {
    console.log('[Billing] Creating billing suggestion for session:', sessionId);
    const [suggestion] = await db
      .insert(billingSuggestion)
      .values({
        sessionId,
        pipelineExecutionId,
        cptCodes,
        icd10Codes,
        modifiers,
        documentationComplete: documentationComplete ?? true,
        missingElements,
      })
      .returning();
    
    console.log('[Billing] Billing suggestion created:', suggestion.id);
    return suggestion;
  } catch (error) {
    console.error('[Billing] Failed to create billing suggestion:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create billing suggestion',
    );
  }
}

export async function getBillingSuggestionBySessionId({
  sessionId,
}: {
  sessionId: string;
}) {
  try {
    console.log('[Billing] Getting billing suggestion for session:', sessionId);
    const [suggestion] = await db
      .select()
      .from(billingSuggestion)
      .where(eq(billingSuggestion.sessionId, sessionId))
      .orderBy(desc(billingSuggestion.createdAt))
      .limit(1);
    
    console.log('[Billing] Found billing suggestion:', suggestion?.id);
    return suggestion;
  } catch (error) {
    console.error('[Billing] Failed to get billing suggestion:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get billing suggestion',
    );
  }
}

export async function updateBillingSuggestion({
  id,
  status,
  reviewedBy,
  reviewedAt,
}: {
  id: string;
  status?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}) {
  try {
    console.log('[Billing] Updating billing suggestion:', id, 'Status:', status);
    const updates: any = {};
    if (status) updates.status = status;
    if (reviewedBy) updates.reviewedBy = reviewedBy;
    if (reviewedAt) updates.reviewedAt = reviewedAt;
    
    const [updated] = await db
      .update(billingSuggestion)
      .set(updates)
      .where(eq(billingSuggestion.id, id))
      .returning();
    
    console.log('[Billing] Billing suggestion updated:', updated?.id);
    return updated;
  } catch (error) {
    console.error('[Billing] Failed to update billing suggestion:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update billing suggestion',
    );
  }
}

// Patient queries
export async function getPatientById({ id }: { id: string }) {
  try {
    console.log('[DB] Getting patient by id:', id);
    const [selectedPatient] = await db
      .select()
      .from(patient)
      .where(eq(patient.id, id))
      .limit(1);
    
    if (!selectedPatient) {
      console.log('[DB] Patient not found:', id);
    }
    return selectedPatient;
  } catch (error) {
    console.error('[DB] Failed to get patient by id:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get patient by id',
    );
  }
}

// Provider queries  
export async function getProviderById({ id }: { id: string }) {
  try {
    console.log('[DB] Getting provider by id:', id);
    const [selectedProvider] = await db
      .select()
      .from(provider)
      .where(eq(provider.id, id))
      .limit(1);
    
    if (!selectedProvider) {
      console.log('[DB] Provider not found:', id);
    }
    return selectedProvider;
  } catch (error) {
    console.error('[DB] Failed to get provider by id:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get provider by id',
    );
  }
}

// Session queries
export async function getSessionsByPatientId({
  patientId,
  limit = 10,
  status,
}: {
  patientId: string;
  limit?: number;
  status?: string;
}) {
  try {
    console.log('[DB] Getting sessions for patient:', patientId, 'Limit:', limit);
    const query = db
      .select()
      .from(session)
      .where(
        status
          ? and(eq(session.patientId, patientId), eq(session.sessionStatus, status))
          : eq(session.patientId, patientId)
      )
      .orderBy(desc(session.scheduledAt))
      .limit(limit);
    
    const sessions = await query;
    console.log('[DB] Found sessions:', sessions.length);
    return sessions;
  } catch (error) {
    console.error('[DB] Failed to get sessions:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get sessions by patient id',
    );
  }
}

// Safety Alert Storage - Story 7.6 Implementation
export async function createSafetyAlert({
  alertId,
  sessionId,
  patientId,
  providerId,
  pipelineExecutionId,
  severity,
  type,
  description,
  suggestedActions,
  riskScore,
}: {
  alertId: string;
  sessionId?: string;
  patientId: string;
  providerId: string;
  pipelineExecutionId: string;
  severity: string;
  type: string;
  description: string;
  suggestedActions?: any[];
  riskScore?: number;
}) {
  try {
    console.log('[SafetyAlert] Creating safety alert for patient:', patientId, 'Type:', type, 'Severity:', severity);
    
    const newAlert = await createAlert({
      patientId,
      providerId,
      sessionId,
      pipelineExecutionId,
      alertType: type,
      severity,
      riskScore,
      alertTitle: `Safety Risk Detected: ${type}`,
      alertDescription: description,
      recommendedActions: suggestedActions || [],
    });
    
    console.log('[SafetyAlert] Safety alert created successfully:', newAlert.id, 'AI Alert ID:', alertId);
    return newAlert;
  } catch (error) {
    console.error('[SafetyAlert] Failed to create safety alert:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create safety alert',
    );
  }
}

export async function getSafetyAlertsByPatient({
  patientId,
  severity,
}: {
  patientId: string;
  severity?: 'high' | 'critical';
}) {
  try {
    console.log('[SafetyAlert] Getting safety alerts for patient:', patientId, 'Severity filter:', severity);
    
    const alerts = await getAlertsByPatientId({
      patientId,
      severity,
    });
    
    // Filter for safety-related alert types
    const safetyAlerts = alerts.filter(alert => 
      alert.alertType.includes('risk') || 
      alert.alertType.includes('safety') ||
      alert.alertType.includes('suicide') ||
      alert.alertType.includes('violence') ||
      alert.alertType.includes('substance')
    );
    
    console.log('[SafetyAlert] Found safety alerts:', safetyAlerts.length);
    return safetyAlerts;
  } catch (error) {
    console.error('[SafetyAlert] Failed to get safety alerts:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get safety alerts',
    );
  }
}

export async function acknowledgeSafetyAlert({
  alertId,
  acknowledgedBy,
}: {
  alertId: string;
  acknowledgedBy: string;
}) {
  try {
    console.log('[SafetyAlert] Acknowledging safety alert:', alertId, 'By user:', acknowledgedBy);
    
    const updatedAlert = await updateAlert({
      id: alertId,
      status: 'acknowledged',
      acknowledgedBy,
      acknowledgedAt: new Date(),
    });
    
    console.log('[SafetyAlert] Safety alert acknowledged successfully:', updatedAlert?.id);
    return updatedAlert;
  } catch (error) {
    console.error('[SafetyAlert] Failed to acknowledge safety alert:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to acknowledge safety alert',
    );
  }
}

export async function getSessionById({ id }: { id: string }) {
  try {
    console.log('[DB] Getting session by id:', id);
    const [selectedSession] = await db
      .select()
      .from(session)
      .where(eq(session.id, id))
      .limit(1);
    
    if (!selectedSession) {
      console.log('[DB] Session not found:', id);
    }
    return selectedSession;
  } catch (error) {
    console.error('[DB] Failed to get session by id:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get session by id',
    );
  }
}
