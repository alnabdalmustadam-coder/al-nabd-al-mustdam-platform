/**
 * xAPI (Experience API) Integration for NELC Accreditation
 *
 * Implements xAPI 1.0.3 specification for tracking learning experiences.
 * Used to send statements to the internal LRS (Supabase-backed) for
 * NELC (National eLearning Center) accreditation compliance.
 *
 * Reference: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md
 */

import crypto from "crypto";

// ─── xAPI Types ──────────────────────────────────────────────────────────────

/** xAPI Actor - Identifies the learner */
export interface XAPIActor {
  objectType: "Agent";
  name: string;
  mbox: string; // Format: "mailto:email@example.com"
  account?: {
    homePage: string;
    name: string; // National ID
  };
}

/** xAPI Verb - Describes the action */
export interface XAPIVerb {
  id: string;
  display: {
    "en-US": string;
    "ar-SA"?: string;
  };
}

/** xAPI Object (Activity) - The thing being acted upon */
export interface XAPIObject {
  objectType: "Activity";
  id: string; // Unique activity IRI
  definition: {
    type: string;
    name: {
      "en-US": string;
      "ar-SA"?: string;
    };
    description?: {
      "en-US": string;
      "ar-SA"?: string;
    };
    extensions?: Record<string, any>;
  };
}

/** xAPI Result - Outcome of the action */
export interface XAPIResult {
  score?: {
    scaled?: number; // 0.0 to 1.0
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  duration?: string; // ISO 8601 duration (e.g., "PT1H30M")
  extensions?: Record<string, any>;
}

/** xAPI Context - Additional context */
export interface XAPIContext {
  registration?: string; // UUID for the enrollment session
  instructor?: XAPIActor;
  platform?: string;
  language?: string;
  extensions?: Record<string, any>;
}

/** xAPI Statement - The complete statement */
export interface XAPIStatement {
  id: string;
  actor: XAPIActor;
  verb: XAPIVerb;
  object: XAPIObject;
  result?: XAPIResult;
  context?: XAPIContext;
  timestamp: string;
  stored?: string;
  authority?: XAPIActor;
  version: string;
}

// ─── Standard xAPI Verbs (ADL Vocabulary) ────────────────────────────────────

export const XAPI_VERBS = {
  /** المتدرب سجّل في الدورة */
  registered: {
    id: "http://adlnet.gov/expapi/verbs/registered",
    display: { "en-US": "registered", "ar-SA": "سجّل" },
  },
  /** المتدرب بدأ/فتح الدورة */
  launched: {
    id: "http://adlnet.gov/expapi/verbs/launched",
    display: { "en-US": "launched", "ar-SA": "بدأ" },
  },
  /** المتدرب بدأ محاولة */
  initialized: {
    id: "http://adlnet.gov/expapi/verbs/initialized",
    display: { "en-US": "initialized", "ar-SA": "بدأ الدرس" },
  },
  /** المتدرب تقدم في الدورة */
  progressed: {
    id: "http://adlnet.gov/expapi/verbs/progressed",
    display: { "en-US": "progressed", "ar-SA": "تقدّم" },
  },
  /** المتدرب أكمل الدورة */
  completed: {
    id: "http://adlnet.gov/expapi/verbs/completed",
    display: { "en-US": "completed", "ar-SA": "أكمل" },
  },
  /** المتدرب اجتاز */
  passed: {
    id: "http://adlnet.gov/expapi/verbs/passed",
    display: { "en-US": "passed", "ar-SA": "اجتاز" },
  },
  /** المتدرب لم يجتز */
  failed: {
    id: "http://adlnet.gov/expapi/verbs/failed",
    display: { "en-US": "failed", "ar-SA": "لم يجتز" },
  },
  /** المتدرب حضر */
  attended: {
    id: "http://adlnet.gov/expapi/verbs/attended",
    display: { "en-US": "attended", "ar-SA": "حضر" },
  },
  /** المتدرب أنهى الجلسة */
  terminated: {
    id: "http://adlnet.gov/expapi/verbs/terminated",
    display: { "en-US": "terminated", "ar-SA": "أنهى" },
  },
  /** المتدرب قيّم دورة */
  evaluated: {
    id: "http://adlnet.gov/expapi/verbs/evaluated",
    display: { "en-US": "evaluated", "ar-SA": "قيّم" },
  },
} as const;

// ─── Activity Types ──────────────────────────────────────────────────────────

export const ACTIVITY_TYPES = {
  course: "http://adlnet.gov/expapi/activities/course",
  module: "http://adlnet.gov/expapi/activities/module",
  lesson: "http://adlnet.gov/expapi/activities/lesson",
  assessment: "http://adlnet.gov/expapi/activities/assessment",
  media: "http://adlnet.gov/expapi/activities/media",
} as const;

// ─── Platform Configuration ─────────────────────────────────────────────────

const PLATFORM_IRI = "https://nabdtraining.com";
const PLATFORM_NAME = "النبض المستدام - Sustain Pulse";

// ─── Builder Functions ──────────────────────────────────────────────────────

/**
 * Build an xAPI Actor from learner data
 */
export function buildActor(params: {
  email: string;
  name: string;
  nationalId?: string;
}): XAPIActor {
  const actor: XAPIActor = {
    objectType: "Agent",
    name: params.name,
    mbox: `mailto:${params.email.toLowerCase().trim()}`,
  };

  // If national ID is available, add it as the account identifier
  // This is important for NELC compliance
  if (params.nationalId) {
    actor.account = {
      homePage: PLATFORM_IRI,
      name: params.nationalId,
    };
  }

  return actor;
}

/**
 * Build an xAPI Activity Object
 */
export function buildActivity(params: {
  courseId: string;
  courseName: string;
  courseNameAr?: string;
  type?: keyof typeof ACTIVITY_TYPES;
  description?: string;
  descriptionAr?: string;
}): XAPIObject {
  return {
    objectType: "Activity",
    id: `${PLATFORM_IRI}/courses/${params.courseId}`,
    definition: {
      type: ACTIVITY_TYPES[params.type || "course"],
      name: {
        "en-US": params.courseName,
        ...(params.courseNameAr ? { "ar-SA": params.courseNameAr } : {}),
      },
      ...(params.description
        ? {
            description: {
              "en-US": params.description,
              ...(params.descriptionAr
                ? { "ar-SA": params.descriptionAr }
                : {}),
            },
          }
        : {}),
    },
  };
}

/**
 * Build a complete xAPI Statement
 */
export function buildStatement(params: {
  actor: XAPIActor;
  verb: XAPIVerb;
  object: XAPIObject;
  result?: XAPIResult;
  registrationId?: string;
  extensions?: Record<string, any>;
}): XAPIStatement {
  return {
    id: crypto.randomUUID(),
    actor: params.actor,
    verb: params.verb,
    object: params.object,
    result: params.result,
    context: {
      registration: params.registrationId || crypto.randomUUID(),
      platform: PLATFORM_NAME,
      language: "ar-SA",
      extensions: {
        [`${PLATFORM_IRI}/extensions/nelc-accredited`]: true,
        ...(params.extensions || {}),
      },
    },
    timestamp: new Date().toISOString(),
    version: "1.0.3",
  };
}

// ─── Convenience Statement Builders ──────────────────────────────────────────

/**
 * Statement: Learner registered for a course
 */
export function stmtRegistered(params: {
  email: string;
  name: string;
  nationalId?: string;
  courseId: string;
  courseName: string;
  courseNameAr?: string;
  registrationId?: string;
}): XAPIStatement {
  return buildStatement({
    actor: buildActor(params),
    verb: XAPI_VERBS.registered,
    object: buildActivity({
      courseId: params.courseId,
      courseName: params.courseName,
      courseNameAr: params.courseNameAr,
    }),
    registrationId: params.registrationId,
  });
}

/**
 * Statement: Learner launched/started a course
 */
export function stmtLaunched(params: {
  email: string;
  name: string;
  nationalId?: string;
  courseId: string;
  courseName: string;
  courseNameAr?: string;
  registrationId?: string;
}): XAPIStatement {
  return buildStatement({
    actor: buildActor(params),
    verb: XAPI_VERBS.launched,
    object: buildActivity({
      courseId: params.courseId,
      courseName: params.courseName,
      courseNameAr: params.courseNameAr,
    }),
    registrationId: params.registrationId,
  });
}

/**
 * Statement: Learner progressed in a course
 */
export function stmtProgressed(params: {
  email: string;
  name: string;
  nationalId?: string;
  courseId: string;
  courseName: string;
  courseNameAr?: string;
  progress: number; // 0-100
  registrationId?: string;
}): XAPIStatement {
  return buildStatement({
    actor: buildActor(params),
    verb: XAPI_VERBS.progressed,
    object: buildActivity({
      courseId: params.courseId,
      courseName: params.courseName,
      courseNameAr: params.courseNameAr,
    }),
    result: {
      extensions: {
        [`${PLATFORM_IRI}/extensions/progress`]: params.progress,
      },
    },
    registrationId: params.registrationId,
    extensions: {
      [`${PLATFORM_IRI}/extensions/progress-percentage`]: params.progress,
    },
  });
}

/**
 * Statement: Learner completed a course
 */
export function stmtCompleted(params: {
  email: string;
  name: string;
  nationalId?: string;
  courseId: string;
  courseName: string;
  courseNameAr?: string;
  duration?: string; // ISO 8601 duration
  registrationId?: string;
}): XAPIStatement {
  return buildStatement({
    actor: buildActor(params),
    verb: XAPI_VERBS.completed,
    object: buildActivity({
      courseId: params.courseId,
      courseName: params.courseName,
      courseNameAr: params.courseNameAr,
    }),
    result: {
      completion: true,
      ...(params.duration ? { duration: params.duration } : {}),
    },
    registrationId: params.registrationId,
  });
}

/**
 * Statement: Learner passed an assessment
 */
export function stmtPassed(params: {
  email: string;
  name: string;
  nationalId?: string;
  courseId: string;
  courseName: string;
  courseNameAr?: string;
  score?: number; // 0-100
  registrationId?: string;
}): XAPIStatement {
  return buildStatement({
    actor: buildActor(params),
    verb: XAPI_VERBS.passed,
    object: buildActivity({
      courseId: params.courseId,
      courseName: params.courseName,
      courseNameAr: params.courseNameAr,
      type: "assessment",
    }),
    result: {
      success: true,
      completion: true,
      ...(params.score !== undefined
        ? {
            score: {
              scaled: params.score / 100,
              raw: params.score,
              min: 0,
              max: 100,
            },
          }
        : {}),
    },
    registrationId: params.registrationId,
  });
}

/**
 * Statement: Learner attended a session
 */
export function stmtAttended(params: {
  email: string;
  name: string;
  nationalId?: string;
  courseId: string;
  courseName: string;
  courseNameAr?: string;
  duration?: string;
  registrationId?: string;
}): XAPIStatement {
  return buildStatement({
    actor: buildActor(params),
    verb: XAPI_VERBS.attended,
    object: buildActivity({
      courseId: params.courseId,
      courseName: params.courseName,
      courseNameAr: params.courseNameAr,
    }),
    result: {
      ...(params.duration ? { duration: params.duration } : {}),
    },
    registrationId: params.registrationId,
  });
}

/**
 * Statement: Learner evaluated a course
 */
export function stmtEvaluated(params: {
  email: string;
  name: string;
  nationalId?: string;
  courseId: string;
  courseName: string;
  courseNameAr?: string;
  rating: number; // 1 to 5
  feedback?: string;
  registrationId?: string;
}): XAPIStatement {
  return buildStatement({
    actor: buildActor(params),
    verb: XAPI_VERBS.evaluated,
    object: buildActivity({
      courseId: params.courseId,
      courseName: params.courseName,
      courseNameAr: params.courseNameAr,
    }),
    result: {
      completion: true,
      score: {
        raw: params.rating,
        min: 1,
        max: 5,
        scaled: params.rating / 5,
      },
      extensions: {
        [`${PLATFORM_IRI}/extensions/feedback`]: params.feedback || "",
      },
    },
    registrationId: params.registrationId,
  });
}

// ─── LRS Storage (Supabase) ─────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";

/**
 * Store an xAPI statement in Supabase (internal LRS)
 */
export async function storeStatement(
  statement: XAPIStatement
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("xapi_statements").insert({
      statement_id: statement.id,
      actor_email: statement.actor.mbox.replace("mailto:", ""),
      actor_name: statement.actor.name,
      actor_national_id: statement.actor.account?.name || null,
      verb_id: statement.verb.id,
      verb_display: statement.verb.display["en-US"],
      verb_display_ar: statement.verb.display["ar-SA"] || null,
      object_id: statement.object.id,
      object_name:
        statement.object.definition.name["ar-SA"] ||
        statement.object.definition.name["en-US"],
      object_type: statement.object.definition.type,
      result_score: statement.result?.score?.scaled ?? null,
      result_completion: statement.result?.completion ?? null,
      result_success: statement.result?.success ?? null,
      result_duration: statement.result?.duration ?? null,
      context_registration: statement.context?.registration || null,
      context_platform: statement.context?.platform || null,
      timestamp: statement.timestamp,
      stored: new Date().toISOString(),
      raw_statement: statement as any,
      version: statement.version,
    });

    if (error) {
      console.error("xAPI Store Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("xAPI Store Exception:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Store multiple xAPI statements
 */
export async function storeStatements(
  statements: XAPIStatement[]
): Promise<{ success: boolean; stored: number; errors: string[] }> {
  const errors: string[] = [];
  let stored = 0;

  for (const stmt of statements) {
    const result = await storeStatement(stmt);
    if (result.success) {
      stored++;
    } else {
      errors.push(result.error || "Unknown error");
    }
  }

  return { success: errors.length === 0, stored, errors };
}

/**
 * Query xAPI statements from Supabase
 */
export async function queryStatements(params: {
  email?: string;
  verb?: string;
  activityId?: string;
  since?: string;
  until?: string;
  limit?: number;
}): Promise<{ statements: any[]; error?: string }> {
  try {
    let query = supabase
      .from("xapi_statements")
      .select("*")
      .order("timestamp", { ascending: false });

    if (params.email) {
      query = query.eq("actor_email", params.email.toLowerCase().trim());
    }
    if (params.verb) {
      query = query.eq("verb_id", params.verb);
    }
    if (params.activityId) {
      query = query.eq("object_id", params.activityId);
    }
    if (params.since) {
      query = query.gte("timestamp", params.since);
    }
    if (params.until) {
      query = query.lte("timestamp", params.until);
    }
    if (params.limit) {
      query = query.limit(params.limit);
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;

    if (error) {
      return { statements: [], error: error.message };
    }

    return { statements: data || [] };
  } catch (err: any) {
    return { statements: [], error: err.message };
  }
}
