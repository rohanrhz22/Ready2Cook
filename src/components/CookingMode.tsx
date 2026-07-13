import { useCallback, useEffect, useState } from 'react'
import type { Recipe } from '../data/recipes'

type CookingModeProps = {
  recipe: Recipe
  onClose: () => void
  onCooked?: () => void
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function CookingMode({ recipe, onClose, onCooked }: CookingModeProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([])
  const [showChecklist, setShowChecklist] = useState(false)

  const speechSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const totalSteps = recipe.steps.length
  const isLastStep = stepIndex === totalSteps - 1

  const speak = useCallback(
    (text: string) => {
      if (!speechSupported) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    },
    [speechSupported],
  )

  // Read the current step aloud whenever voice is on or the step changes.
  useEffect(() => {
    if (voiceOn) speak(recipe.steps[stepIndex])
  }, [voiceOn, stepIndex, recipe.steps, speak])

  // Stop any speech when leaving cooking mode.
  useEffect(
    () => () => {
      if (speechSupported) window.speechSynthesis.cancel()
    },
    [speechSupported],
  )

  const toggleVoice = () => {
    setVoiceOn((on) => {
      const next = !on
      if (!next && speechSupported) window.speechSynthesis.cancel()
      return next
    })
  }

  useEffect(() => {
    if (!running || secondsLeft === null) return
    if (secondsLeft <= 0) {
      setRunning(false)
      return
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => (current ?? 0) - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [running, secondsLeft])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') setStepIndex((index) => Math.min(totalSteps - 1, index + 1))
      if (event.key === 'ArrowLeft') setStepIndex((index) => Math.max(0, index - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, totalSteps])

  const startTimer = (minutes: number) => {
    setSecondsLeft(minutes * 60)
    setRunning(true)
  }

  // Keep the screen awake while cooking (best-effort; ignored where unsupported).
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    let released = false

    const requestWakeLock = async () => {
      if (!('wakeLock' in navigator)) return
      try {
        wakeLock = await navigator.wakeLock.request('screen')
      } catch {
        // Denied or unsupported — no action needed.
      }
    }

    void requestWakeLock()

    // Re-acquire if the tab becomes visible again.
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !released) void requestWakeLock()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLock?.release().catch(() => undefined)
    }
  }, [])

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    )
  }

  const finishCooking = () => {
    onCooked?.()
    onClose()
  }

  return (
    <div
      className="cooking-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Cooking ${recipe.title}`}
    >
      <div className="cooking-panel">
        <header className="cooking-header">
          <div>
            <p className="cooking-eyebrow">Cooking mode</p>
            <h2>{recipe.title}</h2>
          </div>
          <button
            type="button"
            className="cooking-close"
            onClick={onClose}
            aria-label="Exit cooking mode"
          >
            ✕
          </button>
        </header>

        <p className="cooking-progress">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <div className="cooking-step">{recipe.steps[stepIndex]}</div>

        <div className="cooking-checklist">
          <button
            type="button"
            className="checklist-toggle"
            onClick={() => setShowChecklist((open) => !open)}
            aria-expanded={showChecklist}
          >
            🧾 Ingredients ({checkedIngredients.length}/{recipe.ingredients.length})
            <span aria-hidden="true">{showChecklist ? ' ▲' : ' ▼'}</span>
          </button>
          {showChecklist && (
            <ul className="checklist-items">
              {recipe.ingredients.map((ingredient, index) => {
                const checked = checkedIngredients.includes(index)
                return (
                  <li key={`${ingredient.name}-${ingredient.unit}`} className={checked ? 'checked' : ''}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleIngredient(index)}
                      />
                      <span>
                        {ingredient.name} — {ingredient.amount} {ingredient.unit}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {speechSupported && (
          <div className="cooking-voice">
            <button
              type="button"
              className={`voice-toggle ${voiceOn ? 'on' : ''}`}
              onClick={toggleVoice}
              aria-pressed={voiceOn}
            >
              {voiceOn ? '🔊 Voice on' : '🔈 Voice off'}
            </button>
            <button
              type="button"
              className="voice-repeat"
              onClick={() => speak(recipe.steps[stepIndex])}
            >
              🔁 Read step
            </button>
          </div>
        )}

        <div className="cooking-timer">
          <span className="cooking-clock">
            {secondsLeft === null ? '--:--' : formatClock(secondsLeft)}
          </span>
          <div className="cooking-timer-actions">
            <button type="button" onClick={() => startTimer(1)}>
              1m
            </button>
            <button type="button" onClick={() => startTimer(5)}>
              5m
            </button>
            <button type="button" onClick={() => startTimer(recipe.cookMinutes)}>
              {recipe.cookMinutes}m
            </button>
            <button
              type="button"
              onClick={() => setRunning((current) => !current)}
              disabled={secondsLeft === null}
            >
              {running ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        <footer className="cooking-nav">
          <button
            type="button"
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            disabled={stepIndex === 0}
          >
            ← Previous
          </button>
          {isLastStep ? (
            <button type="button" className="cooking-done" onClick={finishCooking}>
              Done 🎉
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((index) => Math.min(totalSteps - 1, index + 1))}
            >
              Next →
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
