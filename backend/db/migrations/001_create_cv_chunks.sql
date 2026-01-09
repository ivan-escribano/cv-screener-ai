-- 001_create_cv_chunks.sql

-- Enable pgvector
create extension if not exists vector;

-- Chunks table
create table cv_chunks (
  id bigserial primary key,
  content text not null,
  embedding vector(1536),
  file_id text not null,
  chunk_index integer,
  created_at timestamp with time zone default now()
);

-- Index for fast search
create index on cv_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Semantic search function with threshold
create or replace function match_cv_chunks (
  query_embedding vector(1536),
  match_count int default 10,
  match_threshold float default 0.7
)
returns table (
  id bigint,
  content text,
  file_id text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    cv_chunks.id,
    cv_chunks.content,
    cv_chunks.file_id,
    1 - (cv_chunks.embedding <=> query_embedding) as similarity
  from cv_chunks
  where 1 - (cv_chunks.embedding <=> query_embedding) >= match_threshold
  order by cv_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;