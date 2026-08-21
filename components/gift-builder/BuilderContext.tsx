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

  const stageRef = useRef<HTMLElement | null>(null);

  const registerStage = useCallback((el: HTMLElement | null) => {
    stageRef.current = el;
  }, []);

  const goTo = useCallback(
    (target: StepId) => {
      setDirection(stepIds.indexOf(target) >= stepIds.indexOf(step) ? 1 : -1);
      setStep(target);

      if (typeof window === 'undefined') return;

      const stage = stageRef.current;
      if (!stage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      /* Align the builder to just under the sticky header — but only when it
         has drifted out of place. Re-aligning a stage that is already sitting
         at the top would yank the page under someone who just tapped a card. */
      const rect = stage.getBoundingClientRect();
      if (rect.top >= -40 && rect.top <= 160) return;

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
      direction,
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
