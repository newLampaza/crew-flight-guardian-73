
export type FeedbackEntityType = 'flight' | 'cognitive_test' | 'fatigue_analysis';

export interface Feedback {
  id: number;
  type: FeedbackEntityType;
  entityId: number;
  entityInfo: string;
  rating: number;
  comments: string;
  date: string;
}

export interface FeedbackSubmission {
  entityType: FeedbackEntityType;
  entityId: number;
  rating: number;
  comments: string;
}
