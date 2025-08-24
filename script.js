
const scrambledEl = document.getElementById("scrambled");
const slotsEl     = document.getElementById("slots");
const triesEl     = document.getElementById("tries-count");
const mistakesEl  = document.getElementById("mistakes-count");
const btnRandom   = document.getElementById("btn-random");
const btnReset    = document.getElementById("btn-reset");

// ====== STATE ======
let currentWord = "";
let triesLeft   = 5;
let mistakes    = 0;
let inputIndex  = 0;           // pointer to next empty slot
let guessArray  = [];          // letters the user typed (same length as word)

// ====== UTIL ======
function shuffle(word) {
  // Fisher–Yates for a fair shuffle
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // space out letters for the UI
  return arr.join(" ");
}

async function fetchWord() {
  try {
    const r = await fetch("https://random-word-api.herokuapp.com/word?number=1");
    const data = await r.json();
    // Ensure only letters (some APIs return hyphenated words)
    return String(data[0]).toLowerCase().replace(/[^a-z]/g, "").slice(0, 16) || "default";
  } catch {
    return "default";
  }
}

// ====== RENDER ======
function renderSlots(len) {
  slotsEl.innerHTML = "";
  for (let i = 0; i < len; i++) {
    const div = document.createElement("div");
    div.className = "slot";
    // show letter if already typed
    div.textContent = guessArray[i] || "";
    slotsEl.appendChild(div);
  }
}

function updateStatus() {
  triesEl.textContent    = `${triesLeft}/5`;
  mistakesEl.textContent = mistakes;
}


async function newGame() {
  currentWord = await fetchWord();              // or pick from your array
  scrambledEl.textContent = shuffle(currentWord);

  triesLeft = 5;
  mistakes  = 0;
  inputIndex = 0;
  guessArray = new Array(currentWord.length).fill("");

  renderSlots(currentWord.length);
  updateStatus();
}

function backspace() {
  if (inputIndex > 0) {
    inputIndex--;
    guessArray[inputIndex] = "";
    // update just that slot
    slotsEl.children[inputIndex].textContent = "";
  }
}

function typeLetter(letter) {
  if (inputIndex >= currentWord.length) return;   // already full
  guessArray[inputIndex] = letter;
  slotsEl.children[inputIndex].textContent = letter;
  inputIndex++;

  if (inputIndex === currentWord.length) {
    // evaluate guess
    const guess = guessArray.join("");
    if (guess === currentWord) {
      alert("🎉 Correct! The word is \"" + currentWord + "\"");
      newGame();
    } else {
      triesLeft--;
      mistakes++;
      updateStatus();

      if (triesLeft <= 0) {
        alert("❌ Game over. The word was \"" + currentWord + "\"");
        newGame();
      } else {
        // clear for next attempt
        guessArray.fill("");
        inputIndex = 0;
        for (let i = 0; i < slotsEl.children.length; i++) {
          slotsEl.children[i].textContent = "";
        }
      }
    }
  }
}

// ====== INPUT: KEYBOARD ======
function handleKeydown(e) {
  const k = e.key.toLowerCase();

  if (k === "backspace") {
    e.preventDefault();
    backspace();
    return;
  }

  if (k.length === 1 && k >= "a" && k <= "z") {
    e.preventDefault();
    typeLetter(k);
  }
}

document.addEventListener("keydown", handleKeydown);

// ====== BUTTONS ======
btnRandom?.addEventListener("click", newGame);
btnReset ?.addEventListener("click", newGame);

// ====== START ======
newGame();

