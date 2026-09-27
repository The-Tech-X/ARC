import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `The terms that apply to this site and to work carried out by ${site.legalName}.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="3 September 2026"
      sections={[
        {
          heading: "This site",
          body: (
            <p>
              Everything here is information about {site.legalName} and what it
              does. Nothing on this site is an offer, and no particular result
              is promised or implied anywhere on it.
            </p>
          ),
        },
        {
          heading: "Enquiries aren't contracts",
          body: (
            <p>
              Submitting the booking form starts a conversation, nothing more.
              Work begins only once scope, price and timing are agreed in
              writing — normally a short proposal you sign off on before
              anything starts.
            </p>
          ),
        },
        {
          heading: "Scope and revisions",
          body: (
            <>
              <p>
                Each deliverable includes two rounds of revisions. In practice
                most projects use fewer, because the script stage surfaces the
                disagreements that would otherwise appear in the edit.
              </p>
              <p>
                A change of creative direction after a stage has been approved
                is a new brief rather than a revision, and is quoted as one.
                This is stated plainly because vagueness here is the most
                common cause of a project going wrong for both sides.
              </p>
            </>
          ),
        },
        {
          heading: "Payment",
          body: (
            <p>
              A deposit is payable before work starts, with the balance due on
              delivery. Exact amounts, schedule and currency are set out in the
              proposal for your project and take precedence over this page.
            </p>
          ),
        },
        {
          heading: "Ownership and rights",
          body: (
            <>
              <p>
                On final payment, everything produced for you is yours — raw
                footage, project files and exports. You should not have to come
                back to us to reuse something you paid for.
              </p>
              <p>
                Finished work may be shown as part of the {site.name} portfolio
                unless you ask otherwise. Tell us at any point and it comes
                down, without needing a reason.
              </p>
            </>
          ),
        },
        {
          heading: "What you provide",
          body: (
            <p>
              You confirm you have the right to use any footage, music, logos
              or other material you supply, and that using it as intended will
              not infringe anyone else&apos;s rights.
            </p>
          ),
        },
        {
          heading: "Cancellation",
          body: (
            <p>
              Either side can end an engagement in writing. Work completed up
              to that point is billed, anything not yet started is not, and any
              deposit is applied against work already done.
            </p>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              Work is delivered with reasonable skill and care. Liability in
              connection with any project is limited to the fees paid for that
              project, and does not extend to indirect or consequential loss,
              including lost revenue or lost audience.
            </p>
          ),
        },
        {
          heading: "Governing law",
          body: (
            <p>
              These terms are governed by the laws applying in{" "}
              {site.location}, and its courts have exclusive jurisdiction.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              {site.legalName} —{" "}
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
