// ============================================================
// IP-NEXUS HELP - HOOKS INDEX
// ============================================================

// Articles & Categories
export {
  useHelpCategories,
  useHelpArticles,
  useHelpArticle,
  useSearchHelpArticles,
  useRelatedArticles,
  useSubmitArticleFeedback,
  useAllHelpArticles,
  useCreateHelpArticle,
  useUpdateHelpArticle,
  useDeleteHelpArticle,
  useCreateHelpCategory,
  useUpdateHelpCategory,
  useDeleteHelpCategory,
} from './useHelpArticles';

// Support Tickets
export {
  useSupportTickets,
  useSupportTicket,
  useCreateSupportTicket,
  useAddTicketMessage,
  useSubmitTicketSatisfaction,
  useAllSupportTickets,
  useUpdateSupportTicket,
  useAddAgentMessage,
  useResolveTicket,
} from './useSupportTickets';

// Announcements & System Status
export {
  useHelpAnnouncements,
  useMarkAnnouncementRead,
  useUnreadAnnouncementCount,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useSystemStatus,
  useActiveIncidents,
  useCreateSystemStatus,
  useUpdateSystemStatus,
  useDeleteSystemStatus,
  useHelpTooltips,
  useHelpTour,
  useTourProgress,
  useUpdateTourProgress,
} from './useHelpAnnouncements';

// Rules Engine (Prompt 48)
export {
  useHelpRules,
  useHelpRule,
  useLogRuleExecution,
  useContextualHelp,
  useCreateHelpRule,
  useUpdateHelpRule,
  useDeleteHelpRule,
} from './useHelpRules';
export type { HelpRule, HelpRuleTrigger, HelpRuleExecution } from './useHelpRules';
