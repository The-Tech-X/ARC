import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.legalName} handles the information you send through this site.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="3 September 2026"
      sections={[
        {
          heading: "What this covers",
          body: (
            <p>
              This page explains what {site.legalName} does with information
              you send through this site. It applies to this website only, and
              it is written to be read rather than to be technically
              unassailable.
            </p>
          ),
        },
        {
          heading: "What gets collected",
          body: (
            <>
              <p>
                Only what you type into the booking form: your name, your
                email address, an optional link to your work, an optional
                note, and the answers you select from the four questions.
              </p>
              <p>
                Nothing else is collected automatically. There is no analytics
                script, no advertising pixel and no third-party tracker on this
                site. If that changes, this section changes with it and names
                the provider.
              </p>
            </>
          ),
        },
        {
          heading: "What it's used for",
          body: (
            <p>
              To reply to you, and to make the first conversation useful rather
              than spending it on introductions. That is the whole purpose. It
              is not sold, rented or used for advertising, and you will not be
              added to a mailing list because you enquired.
            </p>
          ),
        },
        {
          heading: "Who else sees it",
          body: (
            <p>
              Only the services needed to deliver and store the enquiry — an
              email provider, and a scheduling tool if you choose to book a
              time directly. They process it on our behalf and for no other
              purpose. Nobody else receives it.
            </p>
          ),
        },
        {
          heading: "How long it's kept",
          body: (
            <p>
              Enquiries are kept while there is a reasonable prospect of
              working together, and deleted on request at any point — before,
              during or after.
            </p>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <p>
              Email{" "}
              <a className="text-bone/80 underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>{" "}
              to ask what is held about you, to correct it, or to have it
              deleted. No particular form of words is needed and you do not
              have to give a reason.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              {site.legalName} — {site.location}.{" "}
              <a className="text-bone/80 underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </p>
          ),
        },
      ]}
    />
  );
}
