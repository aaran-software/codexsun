import { type FormEvent, useState } from 'react'
import { Button } from '@codexsun/ui/components/ui/button'
import { useSiteShell } from '@sites/app/use-site-shell'
import { submitContact } from '@sites/lib/api'

function ContactPage() {
  const { payload } = useSiteShell()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      await submitContact({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        message: String(formData.get('message') ?? ''),
      })

      form.reset()
      setStatus('sent')
    } catch (submissionError) {
      setStatus('error')
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to send your message.',
      )
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <article className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6">
        <p className="text-xs font-medium tracking-[0.22em] text-amber-300 uppercase">
          Contact
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-stone-50">
          Start the conversation.
        </h1>
        <div className="mt-6 space-y-3 text-sm text-stone-400">
          <p>{payload?.content.contact.email}</p>
          <p>{payload?.content.contact.phone}</p>
          <p>{payload?.content.contact.location}</p>
        </div>
      </article>

      <form
        className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4">
          <Field label="Name" name="name" type="text" />
          <Field label="Email" name="email" type="email" />
          <Field label="Message" name="message" as="textarea" />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send message'}
          </Button>
          {status === 'sent' ? (
            <p className="text-sm text-emerald-300">Message submitted successfully.</p>
          ) : null}
          {status === 'error' && error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : null}
        </div>
      </form>
    </section>
  )
}

function Field({
  label,
  name,
  type,
  as,
}: {
  label: string
  name: string
  type?: string
  as?: 'textarea'
}) {
  return (
    <label className="grid gap-2 text-sm text-stone-300">
      <span>{label}</span>
      {as === 'textarea' ? (
        <textarea
          name={name}
          required
          rows={6}
          className="rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-300/50"
        />
      ) : (
        <input
          name={name}
          type={type}
          required
          className="rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-300/50"
        />
      )}
    </label>
  )
}

export { ContactPage }
