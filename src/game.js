const { useEffect, useMemo, useState } = React;

const ACTIVITIES = {
  map: {
    title: "Bathroom Map",
    skill: "What happens first?",
    prompt: "Practice the whole bathroom routine with calm steps.",
    voice: "Bathroom map. We go one step at a time.",
  },
  potty: {
    title: "Potty Time",
    skill: "Listen to body",
    prompt: "Help Sidra notice, sit, try, and flush.",
    voice: "Potty time. Listen to your body, sit, and try.",
  },
  wipe: {
    title: "Clean Helper",
    skill: "Wipe and flush",
    prompt: "Choose the clean helper steps.",
    voice: "Clean helper. Wipe, flush, and feel proud.",
  },
  wash: {
    title: "Soap Song",
    skill: "Wash hands",
    prompt: "Tap the handwashing tools in order.",
    voice: "Soap song. Water, soap, scrub, rinse, dry.",
  },
  shower: {
    title: "Shower Shine",
    skill: "Bath routine",
    prompt: "Make a bubbly clean routine.",
    voice: "Shower shine. Water, soap, rinse, towel, pajamas.",
  },
};

const ROUTINE = [
  { id: "notice", label: "Body says poo-poo", icon: "try" },
  { id: "pants", label: "Pull down clothes", icon: "underwear" },
  { id: "sit", label: "Sit on commode", icon: "commode" },
  { id: "wipe", label: "Wipe clean", icon: "paper" },
  { id: "flush", label: "Flush", icon: "flush" },
  { id: "wash", label: "Wash hands", icon: "soap" },
];

const WASH_STEPS = [
  { id: "water", label: "Water on", icon: "flush" },
  { id: "soap", label: "Soap", icon: "soap" },
  { id: "scrub", label: "Scrub bubbles", icon: "clean" },
  { id: "rinse", label: "Rinse", icon: "shower" },
  { id: "dry", label: "Dry towel", icon: "towel" },
];

const SHOWER_STEPS = [
  { id: "water", label: "Warm water", icon: "shower" },
  { id: "soap", label: "Gentle soap", icon: "soap" },
  { id: "rinse", label: "Rinse bubbles", icon: "flush" },
  { id: "towel", label: "Cozy towel", icon: "towel" },
  { id: "pajamas", label: "Clean pajamas", icon: "underwear" },
];

const CLEAN_CHOICES = [
  { id: "wipe", label: "Wipe front to back", good: true, icon: "paper" },
  { id: "flush", label: "Flush the potty", good: true, icon: "flush" },
  { id: "wash", label: "Wash hands", good: true, icon: "soap" },
  { id: "run", label: "Run away first", good: false, icon: "try" },
  { id: "touch", label: "Touch yucky things", good: false, icon: "commode" },
  { id: "skip", label: "Skip soap", good: false, icon: "towel" },
];

const STICKERS = [
  { id: "try", label: "I Tried", badge: "try" },
  { id: "commode", label: "Commode Star", badge: "clean" },
  { id: "wipe", label: "Clean Helper", badge: "helper" },
  { id: "flush", label: "Flush Hero", badge: "flush" },
  { id: "soap", label: "Soap Star", badge: "soap" },
  { id: "shower", label: "Shower Shine", badge: "shower" },
  { id: "calm", label: "Calm Body", badge: "calm" },
  { id: "star", label: "Big Kid Star", badge: "star" },
];

const PRAISE = [
  "Great job, Sidra!",
  "You are learning, Sidra!",
  "That was a calm step!",
  "You helped your body!",
  "Clean and proud!",
  "You can try again anytime!",
];

let audioContext;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function tone(frequency, duration, type = "sine", gain = 0.08, startOffset = 0) {
  const context = getAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const start = context.currentTime + startOffset;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function noise(duration, gain = 0.08, startOffset = 0, filterFrequency = 1200) {
  const context = getAudioContext();
  if (!context) return;
  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const volume = context.createGain();
  const start = context.currentTime + startOffset;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFrequency, start);
  volume.gain.setValueAtTime(gain, start);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(volume);
  volume.connect(context.destination);
  source.start(start);
}

function sound(effect) {
  if (!getAudioContext()) return;
  if (effect === "flush") {
    noise(0.85, 0.12, 0, 650);
    tone(260, 0.28, "sawtooth", 0.06, 0);
    tone(190, 0.32, "sawtooth", 0.055, 0.2);
    tone(135, 0.34, "sawtooth", 0.045, 0.43);
    tone(520, 0.1, "triangle", 0.04, 0.76);
    return;
  }
  if (effect === "water") {
    noise(0.45, 0.06, 0, 1800);
    tone(880, 0.08, "triangle", 0.035, 0.03);
    tone(1180, 0.08, "triangle", 0.03, 0.16);
    tone(760, 0.08, "triangle", 0.03, 0.29);
    return;
  }
  if (effect === "soap") {
    tone(720, 0.08, "sine", 0.05, 0);
    tone(1040, 0.08, "sine", 0.045, 0.09);
    tone(1320, 0.1, "sine", 0.04, 0.18);
    noise(0.16, 0.025, 0.08, 2600);
    return;
  }
  if (effect === "shower") {
    noise(0.7, 0.075, 0, 2200);
    tone(620, 0.12, "triangle", 0.03, 0.08);
    tone(760, 0.12, "triangle", 0.03, 0.24);
    return;
  }
  if (effect === "oops") {
    tone(240, 0.14, "triangle", 0.045, 0);
    tone(180, 0.18, "triangle", 0.04, 0.13);
    return;
  }
  if (effect === "success") {
    tone(523, 0.12, "triangle", 0.05, 0);
    tone(659, 0.12, "triangle", 0.05, 0.12);
    tone(784, 0.16, "triangle", 0.055, 0.24);
    tone(1046, 0.2, "sine", 0.045, 0.4);
    return;
  }
  tone(520, 0.08, "triangle", 0.04, 0);
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.pitch = 1.18;
  utterance.rate = 0.86;
  utterance.volume = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const softVoice = voices.find((voice) => /child|kid|junior|samantha|karen|zira|female/i.test(`${voice.name} ${voice.voiceURI}`));
  if (softVoice) utterance.voice = softVoice;
  window.speechSynthesis.speak(utterance);
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("sidra-potty-game")) || {};
  } catch {
    return {};
  }
}

function Icon({ type }) {
  const classType = {
    clean: "soap",
    shower: "shower-icon",
  }[type] || type;
  return React.createElement("span", { className: `icon ${classType}` });
}

function Kid({ mood }) {
  return React.createElement("div", { className: `kid ${mood}` },
    React.createElement("div", { className: "hair" }),
    React.createElement("div", { className: "face" }, React.createElement("div", { className: "smile" })),
    React.createElement("div", { className: "body" }),
    React.createElement("div", { className: "arm left" }),
    React.createElement("div", { className: "arm right" }),
    React.createElement("div", { className: "leg left" }),
    React.createElement("div", { className: "leg right" })
  );
}

function BathroomScene({ waterOn, showerOn, signal }) {
  return React.createElement("div", { className: "bathroom-scene", "aria-label": "Bathroom scene" },
    React.createElement("div", { className: "mirror" }),
    React.createElement("div", { className: "commode" },
      React.createElement("div", { className: "tank" }),
      React.createElement("div", { className: "bowl" }),
      React.createElement("div", { className: "seat" }),
      React.createElement("div", { className: "base" })
    ),
    React.createElement("div", { className: "sink" },
      React.createElement("div", { className: "faucet" }),
      React.createElement("div", { className: `water ${waterOn ? "on" : ""}` }),
      React.createElement("div", { className: "sink-bowl" })
    ),
    React.createElement("div", { className: "shower" },
      React.createElement("div", { className: "pipe" }),
      React.createElement("div", { className: "shower-head" }),
      React.createElement("div", { className: `drops ${showerOn ? "on" : ""}` },
        React.createElement("span"), React.createElement("span"), React.createElement("span"), React.createElement("span")
      )
    ),
    signal && React.createElement("div", { className: "potty-signal" }, signal),
    React.createElement("div", { className: "floor" })
  );
}

function Game() {
  const saved = loadProgress();
  const [activity, setActivity] = useState("map");
  const [stars, setStars] = useState(saved.stars || 0);
  const [stickers, setStickers] = useState(saved.stickers || []);
  const [message, setMessage] = useState("Choose a routine and help Sidra practice.");
  const [mood, setMood] = useState("ready");
  const [soundOn, setSoundOn] = useState(true);
  const [done, setDone] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [sitCount, setSitCount] = useState(5);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [showReward, setShowReward] = useState(false);

  const copy = ACTIVITIES[activity];
  const unlocked = Math.min(STICKERS.length, Math.floor(stars / 2));
  const waterOn = activity === "wash" && done.includes("water");
  const showerOn = activity === "shower" && done.includes("water");

  useEffect(() => {
    localStorage.setItem("sidra-potty-game", JSON.stringify({ stars, stickers }));
  }, [stars, stickers]);

  useEffect(() => {
    const loadVoices = () => window.speechSynthesis?.getVoices();
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    if (!timerRunning) return undefined;
    if (sitCount <= 0) {
      setTimerRunning(false);
      reward("I tried sitting calmly!", "try");
      return undefined;
    }
    const id = window.setTimeout(() => setSitCount((current) => current - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timerRunning, sitCount]);

  function startActivity(next) {
    setActivity(next);
    setDone([]);
    setSequence([]);
    setShowReward(false);
    setSitCount(5);
    setTimerRunning(false);
    setMessage(ACTIVITIES[next].prompt);
    if (soundOn) speak(ACTIVITIES[next].voice);
  }

  function sparkle() {
    const burst = Array.from({ length: 14 }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      left: window.innerWidth * 0.54,
      top: window.innerHeight * 0.58,
      x: `${Math.cos(index * 0.8) * (65 + index * 2)}px`,
      y: `${Math.sin(index * 0.8) * (65 + index * 2)}px`,
    }));
    setSparkles(burst);
    window.setTimeout(() => setSparkles([]), 900);
  }

  function reward(text, stickerId) {
    const phrase = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    setStars((current) => current + 1);
    if (stickerId && !stickers.includes(stickerId)) {
      setStickers((current) => [...current, stickerId]);
    }
    setMessage(`${phrase} ${text}`);
    setMood("happy");
    setShowReward(true);
    sparkle();
    if (soundOn) sound("success");
    if (soundOn) speak(`${phrase} ${text}`);
    window.setTimeout(() => setMood("ready"), 900);
  }

  function addSequence(step) {
    if (sequence.includes(step.id)) return;
    const nextIndex = sequence.length;
    const expected = ROUTINE[nextIndex];
    if (expected.id !== step.id) {
      setMessage(`Almost. First we ${expected.label.toLowerCase()}.`);
      if (soundOn) sound("oops");
      if (soundOn) speak(`Almost, Sidra. First, ${expected.label}.`);
      return;
    }
    const next = [...sequence, step.id];
    setSequence(next);
    setMessage(step.label);
    if (soundOn) sound(step.id === "flush" ? "flush" : step.id === "wash" ? "soap" : "pop");
    if (next.length === ROUTINE.length) reward("You know the bathroom routine!", "star");
    else if (soundOn) speak(step.label);
  }

  function doPottyStep(step) {
    if (done.includes(step)) return;
    const order = ["notice", "pants", "sit", "try", "flush", "wash"];
    const expected = order[done.length];
    if (expected !== step) {
      setMessage(`Good try. The next little step is ${expected}.`);
      if (soundOn) sound("oops");
      if (soundOn) speak("Good try. One little step at a time.");
      return;
    }
    const next = [...done, step];
    setDone(next);
    if (soundOn) sound(step === "flush" ? "flush" : step === "wash" ? "soap" : "pop");
    if (step === "sit") {
      setMessage("Sit with feet steady. Breathe in, breathe out.");
      if (soundOn) speak("Sit with feet steady. Breathe in, breathe out.");
      return;
    }
    if (next.length === order.length) reward("Potty practice complete!", "commode");
    else {
      setMessage("Nice calm step.");
      if (soundOn) speak("Nice calm step, Sidra.");
    }
  }

  function chooseClean(choice) {
    if (!choice.good) {
      setMessage("Silly choice! Let's pick a clean helper step.");
      if (soundOn) sound("oops");
      if (soundOn) speak("Silly choice. Let's pick a clean helper step.");
      return;
    }
    if (done.includes(choice.id)) return;
    const next = [...done, choice.id];
    setDone(next);
    if (soundOn) sound(choice.id === "flush" ? "flush" : choice.id === "wash" ? "soap" : "pop");
    if (next.length === 3) reward("Wipe, flush, wash. Clean helper!", "wipe");
    else {
      setMessage(choice.label);
      if (soundOn) speak(choice.label);
    }
  }

  function orderedStep(step, list, sticker) {
    if (done.includes(step.id)) return;
    const expected = list[done.length];
    if (expected.id !== step.id) {
      setMessage(`Almost. Next is ${expected.label}.`);
      if (soundOn) sound("oops");
      if (soundOn) speak(`Almost. Next is ${expected.label}.`);
      return;
    }
    const next = [...done, step.id];
    setDone(next);
    if (soundOn) {
      sound(step.id === "water" || step.id === "rinse" ? (activity === "shower" ? "shower" : "water") : step.id === "soap" ? "soap" : "pop");
    }
    if (next.length === list.length) reward("All clean!", sticker);
    else {
      setMessage(step.label);
      if (soundOn) speak(step.label);
    }
  }

  function resetProgress() {
    setStars(0);
    setStickers([]);
    setDone([]);
    setSequence([]);
    setShowReward(false);
    setMessage("Fresh start. Practice gently.");
    localStorage.removeItem("sidra-potty-game");
  }

  function renderMap() {
    return React.createElement("div", { className: "sequence-area" },
      React.createElement("div", { className: "routine-track" },
        ROUTINE.map((step, index) =>
          React.createElement("div", { key: step.id, className: `slot ${sequence.includes(step.id) ? "filled" : ""}` },
            sequence[index] ? ROUTINE.find((item) => item.id === sequence[index])?.label : index + 1
          )
        )
      ),
      React.createElement("div", { className: "step-grid" },
        ROUTINE.map((step) =>
          React.createElement("button", {
            key: step.id,
            className: `step-card ${sequence.includes(step.id) ? "done" : ""}`,
            type: "button",
            onClick: () => addSequence(step),
          }, React.createElement(Icon, { type: step.icon }), step.label)
        )
      )
    );
  }

  function renderPotty() {
    const steps = [
      { id: "notice", label: "I feel poo-poo", icon: "try" },
      { id: "pants", label: "Clothes down", icon: "underwear" },
      { id: "sit", label: "Sit steady", icon: "commode" },
      { id: "try", label: "Try calmly", icon: "calm" },
      { id: "flush", label: "Flush", icon: "flush" },
      { id: "wash", label: "Wash hands", icon: "soap" },
    ];
    return React.createElement("div", { className: "sit-practice" },
      React.createElement("div", { className: "timer-ring", style: { "--progress": ((5 - sitCount) / 5) * 100 } },
        React.createElement("div", { className: "timer-inner" }, sitCount)
      ),
      React.createElement("button", {
        className: "timer-button",
        type: "button",
        onClick: () => {
          if (!done.includes("notice") || !done.includes("pants")) {
            doPottyStep(done.includes("notice") ? "pants" : "notice");
            return;
          }
          setSitCount(5);
          setTimerRunning(true);
          doPottyStep(done.includes("sit") ? "try" : "sit");
        },
      }, timerRunning ? "Trying..." : "Sit and Try"),
      React.createElement("div", { className: "tool-row" },
        steps.map((step) =>
          React.createElement("button", {
            key: step.id,
            className: `tool ${done.includes(step.id) ? "done" : ""}`,
            type: "button",
            onClick: () => doPottyStep(step.id),
          }, React.createElement(Icon, { type: step.icon }), step.label)
        )
      )
    );
  }

  function renderClean() {
    return React.createElement("div", { className: "choices" },
      CLEAN_CHOICES.map((choice) =>
        React.createElement("button", {
          key: choice.id,
          className: `choice ${done.includes(choice.id) ? "done" : ""}`,
          type: "button",
          onClick: () => chooseClean(choice),
        }, React.createElement(Icon, { type: choice.icon }), choice.label)
      )
    );
  }

  function renderOrdered(list, sticker) {
    return React.createElement("div", { className: "tool-row" },
      list.map((step) =>
        React.createElement("button", {
          key: step.id,
          className: `tool ${done.includes(step.id) ? "done" : ""}`,
          type: "button",
          onClick: () => orderedStep(step, list, sticker),
        }, React.createElement(Icon, { type: step.icon }), step.label)
      )
    );
  }

  const content = useMemo(() => {
    if (activity === "potty") return renderPotty();
    if (activity === "wipe") return renderClean();
    if (activity === "wash") return renderOrdered(WASH_STEPS, "soap");
    if (activity === "shower") return renderOrdered(SHOWER_STEPS, "shower");
    return renderMap();
  }, [activity, done, sequence, sitCount, timerRunning]);

  return React.createElement("section", { className: "game", "aria-label": "Sidra bathroom learning game" },
    React.createElement("div", { className: "bubble one" }),
    React.createElement("div", { className: "bubble two" }),
    React.createElement("div", { className: "bubble three" }),
    sparkles.map((sparkle) =>
      React.createElement("span", {
        key: sparkle.id,
        className: "sparkle",
        style: { left: sparkle.left, top: sparkle.top, "--x": sparkle.x, "--y": sparkle.y },
      })
    ),
    React.createElement("header", { className: "topbar" },
      React.createElement("div", null,
        React.createElement("h1", null, "Sidra's Bathroom Adventure"),
        React.createElement("p", { className: "subtitle" }, "Practice life skills with calm, clean, happy steps")
      ),
      React.createElement("div", { className: "status" },
        React.createElement("div", { className: "pill stars" }, `${stars} stars`),
        React.createElement("button", {
          className: "sound-button",
          type: "button",
          onClick: () => {
            setSoundOn((current) => !current);
            if (soundOn) window.speechSynthesis?.cancel();
            if (!soundOn) speak("Sound is on, Sidra.");
          },
        }, soundOn ? "Sound" : "Quiet")
      )
    ),
    React.createElement("nav", { className: "activity-tabs", "aria-label": "Choose bathroom activity" },
      Object.keys(ACTIVITIES).map((key) =>
        React.createElement("button", {
          key,
          className: `activity-tab ${activity === key ? "active" : ""}`,
          type: "button",
          onClick: () => startActivity(key),
        }, React.createElement("strong", null, ACTIVITIES[key].title), React.createElement("span", null, ACTIVITIES[key].skill))
      )
    ),
    React.createElement("main", { className: "stage" },
      React.createElement("aside", { className: "sidra-panel" },
        React.createElement(Kid, { mood }),
        React.createElement("div", { className: "prompt", "aria-live": "polite" }, message)
      ),
      React.createElement("section", { className: "play-panel" },
        React.createElement("div", { className: "activity-title" },
          React.createElement("h2", null, copy.title),
          React.createElement("p", null, copy.prompt)
        ),
        React.createElement("div", { className: "scene-card" },
          React.createElement(BathroomScene, {
            waterOn,
            showerOn,
            signal: activity === "potty" ? "My body says try!" : activity === "map" ? "One step at a time" : "",
          }),
          content
        ),
        React.createElement("div", { className: "tool-row" },
          React.createElement("button", { className: "action-button", type: "button", onClick: () => startActivity(activity) }, "New Practice"),
          React.createElement("button", { className: "action-button", type: "button", onClick: resetProgress }, "Fresh Start")
        )
      ),
      React.createElement("aside", { className: "reward-panel" },
        React.createElement("h2", null, "Brave Routine Stickers"),
        React.createElement("div", { className: "sticker-shelf" },
          STICKERS.map((sticker, index) => {
            const open = stickers.includes(sticker.id) || index < unlocked;
            return React.createElement("div", { key: sticker.id, className: `sticker ${open ? "open" : "locked"}` },
              open ? React.createElement("span", { className: `badge ${sticker.badge}` }, "*") : React.createElement("span", null, "?"),
              React.createElement("small", null, open ? sticker.label : "Locked")
            );
          })
        )
      )
    ),
    showReward && React.createElement("div", { className: "reward-toast", role: "status" },
      React.createElement("strong", null, "Star earned!"),
      React.createElement("span", null, "Practice makes it easier."),
      React.createElement("button", { type: "button", onClick: () => setShowReward(false) }, "Keep Playing")
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Game));
