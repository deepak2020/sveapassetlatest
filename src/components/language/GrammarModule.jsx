import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, XCircle, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GrammarTopicDetail from "./GrammarTopicDetail";
import GenerateGrammarContentModal from "./GenerateGrammarContentModal";
import { useAuth } from "@/lib/AuthContext";

const GRAMMAR_TOPICS = [
  {
    level: "A",
    topics: [
      {
        title: "V2 Rule (Verb Second)",
        description: "Main verb comes in second position in main clauses",
        example: "Jag äter äpplen. (I eat apples.)",
        keyPoint: "Subject + Verb + Object"
      },
      {
        title: "Present Tense",
        description: "Basic present tense conjugation",
        example: "Jag är glad. Du är tröttad. Han/Hon är sjuk.",
        keyPoint: "-ar endings for regular verbs"
      },
      {
        title: "Definite & Indefinite Articles",
        description: "Swedish gender and article usage",
        example: "en hus (a house), ett hus (the house)",
        keyPoint: "en (common), ett (neuter), definite suffix -en/-et"
      },
      {
        title: "Imperative Form",
        description: "Commands and instructions",
        example: "Ät frukt! Drick vatten!",
        keyPoint: "Verb stem without ending"
      }
    ]
  },
  {
    level: "B",
    topics: [
      {
        title: "Past Tense (Preterit & Perfect)",
        description: "Describing past events",
        example: "Jag åt äpplen. Jag har ätit äpplen.",
        keyPoint: "-ade, -ede endings or irregular forms"
      },
      {
        title: "Adjective Agreement",
        description: "Adjectives must agree with noun gender",
        example: "en vacker dag, ett vackert hus",
        keyPoint: "Add -t for neuter, -a for plural"
      },
      {
        title: "Subordinate Clauses",
        description: "Complex sentences with subordination",
        example: "Jag vet att han kommer. Om jag har tid...",
        keyPoint: "Word order changes in subordinate clauses"
      },
      {
        title: "Reflexive Verbs",
        description: "Actions directed back to the subject",
        example: "Han tvättar sig. (He washes himself.)",
        keyPoint: "sig/mig/dig/oss pronouns"
      }
    ]
  },
  {
    level: "C",
    topics: [
      {
        title: "Conditional Mood",
        description: "Expressing wishes and hypotheticals",
        example: "Jag skulle vilja äta. Om jag hade tid...",
        keyPoint: "skulle + infinitive"
      },
      {
        title: "Passive Voice",
        description: "Action without focus on subject",
        example: "Huset byggdes år 1900. (The house was built in 1900.)",
        keyPoint: "-ades/-edes or bli + past participle"
      },
      {
        title: "Participles",
        description: "Present and past participles",
        example: "springande flicka, bruten arm",
        keyPoint: "-ande, -ad/-t endings"
      },
      {
        title: "Complex Word Order",
        description: "Advanced Swedish sentence structure",
        example: "På fredagen gick jag till biografen.",
        keyPoint: "Adverbials often placed before verb"
      }
    ]
  },
  {
    level: "D",
    topics: [
      {
        title: "Subjunctive Mood",
        description: "Formal expressions and wishes",
        example: "Leve kungen! (Long live the king!)",
        keyPoint: "Rare in modern Swedish, mainly in set phrases"
      },
      {
        title: "Advanced Sentence Construction",
        description: "Complex nested clauses",
        example: "Det är viktigt att vi förstår vad han menar.",
        keyPoint: "Balancing multiple clauses"
      },
      {
        title: "Stylistic Variations",
        description: "Register and formality levels",
        example: "Du talar vs Ni talar vs Dere talar",
        keyPoint: "Formal, informal, regional differences"
      },
      {
        title: "Idiomatic Expressions",
        description: "Common Swedish phrases and expressions",
        example: "Det är ju inte raketen! (It's not rocket science!)",
        keyPoint: "Cultural and linguistic nuances"
      }
    ]
  }
];

// Grammar practice quizzes
const GRAMMAR_QUIZZES = {
  "A": [
    {
      id: 1,
      title: "V2 Rule (Verb Second)",
      description: "Master the fundamental verb-second rule in Swedish",
      questions: [
        {
          question: "Which sentence follows the V2 rule correctly?",
          options: [
            "Jag älskar svenska.",
            "Svenska älskar jag.",
            "Älskar jag svenska."
          ],
          correct: 0,
          explanation: "In main clauses, the finite verb comes in second position: Subject + Verb + Object."
        },
        {
          question: "Correct the word order: 'Idag jag går till skolan'",
          options: [
            "Idag går jag till skolan",
            "Jag idag går till skolan",
            "Går jag idag till skolan"
          ],
          correct: 0,
          explanation: "When an adverbial starts the sentence, the verb still comes second: Adverbial + Verb + Subject + Rest"
        },
        {
          question: "Pick the correctly ordered sentence:",
          options: [
            "Varje dag äter hon frukt.",
            "Varje dag hon äter frukt.",
            "Hon äter varje dag frukt."
          ],
          correct: 0,
          explanation: "Frequency adverbials typically come after the verb in Swedish."
        },
        {
          question: "Which word order is correct? 'På morgonen... hom dricka kaffe.'",
          options: [
            "På morgonen dricka hon kaffe.",
            "På morgonen hon dricka kaffe.",
            "På morgonen drickar hon kaffe."
          ],
          correct: 2,
          explanation: "Adverbial + Verb + Subject requires correct verb conjugation (drickar for 3rd person)."
        },
        {
          question: "Select the correct sentence:",
          options: [
            "Jag inte älskar bonen.",
            "Jag älskar inte bonen.",
            "Jag älskar bonen inte."
          ],
          correct: 1,
          explanation: "Negation 'inte' comes after the verb in the main clause position."
        },
        {
          question: "What is the correct word order? 'Min vän läser boken varje kväll.'",
          options: [
            "Min vän läser boken varje kväll.",
            "Min vän varje kväll läser boken.",
            "Läser min vän boken varje kväll."
          ],
          correct: 0,
          explanation: "Subject + Verb is the natural word order; time expressions come at the end."
        },
        {
          question: "Choose the correctly ordered sentence:",
          options: [
            "Igår såg jag en film.",
            "Igår jag såg en film.",
            "Jag igår såg en film."
          ],
          correct: 0,
          explanation: "Time adverbials at the beginning trigger V2: Adverbial + Verb + Subject"
        }
      ]
    },
    {
      id: 2,
      title: "Present Tense Conjugation",
      description: "Practice present tense verb endings and forms",
      questions: [
        {
          question: "Which form is correct? 'Han ____ äpplen.'",
          options: [
            "ät",
            "äter",
            "äta"
          ],
          correct: 1,
          explanation: "Third person singular present tense adds -r to the stem: äta → äter"
        },
        {
          question: "Complete: 'Vi ____ svenska varje dag.'",
          options: [
            "studera",
            "studerar",
            "studerera"
          ],
          correct: 1,
          explanation: "First person plural also uses -r ending: studerar"
        },
        {
          question: "Jag ____ kaffe varje morgon.",
          options: [
            "drickar",
            "dricka",
            "drickade"
          ],
          correct: 0,
          explanation: "First person singular also gets -r: dricka → drickar"
        },
        {
          question: "Du ____ svenska mycket bra!",
          options: [
            "talar",
            "tala",
            "talte"
          ],
          correct: 0,
          explanation: "Second person singular: tala → talar"
        },
        {
          question: "Vi ____ i en liten lägenhet.",
          options: [
            "bo",
            "bor",
            "bora"
          ],
          correct: 1,
          explanation: "Plural forms add -r: bo → bor"
        },
        {
          question: "Hon ____ med sin familj på helgerna.",
          options: [
            "spelar",
            "spela",
            "spelat"
          ],
          correct: 0,
          explanation: "Third person singular: spela → spelar"
        },
        {
          question: "De ____ inte hemma idag.",
          options: [
            "är",
            "vara",
            "varit"
          ],
          correct: 0,
          explanation: "'Är' is the present tense of 'vara' for all persons except I."
        },
        {
          question: "Jag ____ student i Stockholm.",
          options: [
            "är",
            "vara",
            "var"
          ],
          correct: 0,
          explanation: "'Är' is used for present tense 'to be'."
        }
      ]
    },
    {
      id: 3,
      title: "Articles & Nouns",
      description: "Master Swedish articles and noun usage",
      questions: [
        {
          question: "Choose the correct article: '____ hus är stort.'",
          options: [
            "En",
            "Ett",
            "Huset"
          ],
          correct: 1,
          explanation: "'Hus' is a neuter noun, so it uses 'ett'."
        },
        {
          question: "Complete: '____ boken är intressant.'",
          options: [
            "En",
            "Ett",
            "Den"
          ],
          correct: 2,
          explanation: "'Boken' is already in definite form (with -en ending), so we use the definite article 'den'."
        },
        {
          question: "Choose the correct noun form: 'Jag har ____ (cat).'",
          options: [
            "en katt",
            "ett katt",
            "en katten"
          ],
          correct: 0,
          explanation: "'Katt' (cat) is a common noun; use 'en'."
        },
        {
          question: "What is the correct form? '____ barn spelar i parken.'",
          options: [
            "En",
            "Ett",
            "Der"
          ],
          correct: 1,
          explanation: "'Barn' (child) is neuter, use 'ett'."
        }
      ]
    }
  ],
  "B": [
    {
      id: 1,
      title: "Past Tense (Preterit & Perfect)",
      description: "Master past tense conjugation and usage",
      questions: [
        {
          question: "Choose the correct past tense: 'Igår jag ____ frukt.'",
          options: [
            "äter",
            "åt",
            "har ätit"
          ],
          correct: 1,
          explanation: "Preterit tense (åt) is commonly used for completed past actions, especially with time references like 'igår'."
        },
        {
          question: "Which is correct? 'Jag ____ aldrig varit i Sverige.'",
          options: [
            "har",
            "hade",
            "är"
          ],
          correct: 0,
          explanation: "Perfect tense (har + past participle) expresses relevance to the present."
        },
        {
          question: "Complete: 'Vi ____ hemma igår.'",
          options: [
            "var",
            "varit",
            "voro"
          ],
          correct: 0,
          explanation: "Preterit of 'vara' is 'var' for all persons."
        },
        {
          question: "What's the correct form? 'Han ____ en lång resa för två år sedan.'",
          options: [
            "gör",
            "gjorde",
            "har gjort"
          ],
          correct: 1,
          explanation: "With 'för två år sedan', use preterit (gjorde), not perfect."
        },
        {
          question: "Choose: 'Jag ____ många bästa vänner här.'",
          options: [
            "har gjort",
            "gjorde",
            "gör"
          ],
          correct: 0,
          explanation: "Perfect tense (har gjort) is used when the action is recent and has present relevance."
        },
        {
          question: "Which is correct? 'Du ____ redan ätit middag?'",
          options: [
            "hade",
            "har",
            "hast"
          ],
          correct: 1,
          explanation: "Perfect tense: 'har' + past participle for actions with present relevance."
        },
        {
          question: "Complete: 'De ____ en mycket bra film när vi kom hem.'",
          options: [
            "såg",
            "har sett",
            "såger"
          ],
          correct: 0,
          explanation: "Preterit (såg) is used for a completed action in the past."
        }
      ]
    },
    {
      id: 2,
      title: "Adjective Agreement",
      description: "Master adjective endings with different genders and numbers",
      questions: [
        {
          question: "Complete: '____ dag är den.'",
          options: [
            "En vacker",
            "Ett vackert",
            "En vackert"
          ],
          correct: 0,
          explanation: "'Dag' is common gender, no ending needed for the adjective."
        },
        {
          question: "Which is correct? '____ hus är nytt.'",
          options: [
            "En vacker",
            "Ett vackert",
            "Ett vacker"
          ],
          correct: 1,
          explanation: "'Hus' is neuter, so adjectives get -t ending: vackert."
        },
        {
          question: "Choose: 'De är ____ (tall) pojkar.'",
          options: [
            "långe",
            "lång",
            "långa"
          ],
          correct: 2,
          explanation: "Plural adjectives get -a: långa."
        },
        {
          question: "What's correct? '____ äpplen är sura.'",
          options: [
            "De röda",
            "De rött",
            "De röd"
          ],
          correct: 0,
          explanation: "Plural adjectives with definite article: rött → röda."
        },
        {
          question: "Complete: 'En ____ (new) lägenhete.'",
          options: [
            "ny",
            "nyt",
            "nya"
          ],
          correct: 0,
          explanation: "Common gender singular with no article: ny."
        },
        {
          question: "Choose: '____ häst är snabb.'",
          options: [
            "En snabb",
            "Ett snabbt",
            "En snabbt"
          ],
          correct: 0,
          explanation: "'Häst' (horse) is common gender."
        }
      ]
    },
    {
      id: 3,
      title: "Subordinate Clauses",
      description: "Master word order in dependent clauses",
      questions: [
        {
          question: "Correct the subordinate clause: 'Jag vet att han kommer snart'",
          options: [
            "Jag vet att snart han kommer",
            "Jag vet att han snart kommer",
            "Jag vet att kommer han"
          ],
          correct: 1,
          explanation: "In subordinate clauses, the finite verb moves to the end: Subject + Adverbial + Verb"
        },
        {
          question: "Which is correct? 'Om jag hade tid, jag skulle...'",
          options: [
            "jag skulle gå",
            "skulle jag gå",
            "gå skulle jag"
          ],
          correct: 1,
          explanation: "In subordinate clauses: Subject + Verb comes at the end."
        },
        {
          question: "Complete: 'Eftersom vi är trötta, vi...'",
          options: [
            "vi vill gå hem",
            "vill vi gå hem",
            "gå vi hem"
          ],
          correct: 2,
          explanation: "Subordinate clauses: verb comes last: vi gå hem (simplified for practice)."
        }
      ]
    }
  ],
  "C": [
    {
      id: 1,
      title: "Conditional Mood",
      description: "Express wishes, hypotheticals, and conditions",
      questions: [
        {
          question: "Complete: 'Jag ____ vilja åka till Sverige.'",
          options: [
            "skulle",
            "ska",
            "skall"
          ],
          correct: 0,
          explanation: "Conditional: skulle + infinitive for wishes and hypotheticals."
        },
        {
          question: "Which is correct? 'Om jag hade tid, jag ____ läsa mer.'",
          options: [
            "skulle",
            "vill",
            "kan"
          ],
          correct: 0,
          explanation: "In conditional clauses: skulle + infinitive."
        },
        {
          question: "Complete: 'Det ____ vara trevligt om du komit.'",
          options: [
            "skulle",
            "ska",
            "kan"
          ],
          correct: 0,
          explanation: "'Skulle' is used for polite requests and hypotheticals."
        },
        {
          question: "What's correct? 'Om vi hade kunnat, vi ____ gå på resan.'",
          options: [
            "skulle ha gått",
            "hade gått",
            "går"
          ],
          correct: 0,
          explanation: "Past conditional: skulle ha + past participle."
        }
      ]
    },
    {
      id: 2,
      title: "Passive Voice",
      description: "Transform active to passive and understand passive constructions",
      questions: [
        {
          question: "Convert to passive: 'De byggde huset år 1990.'",
          options: [
            "Huset byggdes år 1990.",
            "Huset bygga året 1990.",
            "Huset var byggat år 1990."
          ],
          correct: 0,
          explanation: "Passive: verb + -ades/-edes ending for past tense."
        },
        {
          question: "Which passive form is correct? 'Boken ____ (read) av miljoner.'",
          options: [
            "läses",
            "läsa",
            "läst"
          ],
          correct: 0,
          explanation: "Present passive: -s ending on present tense verb (läsa → läses)."
        },
        {
          question: "Complete the passive: 'En ny väg ____ (build) i området.'",
          options: [
            "byggs",
            "byggdes",
            "bygga"
          ],
          correct: 0,
          explanation: "Present passive uses -s: byggs."
        },
        {
          question: "Transform to passive: 'De serverade middag kl 19.'",
          options: [
            "Middag serverades kl 19.",
            "Middag serva kl 19.",
            "Middag blev serverad kl 19."
          ],
          correct: 0,
          explanation: "Preterit passive: verb + -ades."
        },
        {
          question: "Which is the passive form? 'Barnen ____ (care for) av läraren.'",
          options: [
            "omsorgas",
            "omsorgades",
            "omsorgas"
          ],
          correct: 2,
          explanation: "Present passive of 'omsorga': omsorgas (though this is an advanced form)."
        }
      ]
    },
    {
      id: 3,
      title: "Participles",
      description: "Use present and past participles correctly",
      questions: [
        {
          question: "Which participle is correct? 'En ____ (running) pojke.'",
          options: [
            "springandes",
            "springande",
            "springad"
          ],
          correct: 1,
          explanation: "Present participle: -ande ending."
        },
        {
          question: "Complete: '____ (broken) fönstret behöver repareras.'",
          options: [
            "Bruten",
            "Brustet",
            "Bruten"
          ],
          correct: 0,
          explanation: "Past participle used as adjective: bruten."
        },
        {
          question: "Which is correct? '____ (sleeping) barn.'",
          options: [
            "Sövande",
            "Sovad",
            "Sovande"
          ],
          correct: 2,
          explanation: "Present participle: sovande."
        },
        {
          question: "Choose: 'En ____ (painted) vägg är fin.'",
          options: [
            "målade",
            "målad",
            "målande"
          ],
          correct: 1,
          explanation: "Past participle as adjective: målad."
        }
      ]
    }
  ],
  "D": [
    {
      id: 1,
      title: "Advanced Sentence Construction",
      description: "Master complex nested clauses and formal structures",
      questions: [
        {
          question: "Which is the most formal?",
          options: [
            "Det är viktigt att vi kommer tidigt.",
            "Det är viktigt vi kommer tidigt.",
            "Vi måste komma tidigt vilket är viktigt."
          ],
          correct: 0,
          explanation: "'Att' (that/to) is required in formal Swedish when expressing purpose or condition."
        },
        {
          question: "Complete: 'Det är möjligt att...'",
          options: [
            "vi kan gå",
            "vi kunna gå",
            "gå vi"
          ],
          correct: 0,
          explanation: "Subordinate clause after 'att': subject + verb with correct conjugation."
        },
        {
          question: "Which is correct? 'Eftersom vi studerar engelska, ____ vi också svenska.'",
          options: [
            "vi studerar",
            "studerar vi",
            "kan vi studera"
          ],
          correct: 1,
          explanation: "Main clause after subordinate clause: verb + subject inversion (V2)."
        },
        {
          question: "Complete: 'Vad beträffar utbildning, ____.'",
          options: [
            "är det viktigt",
            "det är viktigt",
            "viktigt det är"
          ],
          correct: 0,
          explanation: "Formal opening requires V2 word order."
        },
        {
          question: "Which is most formal? 'Jag tror att ____ mycket viktigt att lära sig svenksa.'",
          options: [
            "det är",
            "är det",
            "det vara"
          ],
          correct: 0,
          explanation: "Formal subordinate clause structure."
        }
      ]
    },
    {
      id: 2,
      title: "Subjunctive Mood",
      description: "Formal expressions, wishes, and archaic forms",
      questions: [
        {
          question: "Which is a subjunctive expression? (archaic/formal)",
          options: [
            "Leve kungen! (Long live the king!)",
            "Kungens liv är långt.",
            "Vi älskar kungen."
          ],
          correct: 0,
          explanation: "Subjunctive is rare in modern Swedish but appears in set phrases and wishes."
        },
        {
          question: "Complete the formal wish: 'Må du ____ lycka!'",
          options: [
            "ha",
            "hava",
            "hade"
          ],
          correct: 1,
          explanation: "'Må' + infinitive in wishes is an archaic/formal construction."
        },
        {
          question: "Which expresses formal distance? 'Om han ____ komma...'",
          options: [
            "skulle",
            "kom",
            "kommer"
          ],
          correct: 0,
          explanation: "'Skulle' + infinitive is more formal than simple past."
        },
        {
          question: "Complete: 'God morgon, väl ____ du?'",
          options: [
            "mår",
            "må",
            "måde"
          ],
          correct: 0,
          explanation: "Standard form, though archaic subjunctive 'må' also exists."
        }
      ]
    },
    {
      id: 3,
      title: "Stylistic Variations & Registers",
      description: "Understand formal, informal, and regional differences",
      questions: [
        {
          question: "Which is the most formal?",
          options: [
            "Du pratar mycket.",
            "Ni pratar mycket.",
            "Du e jätte pratös."
          ],
          correct: 1,
          explanation: "'Ni' is the formal plural 'you'; used in official contexts."
        },
        {
          question: "Which is informal/colloquial?",
          options: [
            "Jag är väldigt glad.",
            "Jag är jätteglad.",
            "Min väl etablerade glädje."
          ],
          correct: 1,
          explanation: "'Jätte' is informal/colloquial intensifier."
        },
        {
          question: "Which is neutral Swedish?",
          options: [
            "Skynda dej!",
            "Skynda på!",
            "Skynda dig!"
          ],
          correct: 2,
          explanation: "'Skynda dig' is standard; 'dej' is colloquial; 'på' is regional."
        },
        {
          question: "Complete formally: 'Jag möter honom ____.'",
          options: [
            "imorgon",
            "i morgon",
            "imorn"
          ],
          correct: 1,
          explanation: "Formal/written: 'i morgon'; colloquial: 'imorgon'."
        },
        {
          question: "Which sounds most professional?",
          options: [
            "Vi ska kolla på det.",
            "Vi skall granska det.",
            "Vi e på det."
          ],
          correct: 1,
          explanation: "'Skall' and 'granska' are more formal than 'ska' and 'kolla'."
        }
      ]
    },
    {
      id: 4,
      title: "Idiomatic Expressions",
      description: "Master common Swedish idioms and expressions",
      questions: [
        {
          question: "What does 'Det är ju inte raketen!' mean?",
          options: [
            "It's definitely not the rocket.",
            "It's not rocket science! (i.e., it's simple)",
            "There's no rocket involved."
          ],
          correct: 1,
          explanation: "A common Swedish idiom meaning something is easy or not complicated."
        },
        {
          question: "Complete the idiom: 'Det är inte min ____ !'",
          options: [
            "hund",
            "frukt",
            "cykel"
          ],
          correct: 0,
          explanation: "'Det är inte min hund' = 'It's not my problem/business'."
        },
        {
          question: "What does 'Att få kål för öronen' mean?",
          options: [
            "To get cabbage for the ears.",
            "To get a scolding/telling-off.",
            "To buy vegetables."
          ],
          correct: 1,
          explanation: "An idiom meaning to be scolded harshly."
        },
        {
          question: "What does 'Ha ett ben att stå på' mean?",
          options: [
            "To have one leg to stand on.",
            "To have a solid argument or foundation.",
            "To be disabled."
          ],
          correct: 1,
          explanation: "Idiom: to have a solid basis or justification for something."
        },
        {
          question: "Meaning of 'Lägga sitt hjärta på något':",
          options: [
            "To place one's heart on something.",
            "To be very passionate about something.",
            "To have a heart problem."
          ],
          correct: 1,
          explanation: "Idiom meaning to devote oneself passionately to something."
        }
      ]
    }
  ]
};

export default function GrammarModule() {
  const [selectedLevel, setSelectedLevel] = useState("A");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState("topics");
  const [quizState, setQuizState] = useState({ started: false, currentQ: 0, score: 0, finished: false });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const { user } = useAuth();

  const topicsForLevel = GRAMMAR_TOPICS.find(g => g.level === selectedLevel)?.topics || [];
  const quizzesForLevel = GRAMMAR_QUIZZES[selectedLevel] || [];
  const activeQuiz = quizzesForLevel[0];
  const currentQuestion = activeQuiz?.questions[quizState.currentQ];

  if (selectedTopic) {
    return (
      <GrammarTopicDetail
        topic={selectedTopic}
        level={selectedLevel}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  const handleStartQuiz = () => {
    setQuizState({ started: true, currentQ: 0, score: 0, finished: false });
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const handleAnswerQuestion = (idx) => {
    setSelectedAnswer(idx);
    setAnswered(true);
    if (idx === currentQuestion.correct) {
      setQuizState(s => ({ ...s, score: s.score + 1 }));
    }
  };

  const handleNextQuestion = () => {
    if (quizState.currentQ + 1 >= activeQuiz.questions.length) {
      setQuizState(s => ({ ...s, finished: true }));
    } else {
      setQuizState(s => ({ ...s, currentQ: s.currentQ + 1 }));
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const handleRestartQuiz = () => {
    setQuizState({ started: false, currentQ: 0, score: 0, finished: false });
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const resetToTopics = () => {
    setActiveTab("topics");
    handleRestartQuiz();
  };

  return (
    <div className="space-y-6">
      {/* Level selector */}
      <div className="flex gap-2 flex-wrap">
        {["A", "B", "C", "D"].map(level => (
          <button
            key={level}
            onClick={() => {
              setSelectedLevel(level);
              resetToTopics();
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedLevel === level
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            SFI {level}
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border/50 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("topics"); handleRestartQuiz(); }}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === "topics"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📖 Topics & Lessons
          </button>
          {quizzesForLevel.length > 0 && (
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-4 py-3 font-semibold transition-all ${
                activeTab === "quiz"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ✅ Practice Quiz
            </button>
          )}
        </div>
        {user?.role === "admin" && (
          <Button
            onClick={() => setShowGenerateModal(true)}
            size="sm"
            className="gap-2"
          >
            <Wand2 className="w-4 h-4" /> Generate
          </Button>
        )}
      </div>

      <GenerateGrammarContentModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
      />

      {/* Topics Tab */}
      {activeTab === "topics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topicsForLevel.map((topic, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <button
                onClick={() => setSelectedTopic(topic)}
                className="w-full text-left"
              >
                <Card className="border-border/50 hover:shadow-md hover:-translate-y-1 transition-all h-full cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{topic.title}</CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        SFI {selectedLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 space-y-1.5">
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Example</div>
                      <p className="text-sm text-blue-900 dark:text-blue-100 italic">{topic.example}</p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                      <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Key Point</div>
                      <p className="text-sm text-amber-900 dark:text-amber-100">{topic.keyPoint}</p>
                    </div>

                    <div className="pt-2 text-sm font-semibold text-primary group-hover:underline">
                      Start Learning →
                    </div>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === "quiz" && activeQuiz && (
        <AnimatePresence mode="wait">
          {!quizState.started ? (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-border/50">
                <CardContent className="p-8 text-center space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{activeQuiz.title}</h3>
                    <p className="text-muted-foreground text-lg">{activeQuiz.description}</p>
                  </div>
                  <div className="text-5xl font-bold text-primary">{activeQuiz.questions.length}</div>
                  <p className="text-muted-foreground">questions in this quiz</p>
                  <Button onClick={handleStartQuiz} size="lg" className="gap-2">
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : quizState.finished ? (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-border/50">
                <CardContent className="p-8 text-center space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Quiz Complete! 🎉</h3>
                    <p className="text-muted-foreground">Great work on practicing grammar!</p>
                  </div>
                  <div className="text-6xl font-bold text-primary">{Math.round((quizState.score / activeQuiz.questions.length) * 100)}%</div>
                  <p className="text-lg text-muted-foreground">{quizState.score} of {activeQuiz.questions.length} correct</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleRestartQuiz} variant="outline">Try Again</Button>
                    <Button onClick={resetToTopics}>Back to Topics</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key={`q-${quizState.currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-border/50">
                <CardContent className="p-8 space-y-6">
                  {/* Progress */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Question {quizState.currentQ + 1} of {activeQuiz.questions.length}</span>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${((quizState.currentQ + 1) / activeQuiz.questions.length) * 100}%` }} />
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <h3 className="text-xl font-bold">{currentQuestion.question}</h3>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => !answered && handleAnswerQuestion(idx)}
                        disabled={answered}
                        className={`w-full p-4 rounded-lg text-left font-medium transition-all border-2 ${
                          selectedAnswer === idx
                            ? idx === currentQuestion.correct
                              ? "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-900"
                              : "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-900"
                            : answered && idx === currentQuestion.correct
                            ? "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-900"
                            : "border-border hover:border-primary hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {answered && idx === currentQuestion.correct && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                          {answered && selectedAnswer === idx && idx !== currentQuestion.correct && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Explanation */}
                  {answered && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase">Explanation</p>
                      <p className="text-blue-900 dark:text-blue-100">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}

                  {/* Next Button */}
                  {answered && (
                    <Button onClick={handleNextQuestion} className="w-full">
                      {quizState.currentQ + 1 >= activeQuiz.questions.length ? "See Results" : "Next Question"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Empty state */}
      {topicsForLevel.length === 0 && activeTab === "topics" && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No grammar topics available for this level.</p>
        </div>
      )}
    </div>
  );
}