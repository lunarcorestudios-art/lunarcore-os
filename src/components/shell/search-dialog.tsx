"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SearchHit } from "@/lib/studio/types";

type SearchResult = SearchHit & { href: string };

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchResult[]>([]);
  const [pending, setPending] = useState(false);
  const inputId = useId();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setPending(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((body: { items?: SearchResult[] }) => {
          setHits(body.items ?? []);
          setPending(false);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setPending(false);
        });
    }, 140);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const visibleHits = query.trim().length < 2 ? [] : hits;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-10 min-w-0 flex-1 justify-start px-3 text-muted-foreground sm:max-w-sm sm:flex-none"
        onClick={() => setOpen(true)}
      >
        <Search />
        <span className="truncate">Search the studio</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] sm:inline">
          Ctrl K
        </kbd>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            setHits([]);
          }
        }}
      >
        <DialogContent className="top-[12vh] p-0">
          <div className="border-b border-border px-4 pt-4 pb-3">
            <DialogTitle className="sr-only">Search the studio</DialogTitle>
            <DialogDescription className="mb-3 text-xs tracking-[0.14em] uppercase">
              Search · clients, projects, tasks, shoots, reviews
            </DialogDescription>
            <label htmlFor={inputId} className="sr-only">
              Search query
            </label>
            <Input
              id={inputId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Banwa, Kobelco, or script"
              autoFocus
            />
          </div>
          <div className="max-h-[50vh] overflow-auto px-2 py-2">
            {query.trim().length < 2 ? (
              <p className="px-3 py-6 text-sm text-muted-foreground">Type at least two characters.</p>
            ) : pending && visibleHits.length === 0 ? (
              <p className="px-3 py-6 text-sm text-muted-foreground">Searching…</p>
            ) : visibleHits.length === 0 ? (
              <p className="px-3 py-6 text-sm text-muted-foreground">Nothing matches that query.</p>
            ) : (
              <ul>
                {visibleHits.map((hit) => (
                  <li key={`${hit.kind}-${hit.id}`}>
                    <Link
                      href={hit.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between gap-4 rounded-md px-3 py-2.5 hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{hit.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{hit.snippet}</span>
                      </span>
                      <span className="shrink-0 text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
                        {hit.kind}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

