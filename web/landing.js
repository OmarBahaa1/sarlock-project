/////////////////////  Landing Page & Game Dialogue Controller  ////////////////////////
/////////////  Zack  ///////////////

const NARRATOR = {
  landing: [
    ["greeting",    "Greetings, Commander! I'm Zack, your guide at the Signal Detection Unit. Our planet changes every day: earthquakes, floods, landslides. Some changes are huge. Others hide from the human eye."],
    ["explaining",  "That's where radar comes in. A satellite called NISAR, built by NASA and ISRO, sends radar waves down to Earth and listens to the echo. It sees day and night, even through clouds."],
    ["amazed",      "Your mission: compare the BEFORE and AFTER radar images and find exactly where the ground changed."],
    ["explaining",  "You get 3 attempts per case. Miss once and I'll give you a hint. Solve cases to rank up from Beginner to Master."],
    ["celebrating", "Ready? Let's open the map!"]
  ],

  map: {
    firstVisit:  ["greeting",    "Two sites are showing unusual radar returns. Pick one to pull the before/after imagery, Commander."],
    someSolved:  ["amazed",      "Nice work so far! Pick your next site."],
    allSolved:   ["celebrating", "Every signal decoded! More sites are coming soon, stay tuned."]
  },

  caseLoaded: ["explaining", "Here are the BEFORE and AFTER images. Something changed between them. Click where you think it is."],

  wrong: [
    ["thinking", "Not quite. That area looks the same in both images."],
    ["thinking", "Hmm, not there. Compare the two images again."],
    ["thinking", "Close, but no. Only one attempt left, take your time."]
  ],
  hint:          ["thinking", "Here's a hint: {hint}"],
  outOfAttempts: ["thinking", "You're out of attempts. Your rank stays {level}, but you can try this case again!"],

  correct: [
    ["amazed",      "Sharp eyes! That's exactly where the ground changed."],
    ["amazed",      "Found it! Great catch, Commander."],
    ["celebrating", "First try! Are you sure you're a {level}?"]
  ],

  reflectionIntro: ["thinking", "Before we go on, three quick questions. There are no wrong answers, just think like a scientist."],
  reflectionDone:  ["amazed",   "Great thinking! Now let me show you the full story."],

  story:    ["explaining",  "Watch this. It shows what really happened here, and how NISAR helps."],
  levelUp:  ["celebrating", "Rank up! You are now a {level}."],
  maxLevel: ["celebrating", "You've reached Master! The whole unit salutes you."],
  storyEnd: ["greeting",    "Case closed. Ready for the next signal?"],

  soundOff: ["thinking", "Sound off. I'll be quiet... but I'll still be here!"],
  soundOn:  ["amazed",   "Sound on! Let's go."]
};

let currentLandingIndex = 0;
let typingTimeout = null;
let autoAdvanceTimeout = null;

/**
 * Types out dialogue letter-by-letter and automatically triggers the next line when finished.
 */
function speakLetterByLetterAuto(dialogueData, textElement, imgElement, speedMs = 30, pauseBetweenLinesMs = 2500) {
  if (!textElement) return;

  // Clear any existing timeouts to prevent overlapping loops
  if (typingTimeout) clearTimeout(typingTimeout);
  if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);

  const [pose, text] = dialogueData;

  // 1. Update Narrator Pose Image
  if (imgElement) {
    imgElement.src = `assets/narrator/${pose}_nobg.png`;
    imgElement.alt = `Zack - ${pose}`;
  }

  // 2. Clear current text box
  textElement.textContent = "";

  let charIndex = 0;

  // 3. Letter-by-letter typing animation
  function typeNextLetter() {
    if (charIndex < text.length) {
      textElement.textContent += text[charIndex];
      charIndex++;
      typingTimeout = setTimeout(typeNextLetter, speedMs);
    } else {
      // Typing finished! Wait pauseBetweenLinesMs, then play next line
      autoAdvanceTimeout = setTimeout(playNextLandingLine, pauseBetweenLinesMs);
    }
  }

  typeNextLetter();
}

/**
 * Advances through the NARRATOR.landing sequence automatically.
 */
function playNextLandingLine() {
  const textContainer = document.getElementById("narrator-text");
  const avatarContainer = document.getElementById("narrator-img");
  const startBtn = document.getElementById("start-btn");

  if (currentLandingIndex < NARRATOR.landing.length) {
    speakLetterByLetterAuto(
      NARRATOR.landing[currentLandingIndex],
      textContainer,
      avatarContainer,
      30,   // Letter typing speed in ms
      2500  // Pause time before next line in ms
    );
    currentLandingIndex++;
  } else {
    // Reveal Start button when finished
    if (startBtn) {
      startBtn.style.display = "inline-block";
    }
  }
}

// Start sequence automatically after a 3-second delay on page load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    playNextLandingLine();
  }, 1500);
});