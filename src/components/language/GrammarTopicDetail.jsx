import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";

const TOPIC_EXERCISES = {
  "A": {
    "V2 Rule (Verb Second)": {
      lesson: "The V2 (Verb Second) rule is fundamental to Swedish sentence structure. In main clauses, the finite verb always appears in the second position. This applies regardless of whether the sentence starts with the subject or another element like an adverbial or object.\n\n**Basic Pattern:**\nPosition 1: Subject → Position 2: Verb → Position 3+: Objects/Adverbials\n\n**Example with adverbial first:**\nPosition 1: Adverbial → Position 2: Verb → Position 3: Subject → Position 4+: Objects\n\nThis rule distinguishes Swedish from English, where the subject must come first in most cases.\n\n**Why V2 Matters:**\nSwedish requires the verb in the second position of the main clause. This is different from English where the subject always comes first. Understanding this rule is essential for constructing natural-sounding Swedish sentences.",
      exercises: [
        {
          question: "Complete the sentence: 'Varje morgon ____ jag kaffe.'",
          type: "fill-blank",
          answer: "dricker",
          options: ["drickar", "dricker", "dricka"]
        },
        {
          question: "Which sentence follows the V2 rule correctly?",
          type: "choice",
          options: [
            "Jag älskar äpplen.",
            "Svenska älskar jag.",
            "Älskar jag svenska."
          ],
          correct: 0
        },
        {
          question: "Rearrange: 'På fredagen går jag till skolan' - is this correct V2?",
          type: "choice",
          options: [
            "Yes, correct V2",
            "No, should be 'Jag går på fredagen till skolan'",
            "No, should be 'Till skolan går jag på fredagen'"
          ],
          correct: 0
        },
        {
          question: "Which is incorrect V2 order?",
          type: "choice",
          options: [
            "Jag äter frukt.",
            "Frukt äter jag.",
            "Frukt jag äter."
          ],
          correct: 2
        },
        {
          question: "Complete: 'Igår ____ jag en bra film.'",
          type: "fill-blank",
          answer: "såg",
          options: ["såg", "sett", "ser"]
        },
        {
          question: "Which V2 construction is correct?",
          type: "choice",
          options: [
            "Hemma sitter hon nu.",
            "Hon sitter hemma nu.",
            "Hemma hon sitter nu."
          ],
          correct: 0
        },
        {
          question: "Correct word order: 'Varje dag arbetar hon mycket'",
          type: "choice",
          options: [
            "Correct V2 order",
            "Should be: Varje dag hon arbetar mycket",
            "Should be: Hon varje dag arbetar mycket"
          ],
          correct: 0
        }
      ]
    },
    "Present Tense": {
      lesson: "Swedish present tense is formed by adding -r to the verb stem for most regular verbs. All persons (except infinitive) use the same form, making it simpler than many other languages.\n\n**Regular Conjugation:**\n- Jag/Du/Han/Hon/Vi/Ni/De + verb stem + r\n\n**Common Verbs:**\n- äta (eat) → äter\n- dricka (drink) → dricker\n- gå (go) → går\n- arbeta (work) → arbetar\n\n**Irregular Verbs:**\n- vara (be) → är\n- ha (have) → har\n- kunna (can) → kan\n- vilja (want) → vill",
      exercises: [
        {
          question: "Conjugate 'att tala' (to speak) in present: 'Jag ____ svenska.'",
          type: "fill-blank",
          answer: "talar",
          options: ["talar", "talr", "tala"]
        },
        {
          question: "Complete: 'Du ____ mycket bra Svenska!'",
          type: "fill-blank",
          answer: "talar",
          options: ["talar", "talr", "talat"]
        },
        {
          question: "What's the correct present tense? 'Vi ____ i Stockholm.'",
          type: "choice",
          options: [
            "bor",
            "boar",
            "bo"
          ],
          correct: 0
        },
        {
          question: "Conjugate 'dricka': 'Han ____ kaffe varje morgon.'",
          type: "fill-blank",
          answer: "dricker",
          options: ["dricker", "drickar", "dricka"]
        },
        {
          question: "Complete: 'Jag ____ (be) väldigt glad!'",
          type: "choice",
          options: [
            "är",
            "vara",
            "varit"
          ],
          correct: 0
        },
        {
          question: "What's correct? 'De ____ många böcker.'",
          type: "choice",
          options: [
            "har",
            "hava",
            "hade"
          ],
          correct: 0
        },
        {
          question: "Fill in: 'Jag ____ gärna läsa romaner.'",
          type: "fill-blank",
          answer: "älskar",
          options: ["älskar", "älskara", "älskat"]
        },
        {
          question: "Complete: 'Varje onsdag ____ vi fotboll.'",
          type: "fill-blank",
          answer: "spelar",
          options: ["spelar", "spela", "spelat"]
        }
      ]
    },
    "Definite & Indefinite Articles": {
      lesson: "Swedish nouns have gender (common or neuter) and definiteness (indefinite or definite).\n\n**Indefinite Articles:**\n- en (common gender): en bil, en dag\n- ett (neuter): ett hus, ett barn\n\n**Definite Forms:**\n- Suffix on noun: -en (common), -et (neuter): bilen, huset\n- Or with definite article: den/det + indefinite: den bilen, det huset\n\n**Pattern:**\nEach noun has a fixed gender that you must memorize.",
      exercises: [
        {
          question: "Which article is correct? '____ hus är stort.'",
          type: "choice",
          options: [
            "En",
            "Ett",
            "De"
          ],
          correct: 1
        },
        {
          question: "Complete: 'Jag har ____ (a cat).'",
          type: "fill-blank",
          answer: "en katt",
          options: ["en katt", "ett katt", "katt"]
        },
        {
          question: "Which is correct? '____ barn spelar i parken.'",
          type: "choice",
          options: [
            "En",
            "Ett",
            "Barnen"
          ],
          correct: 1
        },
        {
          question: "Definite form: '____ boken är intressant.'",
          type: "choice",
          options: [
            "En",
            "Det",
            "Den"
          ],
          correct: 2
        },
        {
          question: "Choose the correct article: '____ dag är vacker.'",
          type: "fill-blank",
          answer: "en",
          options: ["en", "ett", "de"]
        },
        {
          question: "Complete: '____ flicka läser ____ bok.'",
          type: "choice",
          options: [
            "En, en",
            "Ett, ett",
            "Den, ett"
          ],
          correct: 0
        }
      ]
    }
  },
  "B": {
    "Past Tense (Preterit & Perfect)": {
      lesson: "Swedish has two main past tenses: Preterit (simple past) and Perfect (present perfect).\n\n**Preterit (Simple Past):**\n- Regular: verb + -ade, -ede, or -te\n- arbetar → arbetade\n- studerar → studerade\n\n**Perfect (Present Perfect):**\n- har + past participle\n- har arbetat, har studerat\n- Used for recent actions with present relevance\n\n**Irregular Past Forms:**\n- äta → åt, ha ätit\n- dricka → drack, ha druckit\n- gå → gick, ha gått\n- komma → kom, ha kommit\n\n**When to use each:**\n- Preterit: with time markers like 'igår', 'förra veckan'\n- Perfect: for recent actions or without time markers",
      exercises: [
        {
          question: "Which is the correct preterit form of 'äta'?",
          type: "choice",
          options: ["äta", "åt", "ätade"],
          correct: 1
        },
        {
          question: "Complete: 'Igår jag ____ hemma.'",
          type: "fill-blank",
          answer: "var",
          options: ["var", "varit", "är"]
        },
        {
          question: "What's correct? 'Han ____ aldrig varit i Sverige.'",
          type: "choice",
          options: [
            "har",
            "hade",
            "är"
          ],
          correct: 0
        },
        {
          question: "Fill in the preterit: 'Vi ____ (drink) kaffe förra morgon.'",
          type: "fill-blank",
          answer: "drack",
          options: ["drack", "druckit", "drickar"]
        },
        {
          question: "Which is the perfect form? 'Jag ____ (go) till skolan.'",
          type: "choice",
          options: [
            "gick",
            "ha gått",
            "går"
          ],
          correct: 1
        },
        {
          question: "Complete: 'De ____ en mycket bra film igår.'",
          type: "fill-blank",
          answer: "såg",
          options: ["såg", "sett", "ser"]
        },
        {
          question: "Correct form? 'Jag ____ redan ätit middag.'",
          type: "choice",
          options: [
            "har",
            "hade",
            "åt"
          ],
          correct: 0
        },
        {
          question: "Fill in: 'Två år sedan ____ (move) vi här.'",
          type: "fill-blank",
          answer: "flyttade",
          options: ["flyttade", "har flyttat", "flytta"]
        }
      ]
    },
    "Adjective Agreement": {
      lesson: "Swedish adjectives must agree with the gender and number of the noun they modify.\n\n**Common Gender (en-words):**\n- No ending in singular indefinite: en vacker dag\n- Add -a in plural: vackra dagar\n\n**Neuter Gender (ett-words):**\n- Add -t in singular indefinite: ett vackert hus\n- Add -a in plural: vackra hus\n\n**Definite Forms:**\n- Add -a for all genders: den/det vackra + noun\n\n**Common Adjective Patterns:**\n- stor (big) → stort (neuter) → stora (plural/definite)\n- ny (new) → nytt (neuter) → nya (plural/definite)\n- röd (red) → rött (neuter) → röda (plural/definite)",
      exercises: [
        {
          question: "Which is correct? '____ dag är vacker.'",
          type: "choice",
          options: [
            "En vacker",
            "Et vackert",
            "De vackra"
          ],
          correct: 0
        },
        {
          question: "Complete: 'Ett ____ (new) hus.'",
          type: "fill-blank",
          answer: "nytt",
          options: ["ny", "nytt", "nya"]
        },
        {
          question: "Choose: 'De är ____ (tall) pojkar.'",
          type: "choice",
          options: [
            "långe",
            "lång",
            "långa"
          ],
          correct: 2
        },
        {
          question: "Fill in: 'En ____ (red) appel.'",
          type: "fill-blank",
          answer: "röd",
          options: ["röd", "rött", "röda"]
        },
        {
          question: "Which adjective form is correct? '____ äpplen.'",
          type: "choice",
          options: [
            "De röda",
            "De rött",
            "De röd"
          ],
          correct: 0
        },
        {
          question: "Complete: 'Ett ____ (small) barn.'",
          type: "fill-blank",
          answer: "litet",
          options: ["lite", "litet", "lita"]
        }
      ]
    },
    "Reflexive Verbs": {
      lesson: "Reflexive verbs have an action directed back to the subject. In Swedish, reflexive pronouns are: mig (me), dig (you), sig (him/her/it/them), oss (us).\n\n**Common Reflexive Verbs:**\n- tvätta sig (to wash oneself)\n- klä sig (to dress oneself)\n- sätta sig (to sit down)\n- väcka sig (to wake up)\n- känna sig (to feel)\n- skäma sig (to be ashamed)\n\n**Pattern:**\nSubject + reflexive verb + reflexive pronoun\nJag tvättar mig. (I wash myself.)",
      exercises: [
        {
          question: "Complete: 'Han ____ sina händer varje dag.'",
          type: "fill-blank",
          answer: "tvättar sig",
          options: ["tvättar", "tvättar sig", "tvättade"]
        },
        {
          question: "Which is correct? 'Jag ____ glad idag.'",
          type: "choice",
          options: [
            "känner mig",
            "känner",
            "känt mig"
          ],
          correct: 0
        },
        {
          question: "Fill in: 'Vi ____ i soffan och tittar på film.'",
          type: "fill-blank",
          answer: "sätter oss",
          options: ["sätter", "sätter oss", "sat oss"]
        }
      ]
    }
  },
  "C": {
    "Conditional Mood": {
      lesson: "The conditional mood expresses wishes, hypotheticals, and polite requests. In Swedish, it's formed with 'skulle' + infinitive.\n\n**Conditional Present:**\n- skulle + infinitive\n- Jag skulle vilja äta. (I would like to eat.)\n\n**Conditional Past:**\n- skulle ha + past participle\n- Jag skulle ha kommit. (I would have come.)\n\n**Uses:**\n- Expressing wishes: Jag skulle vilja... (I would like...)\n- Hypotheticals: Om jag hade tid, skulle jag läsa.\n- Polite requests: Skulle du kunna hjälpa mig?\n\n**Example with om-clause:**\nOm + Past (hade) → skulle + infinitive",
      exercises: [
        {
          question: "Complete: 'Jag ____ vilja åka till Sverige.'",
          type: "fill-blank",
          answer: "skulle",
          options: ["skulle", "ska", "vill"]
        },
        {
          question: "Which is correct conditional? 'Om jag hade tid, jag ____ läsa mer.'",
          type: "choice",
          options: [
            "skulle",
            "vill",
            "kan"
          ],
          correct: 0
        },
        {
          question: "Fill in: 'Det ____ vara trevligt om du komit.'",
          type: "fill-blank",
          answer: "skulle",
          options: ["skulle", "ska", "kan"]
        },
        {
          question: "Past conditional: 'Om vi hade kunnat, vi ____ gå på resan.'",
          type: "choice",
          options: [
            "skulle ha gått",
            "hade gått",
            "går"
          ],
          correct: 0
        },
        {
          question: "Complete politely: '____ du kunna hjälpa mig?'",
          type: "fill-blank",
          answer: "Skulle",
          options: ["Skulle", "Kan", "Vill"]
        }
      ]
    },
    "Passive Voice": {
      lesson: "The passive voice focuses on the action rather than the subject. In Swedish, it's formed with -s ending or 'bli' + past participle.\n\n**-s Form (Most Common):**\n- Present: läsa → läses (is read)\n- Past: läste → lästes (was read)\n\n**bli + Past Participle:**\n- Present: bli + läst (is read)\n- Past: blev + lästes (was read)\n\n**Pattern:**\nActive: Han läser boken. (He reads the book.)\nPassive: Boken läses. (The book is read.)\nor Boken blir läst.\n\n**When the agent (doer) is mentioned:**\nBoken läses av honom. (The book is read by him.)",
      exercises: [
        {
          question: "Convert to passive: 'De byggde huset år 1990.'",
          type: "choice",
          options: [
            "Huset byggdes år 1990.",
            "Huset bygga året 1990.",
            "Huset var byggat år 1990."
          ],
          correct: 0
        },
        {
          question: "Which passive form is correct? 'Boken ____ av miljoner.'",
          type: "choice",
          options: [
            "läses",
            "läsa",
            "läst"
          ],
          correct: 0
        },
        {
          question: "Complete the passive: 'En ny väg ____ i området.'",
          type: "fill-blank",
          answer: "byggs",
          options: ["byggs", "byggdes", "bygga"]
        },
        {
          question: "Transform to passive: 'De serverade middag kl 19.'",
          type: "choice",
          options: [
            "Middag serverades kl 19.",
            "Middag serva kl 19.",
            "Middag blev serverad kl 19."
          ],
          correct: 0
        }
      ]
    },
    "Participles": {
      lesson: "Participles are verb forms that function as adjectives. Swedish has present participles (-ande) and past participles (-ad/-t/-en).\n\n**Present Participles (-ande):**\n- springande (running)\n- sittande (sitting)\n- Used actively: a running child\n\n**Past Participles (-ad, -t, -en):**\n- bruten (broken)\n- målad (painted)\n- älskad (loved)\n- Used passively or completed action\n\n**Agreement:**\nLike adjectives, participles agree with noun gender/number:\n- springande pojkar (running boys)\n- springande flicka (running girl)",
      exercises: [
        {
          question: "Which participle is correct? 'En ____ pojke.'",
          type: "fill-blank",
          answer: "springande",
          options: ["springandes", "springande", "springad"]
        },
        {
          question: "Complete: '____ fönstret behöver repareras.'",
          type: "choice",
          options: [
            "Bruten",
            "Brustet",
            "Bruten"
          ],
          correct: 0
        },
        {
          question: "Which is correct? '____ barn.'",
          type: "fill-blank",
          answer: "sovande",
          options: ["sövande", "sovad", "sovande"]
        },
        {
          question: "Choose: 'En ____ vägg är fin.'",
          type: "choice",
          options: [
            "målade",
            "målad",
            "målande"
          ],
          correct: 1
        }
      ]
    }
  },
  "D": {
    "Advanced Sentence Construction": {
      lesson: "At advanced levels, master complex nested clauses, formal constructions, and stylistic variations. Understanding these structures enables reading of academic texts and formal communication.\n\n**Complex Patterns:**\n- Multiple subordinate clauses\n- Participial constructions\n- Passive voice in formal contexts\n- Formal 'det är' constructions: Det är viktigt att vi förstår.\n\n**Nested Subordinate Clauses:**\nJag vet att han tror att vi skall komma.\n(I know that he believes that we will come.)\n\n**Formal Markers:**\n- 'Vilket' (which) for additional clauses\n- 'Således' (thus) for conclusions\n- 'Väl' for emphasis in questions",
      exercises: [
        {
          question: "Complete formally: 'Det är viktigt att ____ kommer tidigt.'",
          type: "choice",
          options: [
            "vi",
            "du",
            "hen"
          ],
          correct: 0
        },
        {
          question: "Which is the most formal? '____ många städer är stora.'",
          type: "choice",
          options: [
            "Många städer är stora.",
            "I många städer är det stora.",
            "Det finns många stora städer."
          ],
          correct: 2
        },
        {
          question: "Complete the nested clause: 'Jag vet att han tror att vi ____ komma.'",
          type: "fill-blank",
          answer: "ska",
          options: ["ska", "skall", "kommer"]
        },
        {
          question: "Which sentence has correct formal structure?",
          type: "choice",
          options: [
            "Eftersom vi studerar engelska, vi studerar också svenska.",
            "Eftersom vi studerar engelska, studerar vi också svenska.",
            "Vi studerar engelska, också svenska."
          ],
          correct: 1
        }
      ]
    },
    "Subjunctive Mood": {
      lesson: "The subjunctive mood is rare in modern Swedish but appears in formal wishes and archaic expressions.\n\n**Forms:**\n- Present subjunctive: 'Leve kungen!' (Long live the king!)\n- 'Må' + infinitive (archaic): 'Må du ha lycka!' (May you be lucky!)\n\n**Modern Usage:**\n- Mostly in set phrases and traditional expressions\n- Often replaced by conditional 'skulle' in modern Swedish\n- Found in formal/literary contexts\n\n**Examples:**\n- Leve Sverige! (Long live Sweden!)\n- Må du vara glad! (May you be happy!) - archaic\n\n**Note:**\nMost subjunctive functions are now expressed using 'skulle' or other constructions in contemporary Swedish.",
      exercises: [
        {
          question: "Which is a subjunctive expression?",
          type: "choice",
          options: [
            "Leve kungen!",
            "Kungens liv är långt.",
            "Vi älskar kungen."
          ],
          correct: 0
        },
        {
          question: "Complete the formal wish: 'Må du ____ lycka!'",
          type: "fill-blank",
          answer: "ha",
          options: ["ha", "hava", "hade"]
        },
        {
          question: "Which expresses formal distance (subjunctive-like)?",
          type: "choice",
          options: [
            "Om han skulle komma...",
            "Om han kom...",
            "Om han kommer..."
          ],
          correct: 0
        }
      ]
    },
    "Stylistic Variations & Registers": {
      lesson: "Swedish varies by formality level and context. Understanding these registers is essential for appropriate communication.\n\n**Formal Swedish (Officiellt):**\n- Ni (plural you) in formal settings\n- Skall instead of ska\n- Longer, complex sentences\n- Passive constructions\n\n**Colloquial/Informal (Vardagligt):**\n- Du/dej in casual settings\n- Shorter sentences\n- Intensifiers like 'jätte-', 'super-'\n- Dropped endings\n\n**Regional Variations:**\n- Dalamalska, Skånska, etc.\n- Different pronunciation and vocabulary\n\n**Professional Registers:**\n- Legal: strict formal standards\n- Medical: technical terminology\n- Academic: complex structure and vocabulary",
      exercises: [
        {
          question: "Which is the most formal?",
          type: "choice",
          options: [
            "Du pratar mycket.",
            "Ni pratar mycket.",
            "Du e jätte pratös."
          ],
          correct: 1
        },
        {
          question: "Which sounds informal/colloquial?",
          type: "choice",
          options: [
            "Jag är väldigt glad.",
            "Jag är jätteglad.",
            "Min väl etablerade glädje."
          ],
          correct: 1
        },
        {
          question: "Which is neutral Swedish?",
          type: "choice",
          options: [
            "Skynda dej!",
            "Skynda på!",
            "Skynda dig!"
          ],
          correct: 2
        },
        {
          question: "Which sounds most professional?",
          type: "choice",
          options: [
            "Vi ska kolla på det.",
            "Vi skall granska det.",
            "Vi e på det."
          ],
          correct: 1
        }
      ]
    },
    "Idiomatic Expressions": {
      lesson: "Swedish has unique idioms and expressions that reflect the culture and language nuances.\n\n**Common Idioms:**\n- Det är ju inte raketen! (It's not rocket science!)\n- Det är inte min hund. (It's not my problem.)\n- Att få kål för öronen. (To get a scolding.)\n- Ha ett ben att stå på. (To have a solid argument.)\n- Lägga sitt hjärta på något. (To be passionate about something.)\n- Komma med en höna. (To come up with something trivial.)\n- Slå två flugor i en smäll. (To kill two birds with one stone.)\n\n**Learning Strategy:**\nSee idioms in context, understand their literal meaning first, then their figurative meaning.",
      exercises: [
        {
          question: "What does 'Det är ju inte raketen!' mean?",
          type: "choice",
          options: [
            "It's definitely not the rocket.",
            "It's not rocket science! (i.e., it's simple)",
            "There's no rocket involved."
          ],
          correct: 1
        },
        {
          question: "Meaning of 'Det är inte min hund':",
          type: "choice",
          options: [
            "I don't have a dog.",
            "It's not my problem/business.",
            "The dog is not mine."
          ],
          correct: 1
        },
        {
          question: "What does 'Att få kål för öronen' mean?",
          type: "choice",
          options: [
            "To get cabbage for the ears.",
            "To get a scolding/telling-off.",
            "To buy vegetables."
          ],
          correct: 1
        },
        {
          question: "Meaning of 'Ha ett ben att stå på':",
          type: "choice",
          options: [
            "To have one leg to stand on.",
            "To have a solid argument or foundation.",
            "To be disabled."
          ],
          correct: 1
        },
        {
          question: "What does 'Slå två flugor i en smäll' mean?",
          type: "choice",
          options: [
            "To hit two flies at once.",
            "To kill two birds with one stone.",
            "To swat insects."
          ],
          correct: 1
        }
      ]
    }
  }
};

export default function GrammarTopicDetail({ topic, level, onBack }) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const topicData = TOPIC_EXERCISES[level]?.[topic.title];
  const exercises = topicData?.exercises || [];
  const allExercises = generatedQuestions.length > 0 ? generatedQuestions : exercises;
  const currentEx = allExercises[currentExercise];

  const handleAnswer = (answer, isCorrect) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExercise + 1 >= allExercises.length) {
      setExercisesCompleted(1);
    } else {
      setCurrentExercise(c => c + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const resetExercises = () => {
    setCurrentExercise(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setScore(0);
    setExercisesCompleted(0);
  };

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const topicData = TOPIC_EXERCISES[level]?.[topic.title];
      const response = await base44.functions.invoke('generateGrammarQuestions', {
        topic: topicData?.lesson || '',
        level,
        currentTopicTitle: topic.title
      });

      if (response.data.success) {
        setGeneratedQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{topic.title}</h2>
          <p className="text-muted-foreground mt-1">{topic.description}</p>
        </div>
        <Badge>{level}</Badge>
      </div>

      {/* Generate Button */}
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={handleGenerateQuestions} 
          disabled={generatingQuestions}
          className="gap-2"
        >
          {generatingQuestions ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating 50 Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate 50 Questions
            </>
          )}
        </Button>
        {generatedQuestions.length > 0 && (
          <Badge variant="secondary">{generatedQuestions.length} AI Questions Generated</Badge>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="lesson" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lesson">📖 Lesson</TabsTrigger>
          <TabsTrigger value="examples">💡 Examples</TabsTrigger>
          {(exercises.length > 0 || generatedQuestions.length > 0) && <TabsTrigger value="practice">✍️ Practice</TabsTrigger>}
        </TabsList>

        {/* Lesson Tab */}
        <TabsContent value="lesson">
          <Card className="border-border/50">
            <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
              <div className="space-y-4 text-foreground">
                {topicData?.lesson?.split("\n\n").map((paragraph, idx) => (
                  <div key={idx}>
                    {paragraph.split("\n").map((line, lidx) => (
                      <p key={lidx} className="text-muted-foreground leading-relaxed">
                        {line.includes("**") ? (
                          <>
                            {line.split("**").map((part, pidx) =>
                              pidx % 2 === 0 ? part : <strong className="text-foreground font-semibold">{part}</strong>
                            )}
                          </>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Key Points */}
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Key Point</h4>
                <p className="text-amber-900 dark:text-amber-100">{topic.keyPoint}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples">
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Example</h4>
                <p className="text-blue-900 dark:text-blue-100 italic text-lg">{topic.example}</p>
              </div>

              {/* Additional examples for context */}
              <div className="space-y-3">
                <h4 className="font-semibold">More Examples:</h4>
                {level === "A" && topic.title === "V2 Rule (Verb Second)" && (
                  <>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Subject first:</strong> Jag älskar äpplen. (I love apples.)</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Adverbial first:</strong> Idag går jag till skolan. (Today I go to school.)</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Object first:</strong> Mat äter jag varje dag. (Food I eat every day.)</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        {(exercises.length > 0 || generatedQuestions.length > 0) && (
          <TabsContent value="practice">
            <AnimatePresence mode="wait">
              {exercisesCompleted ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center space-y-6">
                      <h3 className="text-2xl font-bold">Great Job! 🎉</h3>
                      <div className="text-5xl font-bold text-primary">
                        {Math.round((score / allExercises.length) * 100)}%
                      </div>
                      <p className="text-muted-foreground">{score} of {allExercises.length} correct</p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Button onClick={resetExercises} variant="outline">Try Again</Button>
                        <Button onClick={() => {
                          setGeneratedQuestions([]);
                          resetExercises();
                        }}>Back to Options</Button>
                        <Button onClick={onBack}>Back to Grammar</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : currentEx ? (
                <motion.div key={currentExercise} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <Card className="border-border/50">
                    <CardContent className="p-6 space-y-6">
                      {/* Progress */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">
                          Exercise {currentExercise + 1} of {allExercises.length}
                        </span>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${((currentExercise + 1) / allExercises.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Question */}
                      <h3 className="text-xl font-bold">{currentEx.question}</h3>

                      {/* Options */}
                      {(currentEx.type === "choice" || currentEx.type === "multiple-choice") && (
                        <div className="space-y-3">
                          {(currentEx.options || []).map((option, idx) => {
                            const isCorrect = currentEx.answer === option || idx === currentEx.correct;
                            const isSelected = selectedAnswer === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => !answered && handleAnswer(idx, isCorrect)}
                                disabled={answered}
                                className={`w-full p-4 rounded-lg text-left font-medium transition-all border-2 ${
                                  isSelected
                                    ? isCorrect
                                      ? "border-green-400 bg-green-50 dark:bg-green-950/30"
                                      : "border-red-400 bg-red-50 dark:bg-red-950/30"
                                    : answered && isCorrect
                                    ? "border-green-400 bg-green-50 dark:bg-green-950/30"
                                    : "border-border hover:border-primary"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option}</span>
                                  {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                  {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Fill blank */}
                      {currentEx.type === "fill-blank" && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Type your answer..."
                            className="w-full p-3 border-2 border-border rounded-lg focus:border-primary outline-none"
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !answered) {
                                const isCorrect = e.target.value.toLowerCase() === currentEx.answer.toLowerCase();
                                handleAnswer(e.target.value, isCorrect);
                              }
                            }}
                            disabled={answered}
                          />
                          {answered && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <p className="text-sm text-blue-900 dark:text-blue-100">
                                <strong>Correct answer:</strong> {currentEx.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explanation */}
                      {answered && currentEx.explanation && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>Explanation:</strong> {currentEx.explanation}
                          </p>
                        </div>
                      )}

                      {/* Next Button */}
                      {answered && (
                        <Button onClick={handleNextExercise} className="w-full">
                          {currentExercise + 1 >= allExercises.length ? "See Results" : "Next Exercise"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}