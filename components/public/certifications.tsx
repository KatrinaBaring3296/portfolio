import type { Certificate } from "@/lib/types";
import { CertificateCard } from "./certificate-card";
import { Reveal } from "./reveal";
import { Section } from "./section";

export function Certifications({ items, tinted }: { items: Certificate[]; tinted: boolean }) {
  if (items.length === 0) return null;

  return (
    <Section id="certifications" eyebrow="Certifications" title="Credentials" tinted={tinted}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((certificate, i) => (
          <li key={certificate.id}>
            {/* Cards in the same row cascade in left to right */}
            <Reveal delay={(i % 3) * 120} className="h-full">
              <CertificateCard certificate={certificate} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
