import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    emoji: "🎯",
    title: "Välj din nivå",
    description: "Börja med SFI A om du är nybörjare, eller hoppa direkt till B, C eller D baserat på din nuvarande kunskapsnivå.",
  },
  {
    number: "02",
    emoji: "📚",
    title: "Studera & öva",
    description: "Gå igenom interaktiva lektioner med ordförråd, grammatik, läsning och uttal — anpassade till SFI-kursen.",
  },
  {
    number: "03",
    emoji: "💪",
    title: "Träna i Gymmet",
    description: "Repetera ord och fraser med vår SRS-gym — systemet väljer automatiskt vad du behöver öva mest.",
  },
  {
    number: "04",
    emoji: "🏛️",
    title: "Klara provet",
    description: "Förbered dig för samhällskunskapstestet med quizar om Sveriges historia, demokrati och kultur.",
  },
];

export default function QuickStartSection() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Swedish blue background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#006AA7]/5 via-muted/40 to-[#FECC02]/5 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl font-bold text-foreground">Din resa mot medborgarskapet</h2>
          <p className="mt-3 text-muted-foreground text-base">Fyra steg från nybörjare till ny medborgare</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative text-center"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[62%] w-[76%] h-px bg-border" />
              )}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#006AA7]/10 border border-[#006AA7]/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{step.emoji}</span>
              </div>
              <div className="text-xs font-bold text-[#006AA7] uppercase tracking-widest mb-1">{step.number}</div>
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Sweden facts strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-[#006AA7]/5 border border-[#006AA7]/15 p-8 text-center"
        >
          <div className="text-3xl mb-3">🇸🇪</div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Välkommen till Sverige
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Sverige är känt för sin demokrati, jämlikhet och innovationskultur. Lär dig språket och förstå samhället — det är nyckeln till en framgångsrik integration.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {["🗳️ Demokrati", "📚 Utbildning", "🏥 Välfärd", "🌿 Hållbarhet", "🤝 Jämlikhet", "🎶 Kultur"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/70 border border-[#006AA7]/20 text-sm text-foreground font-medium">
                {tag}
              </span>
            ))}
          </div>
          <Link to="/language">
            <Button className="gap-2 bg-[#006AA7] hover:bg-[#005a8e]">
              Börja nu <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}