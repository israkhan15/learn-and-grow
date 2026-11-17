import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation,
  useNavigate,
} from "react-router";

type ModuleKey = "alphabets" | "numbers" | "colours" | "shapes";
type Lesson = {
  name: string;
  secondary?: string;
  example: string;
  picture?: string;
  color?: string;
  shape?: string;
};
type TopicStats = {
  explored: number[];
  attempts: number;
  correct: number;
  incorrect: number;
  completed: number;
};

const alphabetExamples = [
  ["Apple", "🍎"],
  ["Ball", "⚽"],
  ["Cat", "🐈"],
  ["Dog", "🐕"],
  ["Egg", "🥚"],
  ["Fish", "🐟"],
  ["Grapes", "🍇"],
  ["Hat", "🎩"],
  ["Ice cream", "🍦"],
  ["Jug", "🫗"],
  ["Kite", "🪁"],
  ["Lion", "🦁"],
  ["Moon", "🌙"],
  ["Nest", "🪺"],
  ["Orange", "🍊"],
  ["Pencil", "✏️"],
  ["Queen", "👸"],
  ["Rainbow", "🌈"],
  ["Sun", "☀️"],
  ["Tree", "🌳"],
  ["Umbrella", "☂️"],
  ["Van", "🚐"],
  ["Whale", "🐋"],
  ["Xylophone", "🎼"],
  ["Yo-yo", "🪀"],
  ["Zebra", "🦓"],
];

const colours: Lesson[] = [
  ["Red", "#ef4444", "🍎"],
  ["Blue", "#3b82f6", "🫐"],
  ["Green", "#22a667", "🥦"],
  ["Yellow", "#facc15", "🌻"],
  ["Orange", "#f97316", "🍊"],
  ["Pink", "#ec4899", "🌸"],
  ["Purple", "#8b5cf6", "🍇"],
  ["Black", "#171717", "🎩"],
  ["White", "#ffffff", "☁️"],
  ["Brown", "#8b5a2b", "🧸"],
  ["Grey", "#94a3b8", "🐘"],
  ["Turquoise", "#20bfb5", "💎"],
  ["Navy", "#25356b", "🎒"],
  ["Gold", "#e6a817", "🏆"],
  ["Lime", "#84cc16", "🍐"],
].map(([name, color, picture]) => ({ name, color, picture, example: `${name} ${picture}` }));

const shapeData = [
  ["Circle", "circle"],
  ["Square", "square"],
  ["Rectangle", "rectangle"],
  ["Triangle", "triangle"],
  ["Oval", "oval"],
  ["Star", "star"],
  ["Diamond", "diamond"],
  ["Pentagon", "pentagon"],
  ["Hexagon", "hexagon"],
  ["Octagon", "octagon"],
  ["Heart", "heart"],
  ["Semicircle", "semicircle"],
  ["Crescent", "crescent"],
  ["Trapezium", "trapezium"],
];

const lessons: Record<ModuleKey, Lesson[]> = {
  alphabets: alphabetExamples.map(([example, picture], index) => ({
    name: String.fromCharCode(65 + index),
    secondary: String.fromCharCode(97 + index),
    example,
    picture,
  })),
  numbers: Array.from({ length: 1000 }, (_, index) => ({
    name: String(index + 1),
    example: numberName(index + 1),
  })),
  colours,
  shapes: shapeData.map(([name, shape]) => ({ name, shape, example: `This is a ${name}` })),
};

const moduleInfo: Record<
  ModuleKey,
  { title: string; eyebrow: string; accent: string; light: string }
> = {
  alphabets: {
    title: "Amazing Alphabets",
    eyebrow: "Letters A to Z",
    accent: "#7457d9",
    light: "#eeeaff",
  },
  numbers: {
    title: "Happy Numbers",
    eyebrow: "Numbers 1 to 1000",
    accent: "#e7543d",
    light: "#fff0e9",
  },
  colours: {
    title: "Wonderful Colours",
    eyebrow: "A bright world",
    accent: "#087e70",
    light: "#e0f7f1",
  },
  shapes: {
    title: "Super Shapes",
    eyebrow: "Shapes all around us",
    accent: "#b45018",
    light: "#fff2d9",
  },
};

function numberName(value: number) {
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  if (value === 1000) return "one thousand";
  if (value >= 100) {
    const rest = value % 100;
    return `${ones[Math.floor(value / 100)]} hundred${rest ? ` and ${numberName(rest)}` : ""}`;
  }
  if (value < 20) return ones[value];
  return `${tens[Math.floor(value / 10)]}${value % 10 ? `-${ones[value % 10]}` : ""}`;
}

const emptyStats = (): TopicStats => ({
  explored: [],
  attempts: 0,
  correct: 0,
  incorrect: 0,
  completed: 0,
});
function getStats(key: ModuleKey): TopicStats {
  try {
    const old = JSON.parse(localStorage.getItem(`learn-stats-${key}`) || "{}");
    const legacy = JSON.parse(localStorage.getItem(`learn-progress-${key}`) || "[]");
    return { ...emptyStats(), ...old, explored: old.explored || legacy };
  } catch {
    return emptyStats();
  }
}
function saveStats(key: ModuleKey, stats: TopicStats) {
  localStorage.setItem(`learn-stats-${key}`, JSON.stringify(stats));
  window.dispatchEvent(new Event("learn-stats"));
}

function Icon({
  name,
  size = 24,
}: {
  name: "home" | "sound" | "stop" | "arrow" | "spark" | "book" | "chart";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "home")
    return (
      <svg {...common}>
        <path d="m3 11 9-8 9 8" />
        <path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7" />
      </svg>
    );
  if (name === "sound")
    return (
      <svg {...common}>
        <path d="M11 5 6.5 9H3v6h3.5l4.5 4Z" />
        <path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
      </svg>
    );
  if (name === "stop")
    return (
      <svg {...common}>
        <rect x="5" y="5" width="14" height="14" rx="2" />
      </svg>
    );
  if (name === "arrow")
    return (
      <svg {...common}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  if (name === "spark")
    return (
      <svg {...common}>
        <path d="m12 2 1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8Z" />
        <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" />
      </svg>
    );
  if (name === "chart")
    return (
      <svg {...common}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7a3 3 0 0 0-3 3Z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h5a3 3 0 0 1 3 3Z" />
    </svg>
  );
}

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find((voice) => voice.lang === "en-IN") ||
      voices.find((voice) => voice.lang.startsWith("en")) ||
      null;
    utterance.lang = "en-IN";
    utterance.rate = 0.76;
    utterance.pitch = 1.05;
    utterance.onend = utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };
  useEffect(() => stop, []);
  return { speak, stop, speaking };
}

function SpeechButtons({ text }: { text: string }) {
  const { speak, stop, speaking } = useSpeech();
  return (
    <div className="speech-buttons" aria-label="Audio controls">
      <button
        className={`button button-sound ${speaking ? "is-speaking" : ""}`}
        onClick={() => speak(text)}
      >
        <Icon name="sound" />
        {speaking ? "Reading…" : "Read aloud"}
      </button>
      <button className="button button-stop" onClick={stop}>
        <Icon name="stop" size={20} />
        Stop audio
      </button>
    </div>
  );
}

function Brand() {
  return (
    <Link className="brand brand-small" to="/">
      <span className="brand-mark">
        <Icon name="book" />
      </span>
      <span>
        Learn <i>&</i> Grow
      </span>
    </Link>
  );
}

function Mascot({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`mascot ${compact ? "mascot-compact" : ""}`}
      aria-label="Pip, the friendly learning mascot"
      role="img"
    >
      <svg viewBox="0 0 240 240">
        <path className="mascot-shadow" d="M44 202c24-19 126-23 158 1-23 28-135 29-158-1Z" />
        <path
          className="mascot-body"
          d="M70 93c2-40 26-66 63-63 38 2 59 31 53 70-3 20-11 35-17 46l17 43c-17 13-36 18-58 16-25 0-46-7-61-21l21-41C75 129 69 112 70 93Z"
        />
        <path className="mascot-belly" d="M92 140c15 12 50 14 68 0l14 42c-26 14-70 12-94-3Z" />
        <circle cx="108" cy="89" r="8" fill="#16352f" />
        <circle cx="154" cy="89" r="8" fill="#16352f" />
        <path
          d="M117 112c9 8 21 8 29 0"
          fill="none"
          stroke="#16352f"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path className="mascot-wing" d="M78 116C48 99 25 116 27 144c23 2 41-6 54-20" />
        <path className="mascot-wing" d="M177 115c28-21 51-4 46 24-23 5-38-2-50-16" />
        <path className="mascot-cap" d="m76 54 58-39 66 39-64 28Z" />
        <path d="M190 54v34" stroke="#f2b84b" strokeWidth="7" strokeLinecap="round" />
        <circle cx="190" cy="91" r="7" fill="#f2b84b" />
        <path
          className="mascot-foot"
          d="M72 188c-20 5-28 15-23 24 16 4 29 1 41-9M174 190c18 5 26 13 22 22-16 4-28 1-39-9"
        />
      </svg>
    </div>
  );
}

function HomePage() {
  const intro =
    "Welcome, Learner! What would you like to learn today? Choose Alphabets, Numbers, Colours, or Shapes. Every step helps you learn and grow.";
  const cards = [
    { key: "alphabets", label: "Alphabets", note: "A to Z", symbol: "Aa" },
    { key: "numbers", label: "Numbers", note: "1 to 1000", symbol: "123" },
    { key: "colours", label: "Colours", note: "15 bright colours", symbol: "●" },
    { key: "shapes", label: "Shapes", note: "14 shapes", symbol: "△" },
  ];
  return (
    <main className="home-shell">
      <header className="home-header">
        <Brand />
        <div className="header-actions">
          <Link className="dashboard-link" to="/dashboard">
            <Icon name="chart" size={20} />
            Teacher Dashboard
          </Link>
          <SpeechButtons text={intro} />
        </div>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Icon name="spark" size={18} />
            Your happy place to learn
          </div>
          <h1>Welcome, Learner!</h1>
          <p className="hero-question">What would you like to learn today?</p>
          <p className="hero-support">
            Pick a learning path and take your time. Every small step is something to celebrate.
          </p>
          <div className="module-grid">
            {cards.map((card, index) => (
              <Link to={`/${card.key}`} className={`module-card card-${index + 1}`} key={card.key}>
                <span className="module-symbol">{card.symbol}</span>
                <span>
                  <strong>{card.label}</strong>
                  <small>{card.note}</small>
                </span>
                <span className="round-arrow">
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="learning-sun" aria-hidden="true">
            <span>ABC</span>
            <i>1 2 3</i>
            <b>★</b>
          </div>
          <Mascot />
          <div className="mascot-note">
            <strong>Hi, I’m Pip!</strong>
            <span>Let’s learn together.</span>
          </div>
        </div>
      </section>
      <section className="motivation">
        <span className="motivation-icon">
          <Icon name="spark" />
        </span>
        <div>
          <p>Remember</p>
          <h2>You can learn amazing things, one step at a time.</h2>
        </div>
        <span className="motivation-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </section>
    </main>
  );
}

function ShapeVisual({
  shape,
  color = "#f08b42",
  small = false,
}: {
  shape?: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <span
      className={`shape shape-${shape} ${small ? "shape-small" : ""}`}
      style={{ "--shape-color": color } as React.CSSProperties}
      aria-hidden="true"
    />
  );
}

function NumberVisual({ value }: { value: number }) {
  if (value <= 20)
    return (
      <div className="counting-grid" aria-label={`${value} apples`}>
        {Array.from({ length: value }, (_, i) => (
          <span className="mini-apple" key={i}>
            <i />
          </span>
        ))}
      </div>
    );
  if (value === 1000)
    return (
      <div className="place-value-visual" aria-label="1 thousand">
        <div className="place-group thousand">
          <strong>1</strong>
          <span>thousand</span>
          <i>1000</i>
        </div>
      </div>
    );
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  return (
    <div
      className="place-value-visual"
      aria-label={`${hundreds} hundreds, ${tens} tens and ${ones} ones`}
    >
      {hundreds > 0 && (
        <div className="place-group hundreds">
          <strong>{hundreds}</strong>
          <span>hundred{hundreds > 1 ? "s" : ""}</span>
          <i>100</i>
        </div>
      )}
      {tens > 0 && (
        <div className="place-group tens">
          <strong>{tens}</strong>
          <span>ten{tens > 1 ? "s" : ""}</span>
          <i>10</i>
        </div>
      )}
      {ones > 0 && (
        <div className="place-group ones">
          <strong>{ones}</strong>
          <span>one{ones > 1 ? "s" : ""}</span>
          <i>1</i>
        </div>
      )}
    </div>
  );
}

function LessonVisual({ module, lesson }: { module: ModuleKey; lesson: Lesson }) {
  if (module === "alphabets")
    return (
      <div className="alphabet-picture">
        <span className="object-picture">{lesson.picture}</span>
        <span className="picture-word">{lesson.example}</span>
      </div>
    );
  if (module === "numbers") return <NumberVisual value={Number(lesson.name)} />;
  if (module === "colours")
    return (
      <div className="colour-object">
        <span className="object-picture">{lesson.picture}</span>
        <div
          className="colour-swatch"
          style={{ "--balloon": lesson.color } as React.CSSProperties}
        />
      </div>
    );
  return <ShapeVisual shape={lesson.shape} />;
}

function LearningPage({ module }: { module: ModuleKey }) {
  const items = lessons[module];
  const info = moduleInfo[module];
  const [index, setIndex] = useState(() =>
    Math.max(0, Number(sessionStorage.getItem(`learn-index-${module}`) || 0)),
  );
  const [mode, setMode] = useState<"learn" | "practice">("learn");
  const [stats, setStats] = useState(() => getStats(module));
  const [answer, setAnswer] = useState<string | null>(null);
  const [wrongChoices, setWrongChoices] = useState<string[]>([]);
  const item = items[index];

  useEffect(() => {
    const latest = getStats(module);
    if (!latest.explored.includes(index)) {
      const next = { ...latest, explored: [...latest.explored, index] };
      saveStats(module, next);
      setStats(next);
    }
    sessionStorage.setItem(`learn-index-${module}`, String(index));
  }, [index, module]);

  const options = useMemo(() => {
    const offsets = module === "numbers" ? [0, 1, 10] : [0, 2, Math.ceil(items.length / 2)];
    return offsets
      .map((offset) => items[(index + offset) % items.length])
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [index, items, module]);
  const question =
    module === "alphabets"
      ? `Which uppercase letter matches ${item.secondary}?`
      : module === "numbers"
        ? `Which number is ${item.example}?`
        : module === "colours"
          ? `Which colour matches this object?`
          : `Which name matches this shape?`;
  const lessonSpeech =
    module === "alphabets"
      ? `Uppercase ${item.name}. Lowercase ${item.secondary}. ${item.name} is for ${item.example}.`
      : module === "numbers"
        ? `Number ${item.name}. ${item.example}. Look at the place value groups and say it with me.`
        : module === "colours"
          ? `This colour is ${item.name}. Look at the ${item.example}.`
          : `${item.example}. Trace the ${item.name} in the air.`;

  const chooseAnswer = (name: string) => {
    if (answer === item.name) return;
    const correct = name === item.name;
    setAnswer(name);
    setWrongChoices((old) => (correct ? old : [...old, name]));
    const latest = getStats(module);
    const next = {
      ...latest,
      attempts: latest.attempts + 1,
      correct: latest.correct + (correct ? 1 : 0),
      incorrect: latest.incorrect + (correct ? 0 : 1),
      completed: latest.completed + (correct ? 1 : 0),
    };
    saveStats(module, next);
    setStats(next);
  };
  const go = (amount: number) => {
    setIndex((current) => Math.max(0, Math.min(items.length - 1, current + amount)));
    setAnswer(null);
    setWrongChoices([]);
  };
  const setNumber = (value: number) => {
    setIndex(Math.max(0, Math.min(999, value - 1)));
    setAnswer(null);
    setWrongChoices([]);
  };

  return (
    <main
      className="learning-shell"
      style={{ "--accent": info.accent, "--accent-light": info.light } as React.CSSProperties}
    >
      <header className="learning-header">
        <Brand />
        <div className="header-actions">
          <Link className="home-link" to="/dashboard">
            <Icon name="chart" size={19} />
            Dashboard
          </Link>
          <Link className="home-link" to="/">
            <Icon name="home" size={19} />
            Home
          </Link>
        </div>
      </header>
      <section className="lesson-heading">
        <div>
          <span className="page-eyebrow">{info.eyebrow}</span>
          <h1>{info.title}</h1>
          <p>Look, listen, and learn at your own pace.</p>
        </div>
        <Mascot compact />
      </section>
      <section className="learning-toolbar">
        <div className="mode-tabs" role="tablist" aria-label="Learning mode">
          <button
            className={mode === "learn" ? "active" : ""}
            onClick={() => {
              setMode("learn");
              setAnswer(null);
            }}
            role="tab"
          >
            Learn
          </button>
          <button
            className={mode === "practice" ? "active" : ""}
            onClick={() => {
              setMode("practice");
              setAnswer(null);
            }}
            role="tab"
          >
            Play & practise
          </button>
        </div>
        <SpeechButtons
          text={
            mode === "learn"
              ? lessonSpeech
              : `${question} Choose from ${options.map((option) => option.name).join(", ")}.`
          }
        />
      </section>
      {module === "numbers" && (
        <section className="number-jump" aria-label="Number ranges">
          <span>Jump to:</span>
          {[1, 10, 50, 100, 250, 500, 750, 1000].map((n) => (
            <button
              className={index === n - 1 ? "active" : ""}
              onClick={() => setNumber(n)}
              key={n}
            >
              {n}
            </button>
          ))}
          <label>
            Find number
            <input
              type="number"
              min="1"
              max="1000"
              value={index + 1}
              onChange={(event) => setNumber(Number(event.target.value))}
            />
          </label>
        </section>
      )}
      {mode === "learn" ? (
        <section className="lesson-card">
          <div className="lesson-counter">
            {index + 1} of {items.length}
          </div>
          <div className="lesson-display">
            <div className="lesson-main">
              <span className="primary-value">{item.name}</span>
              {item.secondary && <span className="secondary-value">{item.secondary}</span>}
              <h2>
                {module === "alphabets"
                  ? `${item.name} is for ${item.example}`
                  : module === "numbers"
                    ? item.example
                    : item.name}
              </h2>
              <p>
                {module === "numbers"
                  ? Number(item.name) <= 20
                    ? "Point to each apple as you count."
                    : "See the hundreds, tens and ones."
                  : module === "colours"
                    ? `Say it with me: ${item.name}.`
                    : `Trace the ${item.name.toLowerCase()} in the air.`}
              </p>
            </div>
            <div className="visual-stage">
              <LessonVisual module={module} lesson={item} />
            </div>
          </div>
          <nav className="lesson-nav" aria-label="Lesson navigation">
            <button className="nav-button previous" onClick={() => go(-1)} disabled={index === 0}>
              <Icon name="arrow" />
              Previous
            </button>
            <button
              className="nav-button next"
              onClick={() => go(1)}
              disabled={index === items.length - 1}
            >
              Next
              <Icon name="arrow" />
            </button>
          </nav>
        </section>
      ) : (
        <section className="practice-card">
          <span className="practice-label">
            {module === "numbers"
              ? "Counting challenge"
              : module === "colours"
                ? "Object identification"
                : "Picture matching"}
          </span>
          <h2>{question}</h2>
          <div className="quiz-visual">
            <LessonVisual module={module} lesson={item} />
          </div>
          <div className="answer-grid">
            {options.map((option) => {
              const state =
                answer === item.name && option.name === item.name
                  ? "correct"
                  : answer === option.name && answer !== item.name
                    ? "wrong"
                    : "";
              return (
                <button
                  key={option.name}
                  className={state}
                  onClick={() => chooseAnswer(option.name)}
                  disabled={answer === item.name || wrongChoices.includes(option.name)}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
          {answer && (
            <div
              className={`feedback ${answer === item.name ? "feedback-correct" : "feedback-try"}`}
              role="status"
            >
              <strong>{answer === item.name ? "Wonderful work!" : "Good try!"}</strong>
              <span>
                {answer === item.name
                  ? "You found the correct answer."
                  : "Look closely and try another answer."}
              </span>
              {answer === item.name ? (
                <button onClick={() => go(1)}>
                  Next question
                  <Icon name="arrow" size={19} />
                </button>
              ) : (
                <button onClick={() => setAnswer(null)}>Try again</button>
              )}
            </div>
          )}
        </section>
      )}
      <section className="progress-card" aria-label="Learning progress">
        <div className="progress-copy">
          <span>
            <Icon name="spark" size={19} />
            My progress
          </span>
          <strong>
            {stats.explored.length} of {items.length} explored
          </strong>
        </div>
        <div className="progress-track">
          <span
            style={{ width: `${Math.max(1, (stats.explored.length / items.length) * 100)}%` }}
          />
        </div>
        <p>
          {stats.correct} correct answers so far. Keep going — every step helps your brain grow.
        </p>
      </section>
    </main>
  );
}

function Dashboard() {
  const [allStats, setAllStats] = useState<Record<ModuleKey, TopicStats>>(
    () =>
      Object.fromEntries(
        (Object.keys(moduleInfo) as ModuleKey[]).map((key) => [key, getStats(key)]),
      ) as Record<ModuleKey, TopicStats>,
  );
  useEffect(() => {
    const update = () =>
      setAllStats(
        Object.fromEntries(
          (Object.keys(moduleInfo) as ModuleKey[]).map((key) => [key, getStats(key)]),
        ) as Record<ModuleKey, TopicStats>,
      );
    window.addEventListener("learn-stats", update);
    return () => window.removeEventListener("learn-stats", update);
  }, []);
  const totals = Object.values(allStats).reduce(
    (sum, stat) => ({
      attempts: sum.attempts + stat.attempts,
      correct: sum.correct + stat.correct,
      incorrect: sum.incorrect + stat.incorrect,
      completed: sum.completed + stat.completed,
    }),
    { attempts: 0, correct: 0, incorrect: 0, completed: 0 },
  );
  const needingPractice = (Object.keys(allStats) as ModuleKey[]).filter(
    (key) =>
      allStats[key].incorrect > 0 &&
      allStats[key].correct / Math.max(1, allStats[key].attempts) < 0.7,
  );
  const dashboardSpeech = `Teacher dashboard. ${totals.completed} activities completed. ${totals.correct} correct answers and ${totals.incorrect} incorrect answers. ${needingPractice.length ? `${needingPractice.join(", ")} need more practice.` : "No topics need extra practice yet."}`;
  return (
    <main className="dashboard-shell">
      <header className="learning-header">
        <Brand />
        <div className="header-actions">
          <SpeechButtons text={dashboardSpeech} />
          <Link className="home-link" to="/">
            <Icon name="home" size={19} />
            Home
          </Link>
        </div>
      </header>
      <section className="dashboard-heading">
        <span className="page-eyebrow">Learning overview</span>
        <h1>Teacher Dashboard</h1>
        <p>A clear view of practice, confidence and progress on this device.</p>
      </section>
      <section className="summary-grid">
        <article>
          <span>Activities completed</span>
          <strong>{totals.completed}</strong>
        </article>
        <article>
          <span>Correct answers</span>
          <strong>{totals.correct}</strong>
        </article>
        <article>
          <span>Incorrect answers</span>
          <strong>{totals.incorrect}</strong>
        </article>
        <article>
          <span>Total attempts</span>
          <strong>{totals.attempts}</strong>
        </article>
      </section>
      <section className="dashboard-panel">
        <div className="panel-title">
          <div>
            <span className="page-eyebrow">Topic-by-topic</span>
            <h2>Learning progress</h2>
          </div>
          <span className="updated-note">Saved automatically</span>
        </div>
        <div className="topic-table">
          {(Object.keys(moduleInfo) as ModuleKey[]).map((key) => {
            const stat = allStats[key];
            const total = lessons[key].length;
            const percentage = Math.round((stat.explored.length / total) * 100);
            const accuracy = stat.attempts ? Math.round((stat.correct / stat.attempts) * 100) : 0;
            return (
              <article className="topic-row" key={key}>
                <div className={`topic-icon topic-${key}`}>
                  {key === "alphabets"
                    ? "Aa"
                    : key === "numbers"
                      ? "123"
                      : key === "colours"
                        ? "●"
                        : "△"}
                </div>
                <div className="topic-details">
                  <div>
                    <h3>{moduleInfo[key].title}</h3>
                    <Link to={`/${key}`}>
                      Open topic <Icon name="arrow" size={16} />
                    </Link>
                  </div>
                  <div className="dashboard-progress">
                    <span style={{ width: `${Math.max(1, percentage)}%` }} />
                  </div>
                  <small>
                    {stat.explored.length} of {total} explored · {percentage}% progress
                  </small>
                </div>
                <dl>
                  <div>
                    <dt>Accuracy</dt>
                    <dd>{accuracy}%</dd>
                  </div>
                  <div>
                    <dt>Correct / incorrect</dt>
                    <dd>
                      {stat.correct} / {stat.incorrect}
                    </dd>
                  </div>
                  <div>
                    <dt>Attempts</dt>
                    <dd>{stat.attempts}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>
      <section className={`practice-alert ${needingPractice.length ? "" : "all-good"}`}>
        <Icon name="spark" />
        <div>
          <h2>{needingPractice.length ? "Topics needing practice" : "Ready to keep growing"}</h2>
          <p>
            {needingPractice.length
              ? `Try a few gentle activities in ${needingPractice.map((key) => moduleInfo[key].title).join(" and ")}.`
              : "Complete some practice games to see personalised guidance here."}
          </p>
        </div>
      </section>
    </main>
  );
}

function RouteAnnouncer() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.speechSynthesis?.cancel();
  }, [pathname]);
  return <Outlet />;
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="not-found">
      <Mascot />
      <h1>Let’s find our way back!</h1>
      <p>This learning page is not here yet.</p>
      <button className="button button-sound" onClick={() => navigate("/")}>
        Go home
      </button>
    </main>
  );
}

const router = createBrowserRouter([
  {
    Component: RouteAnnouncer,
    children: [
      { path: "/", Component: HomePage },
      { path: "/index.html", Component: HomePage },
      ...(["alphabets", "numbers", "colours", "shapes"] as ModuleKey[]).flatMap((module) => [
        { path: `/${module}`, Component: () => <LearningPage module={module} /> },
        { path: `/${module}.html`, Component: () => <LearningPage module={module} /> },
      ]),
      { path: "/dashboard", Component: Dashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
