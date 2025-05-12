export interface IFeedback {
    id: string;
    user_id: string;
    feedback_type: 'Complaint' | 'Suggestion' | 'Praise';
    content: string;
    status: 'New' | 'In Progress' | 'Resolved';
    created_at: Date;
    updated_at: Date;
  }