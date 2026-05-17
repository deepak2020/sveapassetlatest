import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Tillbaka · Back
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Integritetspolicy</h1>
          <p className="text-muted-foreground italic text-sm">Privacy Policy</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-10">
        Senast uppdaterad · <em>Last updated:</em> 17 maj 2026
      </p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">

        <Section
          sv={{
            title: "1. Vem är ansvarig?",
            body:
              "Sveapasset är ett gratis, icke-kommersiellt utbildningsprojekt som hjälper personer att förbereda sig för SFI och det svenska medborgarskapsprovet. Vi tar inte emot några betalningar. Kontakta oss på: hello@sveapasset.se",
          }}
          en={{
            title: "Who is responsible?",
            body:
              "Sveapasset is a free, non-commercial educational project that helps people prepare for SFI and the Swedish citizenship test. We do not accept any payments. Contact us at: hello@sveapasset.se",
          }}
        />

        <Section
          sv={{
            title: "2. Vilka uppgifter samlar vi in?",
            body:
              "När du skapar ett konto sparar vi: din e-postadress, ditt namn (om du anger det), dina lektionsframsteg, XP-poäng, ordförråd och quizresultat. Vi samlar inte in onödig information.",
          }}
          en={{
            title: "What data do we collect?",
            body:
              "When you create an account we store: your email address, your name (if provided), your lesson progress, XP, vocabulary lists, and quiz results. We do not collect unnecessary information.",
          }}
        />

        <Section
          sv={{
            title: "3. Varför?",
            body:
              "För att kunna ge dig en personlig lärupplevelse, spara dina framsteg mellan sessioner och förbättra tjänsten. Rättslig grund: berättigat intresse och ditt samtycke vid kontoregistrering.",
          }}
          en={{
            title: "Why?",
            body:
              "To give you a personalised learning experience, save your progress between sessions, and improve the service. Legal basis: legitimate interest and your consent when you register.",
          }}
        />

        <Section
          sv={{
            title: "4. Vilka delar vi data med?",
            body:
              "Vi delar data med våra tekniska underleverantörer: Base44 (vår tjänsteplattform och databas) och Anthropic (AI som driver innehållsgenerering). Vi säljer aldrig dina uppgifter till tredje part.",
          }}
          en={{
            title: "Who do we share data with?",
            body:
              "We share data with our technical sub-processors: Base44 (our hosting platform and database) and Anthropic (AI provider used for content generation). We never sell your data to third parties.",
          }}
        />

        <Section
          sv={{
            title: "5. Cookies",
            body:
              "Vi använder endast nödvändiga cookies för att hålla dig inloggad och spara dina inställningar (t.ex. mörkt läge). Vi använder inga spårnings- eller marknadsföringscookies.",
          }}
          en={{
            title: "Cookies",
            body:
              "We only use essential cookies to keep you logged in and remember your settings (e.g. dark mode). We do not use tracking or marketing cookies.",
          }}
        />

        <Section
          sv={{
            title: "6. Hur länge sparar vi data?",
            body:
              "Så länge ditt konto är aktivt. När du begär radering tar vi bort alla dina personuppgifter inom 30 dagar.",
          }}
          en={{
            title: "How long do we keep data?",
            body:
              "As long as your account is active. When you request deletion, we remove all your personal data within 30 days.",
          }}
        />

        <Section
          sv={{
            title: "7. Dina rättigheter (GDPR)",
            body:
              "Du har rätt att begära tillgång till, rättelse av eller radering av dina uppgifter, samt att invända mot behandlingen. Kontakta oss på hello@sveapasset.se. Du kan också lämna klagomål till Integritetsskyddsmyndigheten (IMY) — imy.se.",
          }}
          en={{
            title: "Your rights (GDPR)",
            body:
              "You have the right to access, correct, or delete your data, and to object to processing. Contact us at hello@sveapasset.se. You may also file a complaint with the Swedish Authority for Privacy Protection (IMY) — imy.se.",
          }}
        />

        <Section
          sv={{
            title: "8. Ändringar",
            body:
              "Vi kan uppdatera denna policy. Datum för senaste uppdatering visas ovan.",
          }}
          en={{
            title: "Changes",
            body:
              "We may update this policy. The last-updated date is shown above.",
          }}
        />

      </div>
    </div>
  );
}

function Section({ sv, en }) {
  return (
    <section className="border-l-2 border-primary/20 pl-5">
      <h2 className="font-display text-xl font-semibold text-foreground mb-1">{sv.title}</h2>
      <p className="text-xs uppercase tracking-wide text-muted-foreground/70 italic mb-3">{en.title}</p>
      <p className="text-foreground leading-relaxed mb-2">{sv.body}</p>
      <p className="text-muted-foreground italic leading-relaxed text-sm">{en.body}</p>
    </section>
  );
}