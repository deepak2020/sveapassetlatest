import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Landmark, Dumbbell } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Tillbaka · <em>Back</em>
      </Link>

      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold text-foreground mb-3">
          Om Sveapasset · <em className="text-muted-foreground font-normal">About Sveapasset</em>
        </h1>
        <p className="text-lg text-muted-foreground">
          Din väg till integration i Sverige — språk, samhälle och medborgarskap.
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed">
        <p>
          <strong>Sveapasset</strong> is a free learning platform built to help newcomers to Sweden prepare for life, language
          and citizenship. We combine Swedish for Immigrants (SFI) lessons across all four courses — A, B, C and D — with
          civic knowledge based on <em>Sverige i Fokus</em>, the official orientation curriculum used in Swedish
          municipalities. Every lesson is bilingual: Swedish on top, English translation below, so you can learn faster and
          understand more deeply.
        </p>

        <p>
          The app is designed for <strong>adult immigrants, refugees and EU residents</strong> who want to pass the SFI
          national tests, succeed in the upcoming Swedish citizenship test (medborgarskapsprov), or simply build the everyday
          language skills needed to work, study and live in Sweden. Whether you are a complete beginner taking your first
          steps in Swedish or an advanced learner polishing your grammar for Kurs D, Sveapasset adapts to your level with
          structured topics, interactive exercises and a spaced-repetition gym for vocabulary practice.
        </p>

        <p>
          Inside the app you will find <strong>vocabulary flashcards, fill-in-the-blanks, listening drills, writing prompts,
          speaking practice and quiz challenges</strong>. The "Träning" gym uses cloze-deletion sentences and spaced
          repetition to lock new words into long-term memory, while the civic section walks you through democracy, rights,
          history, geography and Swedish culture — exactly what you need for the citizenship test launching in 2027.
        </p>

        <p>
          Sveapasset is built by a small independent team of educators, developers and Swedish-language enthusiasts who
          believe that integration starts with access to high-quality, free learning material. We are not affiliated with
          any government agency. Content is informed by the official SFI course plan (Skolverket) and <em>Sverige i Fokus</em>,
          but the platform is independently produced.
        </p>

        <p>
          Have feedback, found an error, or want to contribute a lesson? Visit our{" "}
          <Link to="/contact" className="text-primary underline underline-offset-2 hover:text-primary/80">contact page</Link>{" "}
          — we read every message.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FeatureTile icon={BookOpen} title="Språk" subtitle="Language — SFI A–D" />
        <FeatureTile icon={Landmark} title="Samhälle" subtitle="Civics — Sverige i Fokus" />
        <FeatureTile icon={Dumbbell} title="Träning" subtitle="Daily SRS gym" />
      </div>
    </div>
  );
}

function FeatureTile({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <Icon className="w-6 h-6 text-primary mb-3" />
      <p className="font-display font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground italic">{subtitle}</p>
    </div>
  );
}