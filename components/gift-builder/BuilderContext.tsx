'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { BUILDER_STORAGE_KEY } from '@/data/settings';
import {
  builderReducer,
  initialBuilderState,
  mergeStored,
  type BuilderAction,
} from '@/lib/builder-state';
import { getStep, stepIds, steps, type StepId } from '@/lib/steps';
import { clearStored, readStored, writeStored } from '@/lib/utils';
import type { GiftBuilderState } from '@/types';

/* ==========================================================================
   The builder's single state object, plus where the customer is in the flow.

   Answers survive going back, refreshing, and closing the tab — a customer
   who gets interrupted mid-flow returns to what they had.
   ========================================================================== */

interface BuilderContextValue {
  state: GiftBuilderState;
  dispatch: (action: BuilderAction) => void;
  step: StepId;
  goTo: (step: StepId) => void;
  next: () => void;
  back: () => void;
  canContinue: boolean;
  /** True once persisted answers have been read. */
  hydrated: boolean;
  /** Which way the current step entered, for the transition. */
  direction: 1 | -1;
  restart: () => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({
  children,
  initialAnswers,
}: {
  children: ReactNode;
  /** Seeded from the URL when arriving from a category card on the home page. */
  initialAnswers?: Partial<GiftBuilderState>;
}) {
  const [state, dispatch] = useReducer(builderReducer, initialBuilderState);
  const [step, setStep] = useState<StepId>('recipient');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [hydrated, setHydrated] = useState(false);
  const seeded = useRef(false);

  /* Restore prior answers, then layer any deep-link answers on top. */
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    const stored = mergeStored(readStored(BUILDER_STORAGE_KEY));
    const merged = { ...(stored ?? initialBuilderState), ...initialAnswers };

    if (stored || initialAnswers) {
      dispatch({ type: 'hydrate', value: merged });
    }
    setHydrated(true);
  }, [initialAnswers]);

  /* Persist on every change, once hydration is done — writing before that
     would overwrite stored answers with the empty initial state. */
  useEffect(() => {
    if (!hydrated) return;
    writeStored(BUILDER_STORAGE_KEY, state);
  }, [state, hydrated]);

  const canContinue = useMemo(
    () => getStep(step).isComplete(state),
    [step, state]
  );

  const goTo = useCallback(
    (target: StepId) => {
      setDirection(stepIds.indexOf(target) >= stepIds.indexOf(step) ? 1 : -1);
      setStep(target);
      /* Bring the question into view — on mobile the card grid can be tall. */
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [step]
  );

  const next = useCallback(() => {
    const index = stepIds.indexOf(step);
    const target = steps[index + 1];
    if (target) goTo(target.id);
  }, [step, goTo]);

  const back = useCallback(() => {
    const index = stepIds.indexOf(step);
    const target = steps[index - 1];
    if (target) goTo(target.id);
  }, [step, goTo]);

  const restart = useCallback(() => {
    clearStored(BUILDER_STORAGE_KEY);
    dispatch({ type: 'reset' });
    setStep('recipient');
    setDirection(1);
  }, []);

  const value = useMemo<BuilderContextValue>(
    () => ({
      state,
      dispatch,
      step,
      goTo,
      next,
      back,
      canContinue,
      hydrated,
      direction,
      restart,
    }),
    [state, step, goTo, next, back, canContinue, hydrated, direction, restart]
  );

  return (
    <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
  );
}

export function useBuilder(): BuilderContextValue {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used inside <BuilderProvider>');
  }
  return context;
}
