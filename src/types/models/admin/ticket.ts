export interface AdminTicket {
  id: string
  ticketNumber: string
  companyId: string
  companyName: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  description: string
  category: 'technical' | 'billing' | 'feature_request' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
  assignedTo?: string
  assignedToName?: string
  replies: AdminTicketReply[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  closedAt?: string
}

export interface AdminTicketReply {
  id: string
  ticketId: string
  userId: string
  userName: string
  userRole: 'customer' | 'support'
  message: string
  attachments?: string[]
  createdAt: string
}

export interface AdminTicketForm {
  subject: string
  description: string
  category: 'technical' | 'billing' | 'feature_request' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface AdminTicketReplyForm {
  message: string
  attachments?: File[]
}

export type AdminTicketFormErrors = Partial<Record<keyof AdminTicketForm, string>>
