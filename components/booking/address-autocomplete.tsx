"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useCookieConsent } from "@/components/gdpr/cookie-consent-context";
import { Input } from "@/components/ui/input";
import { canLoadThirdPartyMaps } from "@/lib/cookie-consent";
import { getGoogleMapsApiKey } from "@/lib/google-maps";
import { cn } from "@/lib/utils";

export type PlaceSelection = {
  address: string;
  lat?: number;
  lng?: number;
};

type PlaceSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

type AddressAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: PlaceSelection) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  locale?: string;
  "aria-label"?: string;
  autoComplete?: string;
};

export function AddressAutocomplete({
  id,
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  required,
  disabled,
  className,
  locale = "it",
  "aria-label": ariaLabel,
  autoComplete = "street-address",
}: AddressAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  const { ready, consent } = useCookieConsent();
  const mapsAllowed = ready && canLoadThirdPartyMaps(consent);
  const hasMapsKey = Boolean(getGoogleMapsApiKey());

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const autocompleteEnabled = mapsAllowed && hasMapsKey;

  const fetchSuggestions = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!autocompleteEnabled || trimmed.length < 2) {
        setSuggestions([]);
        setOpen(false);
        setLoading(false);
        return;
      }

      const seq = ++requestSeq.current;
      setLoading(true);

      try {
        const params = new URLSearchParams({ q: trimmed, locale });
        const res = await fetch(`/api/places/autocomplete?${params.toString()}`);
        const data = (await res.json()) as {
          success?: boolean;
          suggestions?: PlaceSuggestion[];
        };

        if (seq !== requestSeq.current) return;

        if (!res.ok || !data.success) {
          setSuggestions([]);
          setOpen(false);
          return;
        }

        const next = data.suggestions ?? [];
        setSuggestions(next);
        setOpen(next.length > 0);
        setActiveIndex(-1);
      } catch {
        if (seq !== requestSeq.current) return;
        setSuggestions([]);
        setOpen(false);
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
        }
      }
    },
    [autocompleteEnabled, locale]
  );

  useEffect(() => {
    if (!autocompleteEnabled) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(value);
    }, 280);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [autocompleteEnabled, fetchSuggestions, value]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    setOpen(false);
    setSuggestions([]);
    onChange(suggestion.label);

    if (!onPlaceSelect) {
      return;
    }

    try {
      const params = new URLSearchParams({ placeId: suggestion.placeId, locale });
      const res = await fetch(`/api/places/details?${params.toString()}`);
      const data = (await res.json()) as {
        success?: boolean;
        place?: { address: string; lat: number; lng: number };
      };

      if (res.ok && data.success && data.place) {
        onChange(data.place.address);
        onPlaceSelect({
          address: data.place.address,
          lat: data.place.lat,
          lng: data.place.lng,
        });
        return;
      }
    } catch {
      // Usa almeno l'etichetta selezionata.
    }

    onPlaceSelect({ address: suggestion.label });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeIndex]!);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="h-10 md:h-11"
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
      />

      {autocompleteEnabled && open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-[10001] mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-xl"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.placeId} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  "flex w-full flex-col px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                  index === activeIndex && "bg-primary/10"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void selectSuggestion(suggestion)}
              >
                <span className="font-medium text-foreground">{suggestion.mainText}</span>
                {suggestion.secondaryText ? (
                  <span className="text-xs text-muted-foreground">{suggestion.secondaryText}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {autocompleteEnabled && loading ? (
        <p className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          …
        </p>
      ) : null}
    </div>
  );
}
