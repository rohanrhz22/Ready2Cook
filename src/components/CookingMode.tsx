import { useEffect, useState } from 'react'
import type { Recipe } from '../data/recipes'

type CookingModeProps = {
  recipe: Recipe
  onClose: () => void
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function CookingMode({ recipe, onClose }: CookingModeProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [running, setRunning] = useState(false)

  const totalSteps = recipe.steps.length
  const isLastStep = stepIndex === totalSteps - 1

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
            <button type="button" className="cooking-done" onClick={onClose}>
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
