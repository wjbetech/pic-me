const fs = require("fs");
const path = require("path");

function readAll() {
  const dir = path.join(__dirname, "..", "src", "data");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const combined = [];
  for (const f of files) {
    const p = path.join(dir, f);
    const arr = JSON.parse(fs.readFileSync(p, "utf8"));
    arr.forEach((a) => combined.push({ ...a, _file: f }));
  }
  return combined;
}

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const animals = readAll();
console.log("loaded", animals.length, "animals");

// simulate random sampling with replacement
function sampleRandom(times) {
  const counts = {};
  const seq = [];
  for (let t = 0; t < times; t++) {
    const idx = Math.floor(Math.random() * animals.length);
    const a = animals[idx];
    counts[a.id] = (counts[a.id] || 0) + 1;
    seq.push(a.id);
  }
  return { counts, seq };
}

// simulate shuffled queue
function sampleQueue(times) {
  const q = shuffle(animals);
  const seq = [];
  for (let t = 0; t < times; t++) {
    const a = q[t % q.length];
    seq.push(a.id);
  }
  return seq;
}

function analyze(seq) {
  const byFirst = {};
  for (let i = 0; i < seq.length; i++) {
    const id = seq[i];
    const first = id.split("-")[0];
    byFirst[first] = (byFirst[first] || 0) + 1;
  }
  // longest run of same first letter
  let longest = 1,
    current = 1;
  for (let i = 1; i < seq.length; i++) {
    if (seq[i].split("-")[0] === seq[i - 1].split("-")[0]) current++;
    else current = 1;
    if (current > longest) longest = current;
  }
  return { byFirst, longest };
}

const r = sampleRandom(5000);
const ar = analyze(r.seq);
console.log(
  "Random sampling by first letter counts:",
  ar.byFirst,
  "longest run same-letter:",
  ar.longest
);

const qseq = sampleQueue(5000);
const aq = analyze(qseq);
console.log(
  "Queue sampling by first letter counts:",
  aq.byFirst,
  "longest run same-letter:",
  aq.longest
);

// show top 10 ids by count
const countsArr = Object.entries(r.counts).sort((a, b) => b[1] - a[1]);
console.log("Top 10 picks (random):", countsArr.slice(0, 10));

// show sample of first 30 from queue
console.log("First 30 of queue:", qseq.slice(0, 30));
