import { z } from 'zod';

export const cvSchema = z.object({
  fullName: z.string().describe('Realistic full name'),
  photoDescription: z
    .string()
    .describe(
      'Physical description for generating a profile photo: age, gender, ethnicity, hair color/style, facial features, expression. Be specific and varied.'
    ),
  contactInfo: z
    .object({
      email: z.string().describe('Professional email based on name'),
      phone: z.string().describe('Phone number with country code'),
      address: z.string().describe('City and country'),
    })
    .describe('Contact information'),
  summary: z.string().describe('Professional summary in 2-3 lines'),
  workExperience: z
    .array(
      z
        .object({
          company: z.string().describe('Company name'),
          position: z.string().describe('Job position or title'),
          startDate: z.string().describe('Format: Month Year (e.g. January 2020)'),
          endDate: z.string().describe('Format: Month Year or "Present"'),
          description: z.string().describe('2-3 achievements or responsibilities'),
        })
        .describe('Work experience entry')
    )
    .length(3)
    .describe('Array of 3 work experiences'),
  skills: z
    .array(z.string().describe('Individual skill'))
    .min(6)
    .max(10)
    .describe('Professional skills (6-10 items)'),
  education: z
    .array(
      z
        .object({
          institution: z.string().describe('School or university name'),
          degree: z.string().describe('Degree or certification'),
          startDate: z.string().describe('Start date'),
          endDate: z.string().describe('End date'),
        })
        .describe('Education entry')
    )
    .length(2)
    .describe('Array of 2 education entries'),
  languages: z
    .array(
      z
        .object({
          language: z.string().describe('Language name'),
          level: z.string().describe('Proficiency level'),
        })
        .describe('Language entry')
    )
    .length(2)
    .describe('Array of 2 languages'),
});

export type CV = z.infer<typeof cvSchema>;
