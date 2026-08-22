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
  restart: () => void;
  /** True when the builder sits inside a page that already owns its <h1>,
      so step titles drop to <h2>. */
  embedded: boolean;
  /** The shell hands us its container so step changes move the builder
      area into view instead of jumping the whole page to the top. */
  registerStage: (el: HTMLElement | null) => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({
  children,
  initialAnswers,
  embedded = false,
}: {
  children: ReactNode;
  /** Seeded from the URL when arriving from a deep link. */
  initialAnswers?: Partial<GiftBuilderState>;
  /** Set on the home page, where the hero already carries the <h1>. */
  embedded?: boolean;
}) {
  const [state, dispatch] = useReducer(builderReducer, initialBuilderState);
  const [step, setStep] = useState<StepId>('recipient');
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

  const stageRef = useRef<HTMLElement | null>(null);

  const registerStage = useCallback((el: HTMLElement | null) => {
    stageRef.current = el;
  }, []);

  const goTo = useCallback(
    (target: StepId) => {
      setStep(target);

      if (typeof window === 'undefined') return;

      const stage = stageRef.current;
      if (!stage) return;

      /* Answering a question should move the question and nothing else. The
         page only re-aligns when the builder has genuinely drifted off the
         screen — someone who scrolled a long way into the recommendation and
         then went back to a short question would otherwise be left staring
         at empty space.

         The band is deliberately wide: half a viewport either side of a clean
         alignment still counts as "you can see it, leave it alone". Inside
         that band the scroll position is untouched, which is what stops the
         jump the shop reported. */
      const rect = stage.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.top > -viewport * 0.5 && rect.top < viewport * 0.5) return;

      window.scrollTo({
        top: rect.top + window.scrollY - 72,
        behavior: 'smooth',
      });
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
      restart,
      registerStage,
      embedded,
    }),
    [
      state,
      step,
      goTo,
      next,
      back,
      canContinue,
      hydrated,
      restart,
      registerStage,
      embedded,
    ]
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
