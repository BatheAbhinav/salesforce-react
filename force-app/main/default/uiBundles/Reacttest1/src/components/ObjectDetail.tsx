import { useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileQuestion,
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './ui/collapsible';
import { Skeleton } from './ui/skeleton';

/**
 * Presentational building blocks shared by every object detail page
 * (Account/Contact/Opportunity). Field layout and data fetching stay
 * per-object since the fields/sections differ; only the generic shell
 * (loading/error/not-found states and the field/section layout) is shared.
 */

export function FieldItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{children ?? '—'}</dd>
    </div>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-8 gap-y-4">{children}</dl>;
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer text-lg font-semibold py-2">
        {open ? (
          <ChevronDown className="size-5" />
        ) : (
          <ChevronRight className="size-5" />
        )}
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TelephoneField({ value }: { value?: string | null }) {
  if (!value) return null;
  return (
    <a href={`tel:${value}`} className="underline">
      {value}
    </a>
  );
}

export function DetailError({
  label,
  onBack,
}: {
  label: string;
  onBack: () => void;
}) {
  return (
    <>
      <Alert variant="destructive" role="alert">
        <AlertCircle />
        <AlertTitle>
          <h2>Failed to load {label.toLowerCase()}</h2>
        </AlertTitle>
        <AlertDescription>
          Something went wrong while loading this {label.toLowerCase()}. Please
          try again later.
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </>
  );
}

export function DetailNotFound({
  label,
  onBack,
}: {
  label: string;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <FileQuestion className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-1">{label} not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The {label.toLowerCase()} you're looking for doesn't exist or may have
          been deleted.
        </p>
        <Button variant="outline" onClick={onBack}>
          ← Go back
        </Button>
      </CardContent>
    </Card>
  );
}

export function SkeletonField() {
  return (
    <div>
      <Skeleton className="h-4 w-24 mb-1.5" />
      <Skeleton className="h-5 w-40" />
    </div>
  );
}

export function SkeletonFieldRow() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
      <SkeletonField />
      <SkeletonField />
    </div>
  );
}

export function SkeletonSection() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48 py-2" />
      <SkeletonFieldRow />
      <SkeletonFieldRow />
    </div>
  );
}

export function DetailSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Skeleton className="h-8 w-56 mb-4" />
      <Card>
        <CardContent className="space-y-8 pt-6">{children}</CardContent>
      </Card>
    </>
  );
}
