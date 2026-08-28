import { useState } from 'react'
import { it } from '../content/it.ts'
import { disclaimerDocument, privacyDocument } from '../content/it.ts'

interface OnboardingViewProps {
  readonly onComplete: () => void
}

const STEPS = ['identity', 'what', 'privacy', 'disclaimer'] as const

/**
 * First run.
 *
 * The introduction explains what the application does and how data is handled,
 * and requires an explicit acknowledgement of the disclaimer before any
 * personal analysis. No pre-ticked boxes, no demo profile.
 */
export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [acknowledged, setAcknowledged] = useState(false)
  const [showRequirement, setShowRequirement] = useState(false)
  const step = STEPS[stepIndex] as (typeof STEPS)[number]

  const goNext = (): void => {
    if (step === 'disclaimer') {
      if (!acknowledged) {
        setShowRequirement(true)
        return
      }
      onComplete()
      return
    }
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1))
  }

  return (
    <div className="onboarding">
      <div className="onboarding__panel">
        <div className="steps" aria-hidden="true">
          {STEPS.map((name, index) => (
            <span className="steps__dot" key={name} data-active={index <= stepIndex} />
          ))}
        </div>
        <p className="small muted">
          {it.onboarding.step} {stepIndex + 1} {it.onboarding.of} {STEPS.length}
        </p>

        <section className="card">
          {step === 'identity' ? (
            <>
              <p className="eyebrow">{it.onboarding.identityTitle}</p>
              <h1 className="page-title">{it.app.tagline}</h1>
              <p className="muted">{it.onboarding.identityBody}</p>
            </>
          ) : null}

          {step === 'what' ? (
            <>
              <h1 className="page-title">{it.onboarding.whatTitle}</h1>
              <ul className="bullets">
                {it.onboarding.whatBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </>
          ) : null}

          {step === 'privacy' ? (
            <>
              <h1 className="page-title">{it.onboarding.privacyTitle}</h1>
              <ul className="bullets">
                {it.onboarding.privacyBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <details>
                <summary>{it.onboarding.privacyLink}</summary>
                <div className="stack stack--tight" style={{ marginTop: '0.75rem' }}>
                  {privacyDocument.sections.map((section) => (
                    <div key={section.title}>
                      <h2 className="small" style={{ fontWeight: 600 }}>
                        {section.title}
                      </h2>
                      {section.paragraphs.map((paragraph) => (
                        <p className="small muted" key={paragraph.slice(0, 30)}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            </>
          ) : null}

          {step === 'disclaimer' ? (
            <>
              <h1 className="page-title">{it.onboarding.disclaimerTitle}</h1>
              <p className="muted">{disclaimerDocument.intro}</p>
              <details>
                <summary>{it.onboarding.disclaimerLink}</summary>
                <div className="stack stack--tight" style={{ marginTop: '0.75rem' }}>
                  {disclaimerDocument.sections.map((section) => (
                    <div key={section.title}>
                      <h2 className="small" style={{ fontWeight: 600 }}>
                        {section.title}
                      </h2>
                      {section.paragraphs.map((paragraph) => (
                        <p className="small muted" key={paragraph.slice(0, 30)}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => {
                    setAcknowledged(event.target.checked)
                    if (event.target.checked) setShowRequirement(false)
                  }}
                />
                <span>{it.onboarding.acknowledge}</span>
              </label>
              {showRequirement ? (
                <p className="field__error" role="alert">
                  {it.onboarding.acknowledgeRequired}
                </p>
              ) : null}
            </>
          ) : null}

          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
            >
              {it.onboarding.back}
            </button>
            <button type="button" className="button button--primary" onClick={goNext}>
              {step === 'disclaimer' ? it.onboarding.start : it.onboarding.next}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
