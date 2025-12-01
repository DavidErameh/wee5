// The XpConfiguration interface is now inferred directly from the Zod schema
// within XpConfigurationForm.tsx, so it is no longer needed here.

export interface XpConfigurationFormProps {
  experienceId: string;
  initialConfig?: {
    xp_per_message?: number | null;
    min_xp_per_post?: number | null;
    max_xp_per_post?: number | null;
    xp_per_reaction?: number | null;
  };
  /** Custom className */
  className?: string;
}