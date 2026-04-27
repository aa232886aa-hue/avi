'use server';
/**
 * @fileOverview A Genkit flow for summarizing web page content.
 *
 * - summarizeWebContent - A function that generates a concise summary of provided web content.
 * - SummarizeWebContentInput - The input type for the summarizeWebContent function.
 * - SummarizeWebContentOutput - The return type for the summarizeWebContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeWebContentInputSchema = z.object({
  webContent: z.string().describe('The full text content of a web page to be summarized.'),
});
export type SummarizeWebContentInput = z.infer<typeof SummarizeWebContentInputSchema>;

const SummarizeWebContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided web content.'),
});
export type SummarizeWebContentOutput = z.infer<typeof SummarizeWebContentOutputSchema>;

const summarizeWebContentPrompt = ai.definePrompt({
  name: 'summarizeWebContentPrompt',
  input: { schema: SummarizeWebContentInputSchema },
  output: { schema: SummarizeWebContentOutputSchema },
  prompt: `You are an expert summarization AI. Your task is to provide a concise and accurate summary of the following web page content. Focus on extracting the key information and main points.

Web Page Content:
{{{webContent}}}

Please provide a concise summary.`,
});

const summarizeWebContentFlow = ai.defineFlow(
  {
    name: 'summarizeWebContentFlow',
    inputSchema: SummarizeWebContentInputSchema,
    outputSchema: SummarizeWebContentOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeWebContentPrompt(input);
    return output!;
  }
);

export async function summarizeWebContent(input: SummarizeWebContentInput): Promise<SummarizeWebContentOutput> {
  return summarizeWebContentFlow(input);
}
