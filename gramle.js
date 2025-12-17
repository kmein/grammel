let words = [];
let solution = [];
let audioUrl = "";
let keyboardSymbols = [];
let keyStatus = {};
let currentRow = 0;
let currentGuess = [];
const rows = [];

// Grid and keyboard elements
const gridEl = document.getElementById("grid");
const keyboardEl = document.getElementById("keyboard");
const audioContainer = document.getElementById("audio-container");

function plotFromOgg(oggUrl) {
  const base = oggUrl.split("/").pop().replace(/\.(ogg|OGG|mp3)$/, "");
  return `plots/${base}.png`;
}

// Fetch JSON
fetch("words.json")
  .then((res) => res.json())
  .then((data) => {
    words = data;

    // Flatten IPA symbols for keyboard
    keyboardSymbols = Array.from(new Set(words.flatMap((w) => w.ipa))).sort();

    // Daily word
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const index = parseInt(date) % words.length;
    solution = words[index].ipa;
    audioUrl = words[index].ogg_url;

    const plotImg = document.getElementById("plot");
    plotImg.src = plotFromOgg(words[index].ogg_url);

    setupGrid();
    setupKeyboard();
    setupAudio();
    render();
  });

// ----------------- Setup functions -----------------

function setupGrid() {
  for (let i = 0; i < 6; i++) {
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    const rowCells = [];
    for (let j = 0; j < 5; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      rowEl.appendChild(cell);
      rowCells.push(cell);
    }
    gridEl.appendChild(rowEl);
    rows.push(rowCells);
  }
}

function setupKeyboard() {
  keyStatus = {};
  keyboardSymbols.forEach((symbol) => {
    const key = document.createElement("div");
    key.className = "key";
    key.textContent = symbol;
    key.onclick = () => handleKey(symbol);
    keyboardEl.appendChild(key);
    keyStatus[symbol] = key;
  });
  ["Backspace", "Enter"].forEach((k) => {
    const key = document.createElement("div");
    key.className = "key";
    key.textContent = k;
    key.onclick = () => handleKey(k);
    keyboardEl.appendChild(key);
  });
}

function setupAudio() {
  const audioBtn = document.createElement("button");
  audioBtn.textContent = "Play Audio";
  audioBtn.onclick = () => new Audio(audioUrl).play();
  audioContainer.appendChild(audioBtn);
}

// ----------------- Game logic -----------------

function handleKey(k) {
  if (currentRow >= 6) return;
  if (k === "Backspace") {
    currentGuess.pop();
  } else if (k === "Enter") {
    if (currentGuess.length !== 5) return;
    checkGuess();
  } else if (currentGuess.length < 5) {
    currentGuess.push(k);
  }
  render();
}

function render() {
  if (rows.length === 0) return;
  rows[currentRow].forEach((cell, i) => {
    cell.textContent = currentGuess[i] || "";
  });
}

function checkGuess() {
  const guess = currentGuess.slice();
  const feedback = guess.map((g, i) => {
    if (g === solution[i]) return "correct";
    else if (solution.includes(g)) return "present";
    else return "absent";
  });

  rows[currentRow].forEach((cell, i) => {
    cell.textContent = guess[i];
    cell.classList.add(feedback[i]);
  });

  guess.forEach((g, i) => {
    if (feedback[i] === "correct") keyStatus[g].className = "key used-correct";
    else if (
      feedback[i] === "present" &&
      !keyStatus[g].className.includes("used-correct")
    ) keyStatus[g].className = "key used-present";
    else if (
      feedback[i] === "absent" &&
      !keyStatus[g].className.includes("used-correct") &&
      !keyStatus[g].className.includes("used-present")
    ) keyStatus[g].className = "key used-absent";
  });

  if (guess.join("") === solution.join("")) {
    alert("Richtig!");
    currentRow = 6;
  } else {
    currentRow++;
    currentGuess = [];
    if (currentRow >= 6) alert("Spiel vorbei. Lösung: " + solution.join(""));
  }
  render();
}
