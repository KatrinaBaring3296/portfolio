import { getHomeContent, getHomeSections, getSettings } from "@/lib/content";
import type { FocusProfile } from "@/lib/types";
import { About } from "./about";
import { Certifications } from "./certifications";
import { Contact } from "./contact";
import { Education } from "./education";
import { Experience } from "./experience";
import { Faq } from "./faq";
import { Hero } from "./hero";
import { Projects } from "./projects";
import { Samples } from "./samples";
import { Services } from "./services";
import { Skills } from "./skills";
import { Testimonials } from "./testimonials";

// Shared by "/" and "/for/[profile]": renders the hero, then the other
// sections in the order the profile chose.
export async function HomePage({ profile }: { profile: FocusProfile }) {
  const [settings, content, sections] = await Promise.all([
    getSettings(),
    getHomeContent(profile),
    getHomeSections(profile), // empty sections are dropped, so the tinted backgrounds still alternate
  ]);

  return (
    <>
      <Hero settings={settings} profile={profile} highlights={content.categories.slice(0, 3)} />
      {sections.map((key, i) => {
        const tinted = i % 2 === 0; // every other section gets the soft background
        switch (key) {
          case "about":
            return <About key={key} settings={settings} tinted={tinted} />;
          case "services":
            return (
              <Services
                key={key}
                categories={content.categories}
                services={content.services}
                tinted={tinted}
              />
            );
          case "experience":
            return <Experience key={key} items={content.experience} tinted={tinted} />;
          case "samples":
            return <Samples key={key} items={content.samples} tinted={tinted} />;
          case "projects":
            return <Projects key={key} items={content.projects} tinted={tinted} />;
          case "skills":
            return <Skills key={key} items={content.skills} tinted={tinted} />;
          case "education":
            return <Education key={key} items={content.education} tinted={tinted} />;
          case "certifications":
            return <Certifications key={key} items={content.certificates} tinted={tinted} />;
          case "testimonials":
            return <Testimonials key={key} items={content.testimonials} tinted={tinted} />;
          case "faq":
            return <Faq key={key} items={content.faqs} tinted={tinted} />;
          case "contact":
            return <Contact key={key} settings={settings} profileSlug={profile.slug} tinted={tinted} />;
        }
      })}
    </>
  );
}
