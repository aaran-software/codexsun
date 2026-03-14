import { Contact, Mail, MessageCircle, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { company } from "@/config/company";

type ContactInfo = {
  email: string;
  phone: string;
};

const DEFAULT_CONTACT: ContactInfo = {
  email: company.contact.email,
  phone: company.contact.phone,
};

const CONTACTS_BY_TENANT: Record<string, ContactInfo> = {
  tirupurdirect: {
    email: company.contact.email,
    phone: company.contact.phone,
  },
  codexsun: {
    email: company.contact.email,
    phone: company.contact.phone,
  },
  logicx: {
    email: "hello@logicx.in",
    phone: "+91 84280 80080",
  },
  asusstore: {
    email: "hello@asusstore.in",
    phone: "+91 95141 41494",
  },
};

function toPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function resolveTenant(): string {
  if (typeof window === "undefined") {
    return "tirupurdirect";
  }

  const host = window.location.hostname.toLowerCase();

  if (host.includes("logicx")) {
    return "logicx";
  }

  if (host.includes("asusstore")) {
    return "asusstore";
  }

  return "tirupurdirect";
}

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const tenant = resolveTenant();

  const contact = useMemo(() => CONTACTS_BY_TENANT[tenant] ?? DEFAULT_CONTACT, [tenant]);
  const phoneDigits = useMemo(() => toPhoneDigits(contact.phone), [contact.phone]);

  return (
    <div className="fixed right-6 bottom-6 z-[70] flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="flex flex-col items-end gap-2">
          <a
            href={`https://wa.me/${phoneDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-lg ring-1 ring-emerald-100 transition hover:-translate-y-0.5 hover:bg-slate-50"
            aria-label={`WhatsApp ${contact.phone}`}
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span>WhatsApp {contact.phone}</span>
          </a>

          <a
            href={`tel:${phoneDigits}`}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-lg ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:bg-slate-50"
            aria-label={`Call ${contact.phone}`}
          >
            <Phone className="h-4 w-4 text-sky-600" />
            <span>Phone {contact.phone}</span>
          </a>

          <a
            href={`mailto:${contact.email}`}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-lg ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-slate-50"
            aria-label={`Email ${contact.email}`}
          >
            <Mail className="h-4 w-4 text-blue-600" />
            <span>Mail {contact.email}</span>
          </a>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="group relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-[#007BFF] text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#005FCC]"
        aria-label={isOpen ? "Close contact actions" : "Open contact actions"}
      >
        <span className="pointer-events-none absolute inset-1 rounded-full border border-white/30" />
        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
        <Contact className="relative z-10 h-7 w-7 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
      </button>
    </div>
  );
}
