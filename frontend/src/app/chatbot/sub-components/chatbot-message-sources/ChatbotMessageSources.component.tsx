"use client";

import { FileTextIcon } from "lucide-react";

import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";

import type { ChatbotMessageSourcesProps } from "./ChatbotMessageSources.interface";

const ChatbotMessageSources = ({ sourceParts }: ChatbotMessageSourcesProps) => {
  const urlSources = sourceParts.filter((part) => part.type === "source-url");

  return (
    <Sources>
      <SourcesTrigger count={urlSources.length} />

      <SourcesContent>
        {urlSources.map((part) => {
          const displayTitle = part.title || part.url;
          const metadata = part.providerMetadata?.custom;

          return (
            <div
              key={part.sourceId}
              className="rounded border border-border bg-muted/50 p-2"
            >
              <Source title={displayTitle}>
                <FileTextIcon className="h-4 w-4" />
                <span className="font-medium">{displayTitle}</span>
              </Source>

              {metadata?.snippet && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {String(metadata.snippet)}...
                </p>
              )}
            </div>
          );
        })}
      </SourcesContent>
    </Sources>
  );
};

export default ChatbotMessageSources;
