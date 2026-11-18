"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SearchXIcon,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { CATEGORIES, SERVICE_MODES, SORT_OPTIONS } from "@/lib/constants";
import type { ServiceListResponse } from "@/lib/types";

const LIMIT = 12;

type ParamPatch = Record<string, string | number | undefined>;

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
  label,
}: {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next ?? "all")}
      items={options.map((option) => ({ value: option.value, label: option.label }))}
    >
      <SelectTrigger className="w-full sm:w-44" aria-label={label}>
        <SelectValue placeholder={placeholder}>
          {(current: string) =>
            options.find((option) => option.value === current)?.label ?? placeholder
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ServicesBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const mode = searchParams.get("serviceMode") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [result, setResult] = useState<ServiceListResponse | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Identity of the current request — when it changes we show the skeleton
  // until the matching response arrives (no sync setState in effects).
  const requestKey = `${search}|${category}|${mode}|${sort}|${page}|${attempt}`;
  const loading = fetchedKey !== requestKey;
  const error = failure && failure.key === requestKey ? failure.message : null;

  /** Applies filter changes to the URL (single source of truth). */
  const update = useCallback(
    (patch: ParamPatch) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "" || value === "all") params.delete(key);
        else params.set(key, String(value));
      }
      const query = params.toString();
      router.replace(query ? `/services?${query}` : "/services", { scroll: false });
    },
    [router, searchParams]
  );

  // Debounced search → URL.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== search) {
        update({ search: searchInput.trim() || undefined, page: 1 });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search, update]);

  // Fetch whenever the URL filters change.
  useEffect(() => {
    let cancelled = false;
    api<ServiceListResponse>("/api/services", {
      auth: false,
      query: {
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        serviceMode: mode !== "all" ? mode : undefined,
        sort,
        page,
        limit: LIMIT,
      },
    })
      .then((res) => {
        if (!cancelled) {
          setResult(res);
          setFetchedKey(requestKey);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFailure({
            key: requestKey,
            message: err instanceof Error ? err.message : "Failed to load services",
          });
          setFetchedKey(requestKey);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey, search, category, mode, sort, page]);

  const totalPages = result?.pages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Browse services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result
            ? `${result.total} service${result.total === 1 ? "" : "s"} available`
            : "Search approved services from verified technicians."}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 gap-0 py-4">
        <div className="flex flex-col gap-3 px-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title, description or technician…"
              className="pl-9"
              aria-label="Search services"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FilterSelect
              label="Category"
              value={category}
              placeholder="All categories"
              onChange={(value) => update({ category: value, page: 1 })}
              options={[
                { value: "all", label: "All categories" },
                ...CATEGORIES.map((item) => ({ value: item, label: item })),
              ]}
            />
            <FilterSelect
              label="Service mode"
              value={mode}
              placeholder="Any mode"
              onChange={(value) => update({ serviceMode: value, page: 1 })}
              options={[
                { value: "all", label: "Any mode" },
                ...SERVICE_MODES.map((item) => ({ value: item, label: item })),
              ]}
            />
            <FilterSelect
              label="Sort order"
              value={sort}
              placeholder="Newest first"
              onChange={(value) => update({ sort: value, page: 1 })}
              options={SORT_OPTIONS.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
            />
          </div>
        </div>
      </Card>

      {/* Results */}
      {error && (
        <div className="py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button className="mt-4" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </Button>
        </div>
      )}

      {!error && loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: LIMIT }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="aspect-video w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!error && !loading && result !== null && result.services.length === 0 && (
        <EmptyState
          icon={SearchXIcon}
          title="No services found"
          description="Try adjusting your search or clearing the filters."
        >
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchInput("");
              router.replace("/services", { scroll: false });
            }}
          >
            Clear all filters
          </Button>
        </EmptyState>
      )}

      {!error && !loading && result !== null && result.services.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-between gap-3"
              aria-label="Pagination"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => update({ page: page - 1 })}
              >
                <ChevronLeftIcon /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => update({ page: page + 1 })}
              >
                Next <ChevronRightIcon />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function ServicesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />
      <Skeleton className="mt-6 h-20 w-full rounded-lg" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="aspect-video w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesBrowser />
    </Suspense>
  );
}
