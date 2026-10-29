// const questions = {};

// const NARRATOR = {
//   landing: [
//     ["greeting",    "Greetings, Detective! I'm Zack, your guide at the Signal Detection Unit. Our planet changes every day: earthquakes, floods, landslides. Some changes are huge. Others hide from the human eye."],
//     ["explaining",  "That's where radar comes in. A satellite called NISAR, built by NASA and ISRO, sends radar waves down to Earth and listens to the echo. It sees day and night, even through clouds."],
//     ["amazed",      "Your mission: compare the BEFORE and AFTER radar images and find exactly where the ground changed."],
//     ["explaining",  "You get 3 attempts per case. Miss once and I'll give you a hint. Solve cases to rank up from Beginner to Master."],
//     ["celebrating", "Ready? Let's open the map!"]
//   ],

//   map: {
//     firstVisit:  ["greeting",    "Five sites are showing unusual radar returns. Pick one to pull the before/after imagery, Detective."],
//     someSolved:  ["amazed",      "Nice work so far! Pick your next site."],
//     allSolved:   ["celebrating", "Every signal decoded! More sites are coming soon, stay tuned."]
//   },

//   caseLoaded: ["explaining", "Here are the BEFORE and AFTER images. Something changed between them. Click where you think it is."],

//   wrong: [
//     ["thinking", "Not quite. That area looks the same in both images."],
//     ["thinking", "Hmm, not there. Compare the two images again."],
//     ["thinking", "Close, but no. Only one attempt left, take your time."]
//   ],
//   hint:          ["thinking", "Here's a hint: {hint}"],
//   outOfAttempts: ["thinking", "You're out of attempts. Your rank stays {level}, but let's view the story!"],

//   correct: [
//     ["amazed",      "Sharp eyes! That's exactly where the ground changed."],
//     ["amazed",      "Found it! Great catch, Detective."],
//     ["celebrating", "First try! Are you sure you're a {level}?"]
//   ],

//   story:    ["explaining",  "Watch this. It shows what really happened here, and how NISAR helps."],
//   levelUp:  ["celebrating", "Rank up! You are now a {level}."],
//   maxLevel: ["celebrating", "You've reached Master! The whole unit salutes you."],
//   storyEnd: ["greeting",    "Case closed. Ready for the next signal?"],

//   soundOff: ["thinking", "Sound off. I'll be quiet... but I'll still be here!"],
//   soundOn:  ["amazed",   "Sound on! Let's go."]
// };

// (() => {
//     'use strict';

//     const LEVELS = ['Beginner', 'Investigator', 'Analyst', 'Expert', 'Master'];
//     const MAX_ATTEMPTS = 3;

//     const CASE_FILES = [
//         '../data/processed/case-01-earthquake/case-01.json',
//         '../data/processed/case-02-flood/case-02.json',
//         '../data/processed/case-02-flood/case-02.json',
//         '../data/processed/case-02-flood/case-02.json',
//         '../data/processed/case-02-flood/case-02.json'
//     ];

//     const MAP_POINTS = [
//         { point: '.venz', hint: '.hidvenz', btn: '.venzbtn', label: '.venzcmp', caseIndex: 0 },
//         { point: '.ohio', hint: '.hidohio', btn: '.ohiobtn', label: '.ohiocmp', caseIndex: 1 },
//         { point: '.kaza', hint: '.hidkaza', btn: '.kazabtn', label: '.kazacmp', caseIndex: 2 },
//         { point: '.place4', hint: '.hidplace4', btn: '.place4btn', label: '.place4cmp', caseIndex: 3 },
//         { point: '.place5', hint: '.hidplace5', btn: '.place5btn', label: '.place5cmp', caseIndex: 4 }
//     ];

//     const SOUNDS = {
//         click: 'assets/audio/select-click.wav',
//         win: 'assets/audio/win.wav'
//     };

//     const STORAGE = {
//         selected: 'selectedPlace',
//         progress: 'sarlock-progress'
//     };

//     const $ = (sel, root = document) => root.querySelector(sel);
//     const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

//     function esc(value) {
//         const div = document.createElement('div');
//         div.textContent = value ?? '';
//         return div.innerHTML;
//     }

//     function setText(sel, value) {
//         const el = $(sel);
//         if (el) el.textContent = value ?? '';
//     }

//     function playSound(key) {
//         const audio = new Audio(SOUNDS[key]);
//         audio.play().catch(() => {});
//     }

//     const Progress = {
//         load() {
//             try {
//                 return JSON.parse(localStorage.getItem(STORAGE.progress)) || { done: {} };
//             } catch {
//                 return { done: {} };
//             }
//         },
//         save(data) {
//             try {
//                 localStorage.setItem(STORAGE.progress, JSON.stringify(data));
//             } catch {}
//         },
//         record(caseId, correct) {
//             const data = this.load();
//             data.done[caseId] = { correct };
//             this.save(data);
//         },
//         isDone(caseId) {
//             return Boolean(this.load().done[caseId]);
//         },
//         completedCount() {
//             return Object.keys(this.load().done).length;
//         },
//         levelName() {
//             const count = this.completedCount();
//             return LEVELS[Math.min(count, LEVELS.length - 1)];
//         }
//     };

//     const cases = [];

//     async function loadCases() {
//         const loaded = await Promise.all(CASE_FILES.map(async (file) => {
//             const res = await fetch(file);
//             if (!res.ok) throw new Error(`Failed to load ${file} (${res.status})`);
//             const data = await res.json();
//             data._base = new URL(file, location.href).href;
//             return data;
//         }));
//         cases.push(...loaded);

//         // Extract questions into your global `questions` object after loading completes
//         cases.forEach(place => {
//             if (place.title) {
//                 // Safely checks whichever key name your JSON actually uses
//                 questions[place.title] = place.question;
//             }
//         });

//         // This will now successfully print the populated object in your console!
//         console.log("Extracted Questions Object:", questions);
//     }

//     const Zack = {
//         textBox: null,
//         face: null,
//         timer: null,

//         init() {
//             const side = $('.mission_side');
//             if (!side) return false;
//             this.textBox = $('.content', side);
//             this.face = $('img', side);
//             return Boolean(this.textBox);
//         },

//         say([pose, text], speedMs = 35) {
//             if (!this.textBox) return;
//             clearInterval(this.timer);
//             this.setMood(pose);

//             const p = document.createElement('p');
//             this.textBox.replaceChildren(p);

//             let i = 0;
//             this.timer = setInterval(() => {
//                 p.textContent = text.slice(0, ++i);
//                 if (i >= text.length) clearInterval(this.timer);
//             }, speedMs);
//         },

//         setMood(pose) {
//             if (!this.face) return;
//             const fallback = 'assets/narrator/explaining_nobg.png';
//             const target = `assets/narrator/${pose}_nobg.png`;
//             this.face.onerror = () => { this.face.onerror = null; this.face.src = fallback; };
//             this.face.src = target;
//         }
//     };

//     function initIndexPage() {
//         if (!MAP_POINTS.some(m => $(m.point))) return;

//         MAP_POINTS.forEach(({ point, hint, btn, label, caseIndex }) => {
//             const place = cases[caseIndex];
//             const pointEl = $(point);
//             if (!place || !pointEl) return;

//             const hintEl = $(hint);
//             if (hintEl) {
//                 pointEl.addEventListener('mouseenter', () => hintEl.classList.remove('hidden'));
//                 pointEl.addEventListener('mouseleave', () => hintEl.classList.add('hidden'));
//             }

//             [pointEl, $(btn), $(label)].forEach(el => {
//                 if (el) el.addEventListener('click', () => goToMission(place));
//             });

//             if (Progress.isDone(place.id)) pointEl.classList.add('done');
//         });

//         setText('.level', Progress.levelName());
//     }

//     function goToMission(place) {
//         localStorage.setItem(STORAGE.selected, place.id);
//         playSound('click');
//         setTimeout(() => { location.href = 'mission.html'; }, 300);
//     }

//     function initMissionPage() {
//         injectCustomStyles();

//         const titleEl = $('#title');
//         if (!titleEl) return;

//         const place = cases.find(c => c.id === localStorage.getItem(STORAGE.selected));
//         if (!place) {
//             titleEl.textContent = 'No case selected';
//             return;
//         }

//         let newtitle;
//         let slicetitle = place.title ? place.title.slice(0, 3).toLowerCase() : '';
        
//         switch (slicetitle) {
//             case 'ven':
//                 newtitle = 'Venezuela';
//                 break;
//             case 'ohi':
//                 newtitle = 'Ohio';
//                 break;
//             case 'kaz':
//                 newtitle = 'Kazakhstan';
//                 break;
//             default:
//                 newtitle = place.title; // Fallback to original title if it doesn't match
//                 break;
//         }
        
//         setText('.case', place.id);
//         titleEl.textContent = newtitle;
//         setText('#date', place.event_date);
//         setText('#desc', place.description);

//         const slider = buildSlider(place);
//         if (!slider) return;

//         Zack.say(NARRATOR.caseLoaded);
//         initGame(place, slider);
//     }

//     function injectCustomStyles() {
//         if ($('#customMissionStyles')) return;
//         const style = document.createElement('style');
//         style.id = 'customMissionStyles';
//         style.textContent = `
//             .compare-slider.guess-armed,
//             .compare-slider.guess-armed * {
//                 cursor: pointer !important;
//             }
//             .guess-marker {
//                 position: absolute;
//                 transform: translate(-50%, -50%);
//                 width: 30px;
//                 height: 30px;
//                 border-radius: 50%;
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 font-weight: bold;
//                 font-size: 16px;
//                 z-index: 10;
//             }
//             .guess-marker.correct { background: #00c853; color: #fff; }
//             .guess-marker.wrong { background: #d50000; color: #fff; }
//             .guess-marker.reveal { background: #ffd600; color: #000; box-shadow: 0 0 15px #ffd600; }
//             .story-overlay {
//                 position: fixed;
//                 inset: 0;
//                 background: rgba(0, 0, 0, 0.4);
//                 backdrop-filter: blur(12px);
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 z-index: 2000;
//                 animation: fadeIn 0.4s ease;
//             }
//             .story-box {
//                 width: 75vw;
//                 height: 75vh;
//                 background: linear-gradient(135deg, rgba(17, 17, 17, 0.95), rgba(5, 20, 30, 0.95));
//                 border: 2px solid rgba(111, 255, 233, 0.4);
//                 box-shadow: 0 0 50px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(111, 255, 233, 0.1);
//                 color: #fff;
//                 padding: 40px;
//                 border-radius: 24px;
//                 display: flex;
//                 flex-direction: column;
//                 justify-content: space-between;
//                 overflow-y: auto;
//             }
//             .story-box h2 {
//                 color: #6fffe9;
//                 font-size: 32px;
//                 margin-bottom: 15px;
//                 text-align: center;
//             }
//             .story-box p {
//                 font-size: 18px;
//                 line-height: 1.6;
//                 color: rgba(255, 255, 255, 0.85);
//                 margin-bottom: 20px;
//             }
//             .story-video-container {
//                 width: 100%;
//                 max-height: 40vh;
//                 flex-grow: 1;
//                 background: #000;
//                 border: 1px solid rgba(255, 255, 255, 0.2);
//                 border-radius: 12px;
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 margin-bottom: 20px;
//                 position: relative;
//                 overflow: hidden;
//                 min-height: 200px;
//             }
//             .story-video-container video{
//                 width: 100%;
//                 height: auto;
//                 object-fit: cover;
//             }
//             .story-close {
//                 padding: 14px 28px;
//                 background-color: #115352;
//                 color: white;
//                 font-size: 18px;
//                 font-weight: bold;
//                 border: none;
//                 border-radius: 12px;
//                 cursor: pointer;
//                 transition: 0.3s ease;
//                 box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.5);
//                 align-self: flex-end;
//             }
//             .story-close:hover {
//                 background-color: #1a7a78;
//                 transform: scale(1.05);
//             }
//             @keyframes fadeIn {
//                 from { opacity: 0; transform: scale(0.95); }
//                 to { opacity: 1; transform: scale(1); }
//             }
//         `;
//         document.head.appendChild(style);
//     }

//     function buildSlider(place) {
//         const holder = $('.images');
//         if (!holder) return null;

//         const src = file => new URL(file, place._base).href;

//         holder.innerHTML = `
//             <div class="compare-slider">
//                 <div class="img-before">
//                     <img src="${esc(src(place.before.file))}" alt="Before" draggable="false">
//                     <span class="label label-before">BEFORE</span>
//                 </div>
//                 <div class="img-after">
//                     <img src="${esc(src(place.after.file))}" alt="After" draggable="false">
//                     <span class="label label-after">AFTER</span>
//                 </div>
//                 <div class="slider-handle">
//                     <div class="slider-line"></div>
//                     <div class="slider-circle">&#9664;&#9654;</div>
//                 </div>
//             </div>`;

//         const root = $('.compare-slider', holder);
//         const afterWrap = $('.img-after', root);
//         const afterImg = $('img', afterWrap);
//         const handle = $('.slider-handle', root);

//         root.style.touchAction = 'pan-y';

//         let locked = false;
//         let dragging = false;

//         function setPercent(p) {
//             p = Math.max(0, Math.min(100, p));
//             afterWrap.style.clipPath = `inset(0 0 0 ${p}%)`;
//             handle.style.left = `${p}%`;
//         }

//         function moveTo(clientX) {
//             const r = root.getBoundingClientRect();
//             if (r.width) setPercent(((clientX - r.left) / r.width) * 100);
//         }

//         root.addEventListener('pointerdown', e => {
//             if (locked) return;
//             dragging = true;
//             root.setPointerCapture(e.pointerId);
//             moveTo(e.clientX);
//         });
//         root.addEventListener('pointermove', e => { if (dragging) moveTo(e.clientX); });
//         const stop = () => { dragging = false; };
//         root.addEventListener('pointerup', stop);
//         root.addEventListener('pointercancel', stop);

//         setPercent(50);

//         function imageBox() {
//             const box = afterImg.getBoundingClientRect();
//             const nw = afterImg.naturalWidth;
//             const nh = afterImg.naturalHeight;
//             const fit = getComputedStyle(afterImg).objectFit;
//             if (!nw || !nh || fit === 'fill') return box;

//             const sx = box.width / nw;
//             const sy = box.height / nh;
//             let scale = fit === 'cover' ? Math.max(sx, sy) : Math.min(sx, sy);

//             const width = nw * scale;
//             const height = nh * scale;
//             return {
//                 left: box.left + (box.width - width) / 2,
//                 top: box.top + (box.height - height) / 2,
//                 width,
//                 height
//             };
//         }

//         return {
//             root,
//             lock(value) { locked = value; },
//             toImagePct(clientX, clientY) {
//                 const g = imageBox();
//                 return {
//                     x: ((clientX - g.left) / g.width) * 100,
//                     y: ((clientY - g.top) / g.height) * 100
//                 };
//             },
//             toBoxPct(x, y) {
//                 const g = imageBox();
//                 const r = root.getBoundingClientRect();
//                 return {
//                     left: ((g.left + (x / 100) * g.width - r.left) / r.width) * 100,
//                     top: ((g.top + (y / 100) * g.height - r.top) / r.height) * 100
//                 };
//             },
//             addMarker(x, y, kind, symbol) {
//                 const pos = this.toBoxPct(x, y);
//                 const m = document.createElement('div');
//                 m.className = `guess-marker ${kind}`;
//                 m.style.left = `${pos.left}%`;
//                 m.style.top = `${pos.top}%`;
//                 m.textContent = symbol;
//                 root.appendChild(m);
//             }
//         };
//     }

//     function ensureHotspot(place) {
//         const x = Number(place.hotspot?.x);
//         const y = Number(place.hotspot?.y);
//         const tol = Number(place.tolerance);
//         const valid = [x, y, tol].every(Number.isFinite);

//         if (valid) {
//             place.hotspot = { x, y };
//             place.tolerance = tol;
//             return;
//         }

//         const { min, max, tolerance } = { min: 15, max: 85, tolerance: 12 };
//         const rand = () => Math.round(min + Math.random() * (max - min));
//         place.hotspot = { x: rand(), y: rand() };
//         place.tolerance = tolerance;
//         if (!place.hint) place.hint = 'Look closely at the area where the two images differ.';
//     }

//     function initGame(place, slider) {
//         ensureHotspot(place);

//         const attemptsBox = $('#attemptsBox');
//         const guessBtn = $('#guessBtn');
//         const hintBox = $('#hintBox');
//         const resultLine = $('#resultLine');
//         if (!attemptsBox || !guessBtn || !hintBox || !resultLine) return;

//         const state = { attemptsLeft: MAX_ATTEMPTS, armed: false, finished: false, outOfAttempts: false };

//         function renderAttempts() {
//             attemptsBox.innerHTML = Array.from({ length: MAX_ATTEMPTS }, (_, i) =>
//                 `<span class="pip ${i < state.attemptsLeft ? '' : 'used'}">&#9679;</span>`
//             ).join('');
//         }

//         function showResult(text, kind) {
//             resultLine.textContent = text;
//             resultLine.className = `result-line ${kind}`;
//         }

//         renderAttempts();

//         guessBtn.addEventListener('click', () => {
//             if (state.outOfAttempts || state.finished) {
//                 openStoryModal(place);
//                 return;
//             }

//             if (state.armed) return;
//             state.armed = true;
//             slider.lock(true);
//             slider.root.classList.add('guess-armed');
//             guessBtn.disabled = true;
//             guessBtn.textContent = 'Click on the image now';
//             Zack.say(["explaining", "Click directly on the spot where you see the change!"]);
//         }); 

//         document.addEventListener('pointerdown', e => {
//             if (!state.armed || state.finished) return;

//             const r = slider.root.getBoundingClientRect();
//             const inside = e.clientX >= r.left && e.clientX <= r.right &&
//                            e.clientY >= r.top && e.clientY <= r.bottom;
//             if (!inside) return;
//             e.stopImmediatePropagation();

//             state.armed = false;
//             slider.lock(false);
//             slider.root.classList.remove('guess-armed');

//             const { x, y } = slider.toImagePct(e.clientX, e.clientY);
//             const dist = Math.hypot(x - place.hotspot.x, y - place.hotspot.y);
//             const correct = dist <= place.tolerance;

//             slider.addMarker(x, y, correct ? 'correct' : 'wrong', correct ? '\u2713' : '\u2715');

//             if (correct) {
//                 state.finished = true;
//                 playSound('win');
//                 showResult('Target confirmed. Great catch.', 'win');
//                 guessBtn.textContent = 'View Story ➔';
//                 guessBtn.disabled = false;
                
//                 Progress.record(place.id, true);

//                 const correctMsgs = NARRATOR.correct;
//                 const randomMsg = correctMsgs[Math.floor(Math.random() * correctMsgs.length)];
//                 let formattedText = randomMsg[1].replace('{level}', Progress.levelName());
//                 Zack.say([randomMsg[0], formattedText]);
//                 return;
//             }

//             state.attemptsLeft--;
//             renderAttempts();

//             if (state.attemptsLeft > 0) {
//                 hintBox.textContent = `Hint: ${place.hint}`;
//                 hintBox.classList.remove('hidden');
//                 guessBtn.disabled = false;
//                 guessBtn.textContent = `Try again (${state.attemptsLeft} left)`;
                
//                 const wrongOptions = NARRATOR.wrong;
//                 const chosenWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
//                 Zack.say(chosenWrong);
//             } else {
//                 state.finished = true;
//                 state.outOfAttempts = true;

//                 hintBox.classList.add('hidden');
//                 slider.addMarker(place.hotspot.x, place.hotspot.y, 'reveal', '\u2605');
//                 showResult('Out of attempts — the correct location is marked with a star.', 'lose');
                
//                 guessBtn.disabled = false;
//                 guessBtn.textContent = 'Next ➔';
                
//                 Progress.record(place.id, false);

//                 let outMsg = NARRATOR.outOfAttempts[1].replace('{level}', Progress.levelName());
//                 Zack.say([NARRATOR.outOfAttempts[0], outMsg]);
//             }
//         }, true);
//     }

//     function openStoryModal(place) {
//         if ($('#storyModal')) return;

//         Zack.say(NARRATOR.story);

//         const overlay = document.createElement('div');
//         overlay.id = 'storyModal';
//         overlay.className = 'story-overlay';
//         overlay.innerHTML = `
//             <div class="story-box" role="dialog" aria-modal="true">
//                 <div>
//                     <h2>${esc(place.title)}</h2>
//                     <p><strong style="font-size: larger; color: #008d8a;">Date of Event:</strong> ${esc(place.event_date)}</p>
//                     <p>${esc(place.story.summary)}</p>
//                     <p><strong style="font-size: larger; color: #008d8a;">Credits: </strong>${esc(place.credit)}</p>
//                 </div>
                
//                 <div class="story-video-container">
//                     <video controls autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
//                         <source src="assets/videos/${place.id}.mp4" type="video/mp4">
//                         Your browser does not support the video tag.
//                     </video>
//                 </div>

//                 <button class="story-close" type="button">Back to Map ➔</button>
//             </div>`;

//         document.body.appendChild(overlay);
//         $('.story-close', overlay).addEventListener('click', () => { 
//             Zack.say(NARRATOR.storyEnd);
//             setTimeout(() => { location.href = 'map.html'; }, 600);
//         });
//     }

//     document.addEventListener('DOMContentLoaded', async () => {
//         Zack.init();

//         try {
//             await loadCases();
//         } catch (err) {
//             console.error(err);
//             return;
//         }

//         initIndexPage();
//         initMissionPage();
//     });
// })();

// ////////////////////////   narrator in map page   ////////////////////////////

// let typingTimeout = null;

// function speakLetterByLetterSingle(dialogueData, textElement, imgElement, speedMs = 30) {
//   if (!textElement) return;

//   if (typingTimeout) clearTimeout(typingTimeout);

//   const [pose, text] = dialogueData;

//   if (imgElement) {
//     imgElement.src = `assets/narrator/${pose}_nobg.png`;
//     imgElement.alt = `Zack - ${pose}`;
//   }

//   textElement.textContent = "";

//   let charIndex = 0;

//   function typeNextLetter() {
//     if (charIndex < text.length) {
//       textElement.textContent += text[charIndex];
//       charIndex++;
//       typingTimeout = setTimeout(typeNextLetter, speedMs);
//     }
//   }

//   typeNextLetter();
// }

// function playMapNarrator(status = "firstVisit") {
//   const textContainer = document.getElementById("narrator-text");
//   const avatarContainer = document.getElementById("narrator-img");

//   const mapDialogue = NARRATOR.map[status] || NARRATOR.map.firstVisit;

//   setTimeout(() => {
//     speakLetterByLetterSingle(mapDialogue, textContainer, avatarContainer);
//   }, 1000);
// }

// document.addEventListener("DOMContentLoaded", () => {
//   playMapNarrator("firstVisit");
// });



































































const questions = {};

const NARRATOR = {
  landing: [
    ["greeting",    "Greetings, Detective! I'm Zack, your guide at the Signal Detection Unit. Our planet changes every day: earthquakes, floods, landslides. Some changes are huge. Others hide from the human eye."],
    ["explaining",  "That's where radar comes in. A satellite called NISAR, built by NASA and ISRO, sends radar waves down to Earth and listens to the echo. It sees day and night, even through clouds."],
    ["amazed",      "Your mission: compare the BEFORE and AFTER radar images and find exactly where the ground changed."],
    ["explaining",  "You get 3 attempts per case. Miss once and I'll give you a hint. Solve cases to rank up from Beginner to Master."],
    ["celebrating", "Ready? Let's open the map!"]
  ],

  map: {
    firstVisit:  ["greeting",    "Five sites are showing unusual radar returns. Pick one to pull the before/after imagery, Detective."],
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
  outOfAttempts: ["thinking", "You're out of attempts. Your rank stays {level}, but let's view the story!"],

  correct: [
    ["amazed",      "Sharp eyes! That's exactly where the ground changed."],
    ["amazed",      "Found it! Great catch, Detective."],
    ["celebrating", "First try! Are you sure you're a {level}?"]
  ],

  story:    ["explaining",  "Watch this. It shows what really happened here, and how NISAR helps."],
  levelUp:  ["celebrating", "Rank up! You are now a {level}."],
  maxLevel: ["celebrating", "You've reached Master! The whole unit salutes you."],
  storyEnd: ["greeting",    "Case closed. Ready for the next signal?"],

  soundOff: ["thinking", "Sound off. I'll be quiet... but I'll still be here!"],
  soundOn:  ["amazed",   "Sound on! Let's go."]
};

(() => {
    'use strict';

    const LEVELS = ['Beginner', 'Investigator', 'Analyst', 'Expert', 'Master'];
    const MAX_ATTEMPTS = 3;

    const CASE_FILES = [
        '../data/processed/case-01-earthquake/case-01.json',
        '../data/processed/case-02-flood/case-02.json',
        '../data/processed/case-02-flood/case-02.json',
        '../data/processed/case-02-flood/case-02.json',
        '../data/processed/case-02-flood/case-02.json'
    ];

    const MAP_POINTS = [
        { point: '.venz', hint: '.hidvenz', btn: '.venzbtn', label: '.venzcmp', caseIndex: 0 },
        { point: '.ohio', hint: '.hidohio', btn: '.ohiobtn', label: '.ohiocmp', caseIndex: 1 },
        { point: '.kaza', hint: '.hidkaza', btn: '.kazabtn', label: '.kazacmp', caseIndex: 2 },
        { point: '.place4', hint: '.hidplace4', btn: '.place4btn', label: '.place4cmp', caseIndex: 3 },
        { point: '.place5', hint: '.hidplace5', btn: '.place5btn', label: '.place5cmp', caseIndex: 4 }
    ];

    const SOUNDS = {
        click: 'assets/audio/select-click.wav',
        win: 'assets/audio/win.wav'
    };

    const STORAGE = {
        selected: 'selectedPlace',
        progress: 'sarlock-progress'
    };

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function esc(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

    function setText(sel, value) {
        const el = $(sel);
        if (el) el.textContent = value ?? '';
    }

    function playSound(key) {
        const audio = new Audio(SOUNDS[key]);
        audio.play().catch(() => {});
    }

    // const Progress = {
    //     load() {
    //         try {
    //             return JSON.parse(localStorage.getItem(STORAGE.progress)) || { done: {} };
    //         } catch {
    //             return { done: {} };
    //         }
    //     },
    //     save(data) {
    //         try {
    //             localStorage.setItem(STORAGE.progress, JSON.stringify(data));
    //         } catch {}
    //     },
    //     record(caseId, correct) {
    //         const data = this.load();
    //         if (correct) {
    //             data.done[caseId] = { correct };
    //             this.save(data);
    //         }
    //     },
    //     isDone(caseId) {
    //         return Boolean(this.load().done[caseId]);
    //     },
    //     completedCount() {
    //         return Object.keys(this.load().done).length;
    //     },
    //     levelName() {
    //         const count = this.completedCount();
    //         return LEVELS[Math.min(count, LEVELS.length - 1)];
    //     }
    // };
    const Progress = {
        load() {
            try {
                const saved = localStorage.getItem(STORAGE.progress);
                if (!saved) return { done: {} };
                const parsed = JSON.parse(saved);
                return parsed && parsed.done ? parsed : { done: {} };
            } catch {
                return { done: {} };
            }
        },
        save(data) {
            try {
                localStorage.setItem(STORAGE.progress, JSON.stringify(data));
            } catch {}
        },
        record(caseId, correct) {
            const data = this.load();
            // Record completion whether correct or wrong so the map style updates
            data.done[caseId] = { correct };
            this.save(data);
        },
        isDone(caseId) {
            return Boolean(this.load().done[caseId]);
        },
        completedCount() {
            // If you want level to only increase on correct answers, 
            // you can filter by `item.correct` here:
            return Object.values(this.load().done).filter(d => d.correct).length;
        },
        levelName() {
            const count = this.completedCount();
            const index = Math.max(0, Math.min(count, LEVELS.length - 1));
            return LEVELS[index];
        }
    };

    const cases = [];

    async function loadCases() {
        const loaded = await Promise.all(CASE_FILES.map(async (file) => {
            const res = await fetch(file);
            if (!res.ok) throw new Error(`Failed to load ${file} (${res.status})`);
            const data = await res.json();
            data._base = new URL(file, location.href).href;
            return data;
        }));
        cases.push(...loaded);

        cases.forEach(place => {
            if (place.title) {
                questions[place.title] = place.question;
            }
        });

        console.log("Extracted Questions Object:", questions);
    }

    const Zack = {
        textBox: null,
        face: null,
        timer: null,

        init() {
            const side = $('.mission_side');
            if (!side) return false;
            this.textBox = $('.content', side);
            this.face = $('img', side);
            return Boolean(this.textBox);
        },

        say([pose, text], speedMs = 35) {
            if (!this.textBox) return;
            clearInterval(this.timer);
            this.setMood(pose);

            const p = document.createElement('p');
            this.textBox.replaceChildren(p);

            let i = 0;
            this.timer = setInterval(() => {
                p.textContent = text.slice(0, ++i);
                if (i >= text.length) clearInterval(this.timer);
            }, speedMs);
        },

        setMood(pose) {
            if (!this.face) return;
            const fallback = 'assets/narrator/explaining_nobg.png';
            const target = `assets/narrator/${pose}_nobg.png`;
            this.face.onerror = () => { this.face.onerror = null; this.face.src = fallback; };
            this.face.src = target;
        }
    };

    function initIndexPage() {
        if (!MAP_POINTS.some(m => $(m.point))) return;
        MAP_POINTS.forEach(({ point, hint, btn, label, caseIndex }) => {
            const place = cases[caseIndex];
            const pointEl = $(point);

            if (!place || !pointEl) return;

            const hintEl = $(hint);
            if (hintEl) {
                pointEl.addEventListener('mouseenter', () => hintEl.classList.remove('hidden'));
                pointEl.addEventListener('mouseleave', () => hintEl.classList.add('hidden'));
            }

            [pointEl, $(btn), $(label)].forEach(el => {
                if (el) el.addEventListener('click', () => goToMission(place));
            });

            if (Progress.isDone(place.id)) {
                pointEl.classList.add('done');
            }
        });

        setText('.level', Progress.levelName());
    }

    function goToMission(place) {
        localStorage.setItem(STORAGE.selected, place.id);
        playSound('click');
        setTimeout(() => { location.href = 'mission.html'; }, 300);
    }

    function initMissionPage() {
        injectCustomStyles();

        const titleEl = $('#title');
        if (!titleEl) return;

        const place = cases.find(c => c.id === localStorage.getItem(STORAGE.selected));
        if (!place) {
            titleEl.textContent = 'No case selected';
            return;
        }

        let newtitle;
        let slicetitle = place.title ? place.title.slice(0, 3).toLowerCase() : '';
        
        switch (slicetitle) {
            case 'ven':
                newtitle = 'Venezuela';
                break;
            case 'ohi':
                newtitle = 'Ohio';
                break;
            case 'kaz':
                newtitle = 'Kazakhstan';
                break;
            default:
                newtitle = place.title;
                break;
        }
        
        setText('.case', place.id);
        titleEl.textContent = newtitle;
        setText('#date', place.event_date);
        setText('#desc', place.description);

        const slider = buildSlider(place);
        if (!slider) return;

        Zack.say(NARRATOR.caseLoaded);
        initGame(place, slider);
    }

    function injectCustomStyles() {
        if ($('#customMissionStyles')) return;
        const style = document.createElement('style');
        style.id = 'customMissionStyles';
        style.textContent = `
            .compare-slider.guess-armed,
            .compare-slider.guess-armed * {
                cursor: pointer !important;
            }
            .guess-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                z-index: 10;
            }
            .guess-marker.correct { background: #00c853; color: #fff; }
            .guess-marker.wrong { background: #d50000; color: #fff; }
            .guess-marker.reveal { background: #ffd600; color: #000; box-shadow: 0 0 15px #ffd600; }
            .story-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(12px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                animation: fadeIn 0.4s ease;
            }
            .story-box {
                width: 75vw;
                height: 75vh;
                background: linear-gradient(135deg, rgba(17, 17, 17, 0.95), rgba(5, 20, 30, 0.95));
                border: 2px solid rgba(111, 255, 233, 0.4);
                box-shadow: 0 0 50px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(111, 255, 233, 0.1);
                color: #fff;
                padding: 40px;
                border-radius: 24px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow-y: auto;
            }
            .story-box h2 {
                color: #6fffe9;
                font-size: 32px;
                margin-bottom: 15px;
                text-align: center;
            }
            .story-box p {
                font-size: 18px;
                line-height: 1.6;
                color: rgba(255, 255, 255, 0.85);
                margin-bottom: 20px;
            }
            .story-video-container {
                width: 100%;
                max-height: 40vh;
                flex-grow: 1;
                background: #000;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
                min-height: 200px;
            }
            .story-video-container video{
                width: 100%;
                height: auto;
                object-fit: cover;
            }
            .story-close {
                padding: 14px 28px;
                background-color: #115352;
                color: white;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: 0.3s ease;
                box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.5);
                align-self: flex-end;
            }
            .story-close:hover {
                background-color: #1a7a78;
                transform: scale(1.05);
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    function buildSlider(place) {
        const holder = $('.images');
        if (!holder) return null;

        const src = file => new URL(file, place._base).href;

        holder.innerHTML = `
            <div class="compare-slider">
                <div class="img-before">
                    <img src="${esc(src(place.before.file))}" alt="Before" draggable="false">
                    <span class="label label-before">BEFORE</span>
                </div>
                <div class="img-after">
                    <img src="${esc(src(place.after.file))}" alt="After" draggable="false">
                    <span class="label label-after">AFTER</span>
                </div>
                <div class="slider-handle">
                    <div class="slider-line"></div>
                    <div class="slider-circle">&#9664;&#9654;</div>
                </div>
            </div>`;

        const root = $('.compare-slider', holder);
        const afterWrap = $('.img-after', root);
        const afterImg = $('img', afterWrap);
        const handle = $('.slider-handle', root);

        root.style.touchAction = 'pan-y';

        let locked = false;
        let dragging = false;

        function setPercent(p) {
            p = Math.max(0, Math.min(100, p));
            afterWrap.style.clipPath = `inset(0 0 0 ${p}%)`;
            handle.style.left = `${p}%`;
        }

        function moveTo(clientX) {
            const r = root.getBoundingClientRect();
            if (r.width) setPercent(((clientX - r.left) / r.width) * 100);
        }

        root.addEventListener('pointerdown', e => {
            if (locked) return;
            dragging = true;
            root.setPointerCapture(e.pointerId);
            moveTo(e.clientX);
        });
        root.addEventListener('pointermove', e => { if (dragging) moveTo(e.clientX); });
        const stop = () => { dragging = false; };
        root.addEventListener('pointerup', stop);
        root.addEventListener('pointercancel', stop);

        setPercent(50);

        function imageBox() {
            const box = afterImg.getBoundingClientRect();
            const nw = afterImg.naturalWidth;
            const nh = afterImg.naturalHeight;
            const fit = getComputedStyle(afterImg).objectFit;
            if (!nw || !nh || fit === 'fill') return box;

            const sx = box.width / nw;
            const sy = box.height / nh;
            let scale = fit === 'cover' ? Math.max(sx, sy) : Math.min(sx, sy);

            const width = nw * scale;
            const height = nh * scale;
            return {
                left: box.left + (box.width - width) / 2,
                top: box.top + (box.height - height) / 2,
                width,
                height
            };
        }

        return {
            root,
            lock(value) { locked = value; },
            toImagePct(clientX, clientY) {
                const g = imageBox();
                return {
                    x: ((clientX - g.left) / g.width) * 100,
                    y: ((clientY - g.top) / g.height) * 100
                };
            },
            toBoxPct(x, y) {
                const g = imageBox();
                const r = root.getBoundingClientRect();
                return {
                    left: ((g.left + (x / 100) * g.width - r.left) / r.width) * 100,
                    top: ((g.top + (y / 100) * g.height - r.top) / r.height) * 100
                };
            },
            addMarker(x, y, kind, symbol) {
                const pos = this.toBoxPct(x, y);
                const m = document.createElement('div');
                m.className = `guess-marker ${kind}`;
                m.style.left = `${pos.left}%`;
                m.style.top = `${pos.top}%`;
                m.textContent = symbol;
                root.appendChild(m);
            }
        };
    }

    function ensureHotspot(place) {
        const x = Number(place.hotspot?.x);
        const y = Number(place.hotspot?.y);
        const tol = Number(place.tolerance);
        const valid = [x, y, tol].every(Number.isFinite);

        if (valid) {
            place.hotspot = { x, y };
            place.tolerance = tol;
            return;
        }

        const { min, max, tolerance } = { min: 15, max: 85, tolerance: 12 };
        const rand = () => Math.round(min + Math.random() * (max - min));
        place.hotspot = { x: rand(), y: rand() };
        place.tolerance = tolerance;
        if (!place.hint) place.hint = 'Look closely at the area where the two images differ.';
    }

    function initGame(place, slider) {
        ensureHotspot(place);

        const attemptsBox = $('#attemptsBox');
        const guessBtn = $('#guessBtn');
        const hintBox = $('#hintBox');
        const resultLine = $('#resultLine');
        if (!attemptsBox || !guessBtn || !hintBox || !resultLine) return;

        const state = { attemptsLeft: MAX_ATTEMPTS, armed: false, finished: false, outOfAttempts: false };

        function renderAttempts() {
            attemptsBox.innerHTML = Array.from({ length: MAX_ATTEMPTS }, (_, i) =>
                `<span class="pip ${i < state.attemptsLeft ? '' : 'used'}">&#9679;</span>`
            ).join('');
        }

        function showResult(text, kind) {
            resultLine.textContent = text;
            resultLine.className = `result-line ${kind}`;
        }

        renderAttempts();

        guessBtn.addEventListener('click', () => {
            if (state.outOfAttempts || state.finished) {
                openStoryModal(place);
                return;
            }

            if (state.armed) return;
            state.armed = true;
            slider.lock(true);
            slider.root.classList.add('guess-armed');
            guessBtn.disabled = true;
            guessBtn.textContent = 'Click on the image now';
            Zack.say(["explaining", "Click directly on the spot where you see the change!"]);
        }); 

        document.addEventListener('pointerdown', e => {
            if (!state.armed || state.finished) return;

            const r = slider.root.getBoundingClientRect();
            const inside = e.clientX >= r.left && e.clientX <= r.right &&
                           e.clientY >= r.top && e.clientY <= r.bottom;
            if (!inside) return;
            e.stopImmediatePropagation();

            state.armed = false;
            slider.lock(false);
            slider.root.classList.remove('guess-armed');

            const { x, y } = slider.toImagePct(e.clientX, e.clientY);
            const dist = Math.hypot(x - place.hotspot.x, y - place.hotspot.y);
            const correct = dist <= place.tolerance;

            slider.addMarker(x, y, correct ? 'correct' : 'wrong', correct ? '\u2713' : '\u2715');

            if (correct) {
                state.finished = true;
                playSound('win');
                showResult('Target confirmed. Great catch.', 'win');
                guessBtn.textContent = 'View Story ➔';
                guessBtn.disabled = false;
                
                Progress.record(place.id, true);

                const correctMsgs = NARRATOR.correct;
                const randomMsg = correctMsgs[Math.floor(Math.random() * correctMsgs.length)];
                let formattedText = randomMsg[1].replace('{level}', Progress.levelName());
                Zack.say([randomMsg[0], formattedText]);
                return;
            }

            state.attemptsLeft--;
            renderAttempts();

            if (state.attemptsLeft > 0) {
                hintBox.textContent = `Hint: ${place.hint}`;
                hintBox.classList.remove('hidden');
                guessBtn.disabled = false;
                guessBtn.textContent = `Try again (${state.attemptsLeft} left)`;
                
                const wrongOptions = NARRATOR.wrong;
                const chosenWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
                Zack.say(chosenWrong);
            } else {
                state.finished = true;
                state.outOfAttempts = true;

                hintBox.classList.add('hidden');
                slider.addMarker(place.hotspot.x, place.hotspot.y, 'reveal', '\u2605');
                showResult('Out of attempts — the correct location is marked with a star.', 'lose');
                
                guessBtn.disabled = false;
                guessBtn.textContent = 'Next ➔';
                
                Progress.record(place.id, false);

                let outMsg = NARRATOR.outOfAttempts[1].replace('{level}', Progress.levelName());
                Zack.say([NARRATOR.outOfAttempts[0], outMsg]);
            }
        }, true);
    }

    function openStoryModal(place) {
        if ($('#storyModal')) return;

        Zack.say(NARRATOR.story);

        const overlay = document.createElement('div');
        overlay.id = 'storyModal';
        overlay.className = 'story-overlay';
        overlay.innerHTML = `
            <div class="story-box" role="dialog" aria-modal="true">
                <div>
                    <h2>${esc(place.title)}</h2>
                    <p><strong style="font-size: larger; color: #008d8a;">Date of Event:</strong> ${esc(place.event_date)}</p>
                    <p>${esc(place.story.summary)}</p>
                    <p><strong style="font-size: larger; color: #008d8a;">Credits: </strong>${esc(place.credit)}</p>
                </div>
                
                <div class="story-video-container">
                    <video controls autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
                        <source src="assets/videos/${place.id}.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>

                <button class="story-close" type="button">Back to Map ➔</button>
            </div>`;

        document.body.appendChild(overlay);
        $('.story-close', overlay).addEventListener('click', () => { 
            Zack.say(NARRATOR.storyEnd);
            setTimeout(() => { location.href = 'map.html'; }, 600);
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        Zack.init();

        try {
            await loadCases();
        } catch (err) {
            console.error(err);
            return;
        }

        initIndexPage();
        initMissionPage();
    });
})();

////////////////////////   narrator in map page   ////////////////////////////

let typingTimeout = null;

function speakLetterByLetterSingle(dialogueData, textElement, imgElement, speedMs = 30) {
  if (!textElement) return;

  if (typingTimeout) clearTimeout(typingTimeout);

  const [pose, text] = dialogueData;

  if (imgElement) {
    imgElement.src = `assets/narrator/${pose}_nobg.png`;
    imgElement.alt = `Zack - ${pose}`;
  }

  textElement.textContent = "";

  let charIndex = 0;

  function typeNextLetter() {
    if (charIndex < text.length) {
      textElement.textContent += text[charIndex];
      charIndex++;
      typingTimeout = setTimeout(typeNextLetter, speedMs);
    }
  }

  typeNextLetter();
}

function playMapNarrator(status = "firstVisit") {
  const textContainer = document.getElementById("narrator-text");
  const avatarContainer = document.getElementById("narrator-img");

  const mapDialogue = NARRATOR.map[status] || NARRATOR.map.firstVisit;

  setTimeout(() => {
    speakLetterByLetterSingle(mapDialogue, textContainer, avatarContainer);
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  playMapNarrator("firstVisit");
});