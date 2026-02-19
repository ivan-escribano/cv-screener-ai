"use client";

// Actualizado
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
          const score =
            metadata?.score != null
              ? Math.round(Number(metadata.score) * 100)
              : null;

          return (
            <div
              key={part.sourceId}
              className="rounded-md border border-gray-200 bg-gray-50 p-2.5"
            >
              <Source title={displayTitle}>
                <FileTextIcon className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm flex-1 truncate">{displayTitle}</span>
                {score !== null && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {score}%
                  </span>
                )}
              </Source>

              {metadata?.snippet && (
                <p className="mt-1.5 text-xs text-gray-400 line-clamp-1">
                  {String(metadata.snippet)}
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
