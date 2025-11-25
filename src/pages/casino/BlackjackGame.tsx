// src/pages/casino/BlackjackGame.tsx
import React, { useMemo, useState } from "react";

type Card = {
  rank: string; // "A", "2"..."K"
  suit: "♠" | "♥" | "♦" | "♣";
};

type Props = {
  chips: number;
  setChips: (n: number) => void;
};

const SUITS: Card["suit"][] = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const MIN_BET = 10;

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push({ rank: r, suit: s });
    }
  }
  // simple shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function handValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const c of hand) {
    if (c.rank === "A") {
      aces += 1;
      total += 11;
    } else if (["J", "Q", "K"].includes(c.rank)) {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function cardKey(c: Card, idx: number) {
  return `${c.rank}${c.suit}-${idx}`;
}

export default function BlackjackGame({ chips, setChips }: Props) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [bet, setBet] = useState<number>(MIN_BET);
  const [phase, setPhase] = useState<"bet" | "player" | "dealer" | "result">(
    "bet"
  );
  const [resultText, setResultText] = useState<string>("");

  const playerValue = useMemo(() => handValue(player), [player]);
  const dealerValue = useMemo(() => handValue(dealer), [dealer]);

  function resetHands(newDeck?: Card[]) {
    setPlayer([]);
    setDealer([]);
    setResultText("");
    setPhase("bet");
    if (newDeck) setDeck(newDeck);
  }

  function drawCard(currentDeck: Card[]): [Card, Card[]] {
    if (currentDeck.length === 0) {
      const fresh = buildDeck();
      return [fresh[0], fresh.slice(1)];
    }
    const [card, ...rest] = currentDeck;
    return [card, rest];
  }

  function startRound() {
    if (chips < MIN_BET) {
      alert("You don’t have enough chips to play. Exchange money into chips.");
      return;
    }
    if (bet < MIN_BET) {
      alert(`Minimum bet is ${MIN_BET} chips.`);
      return;
    }
    if (bet > chips) {
      alert("Your bet is higher than your chips.");
      return;
    }

    let d = [...deck];
    const p: Card[] = [];
    const dl: Card[] = [];

    let c1; let c2; let c3; let c4;

    [c1, d] = drawCard(d);
    [c2, d] = drawCard(d);
    [c3, d] = drawCard(d);
    [c4, d] = drawCard(d);

    p.push(c1, c3);
    dl.push(c2, c4);

    setPlayer(p);
    setDealer(dl);
    setDeck(d);
    setResultText("");
    setPhase("player");
  }

  function hit() {
    if (phase !== "player") return;
    let d = [...deck];
    let c;
    [c, d] = drawCard(d);
    const nextHand = [...player, c];
    setPlayer(nextHand);
    setDeck(d);

    const val = handValue(nextHand);
    if (val > 21) {
      const newChips = Math.max(0, chips - bet);
      setChips(newChips);
      setResultText("Bust! You lose.");
      setPhase("result");
    }
  }

  function stand() {
    if (phase !== "player") return;
    setPhase("dealer");

    let d = [...deck];
    let dl = [...dealer];

    while (handValue(dl) < 17) {
      let c;
      [c, d] = drawCard(d);
      dl.push(c);
    }

    setDealer(dl);
    setDeck(d);

    const pVal = handValue(player);
    const dVal = handValue(dl);

    let outcome = "";
    let delta = 0;

    if (dVal > 21) {
      outcome = "Dealer busts. You win!";
      delta = bet;
    } else if (pVal > dVal) {
      outcome = "You win!";
      delta = bet;
    } else if (pVal < dVal) {
      outcome = "Dealer wins.";
      delta = -bet;
    } else {
      outcome = "Push. Nobody wins.";
      delta = 0;
    }

    if (delta !== 0) {
      setChips(Math.max(0, chips + delta));
    }

    setResultText(outcome);
    setPhase("result");
  }

  function newRound() {
    resetHands(deck);
  }

  function handleBetChange(v: string) {
    const n = Number(v.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(MIN_BET, Math.min(n, chips));
    setBet(clamped);
  }

  const canPlay = chips >= MIN_BET;

  return (
    <div className="space-y-3 text-sm text-white">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/60">
          Your chips:{" "}
          <span className="text-emerald-300 font-semibold">
            {chips.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-white/60">
          Bet:{" "}
          <input
            type="tel"
            value={bet}
            onChange={(e) => handleBetChange(e.target.value)}
            className="w-20 px-2 py-1 rounded-lg bg-black/60 border border-white/15 text-right text-xs"
          />
        </div>
      </div>

      {/* Dealer hand */}
      <div className="rounded-2xl bg-zinc-900/70 border border-white/10 p-3">
        <div className="text-xs text-white/60 mb-1">Dealer</div>
        <div className="flex gap-2 mb-1">
          {dealer.map((c, i) => (
            <div
              key={cardKey(c, i)}
              className={`w-10 h-14 rounded-xl border flex items-center justify-center text-xs font-semibold ${
                c.suit === "♥" || c.suit === "♦"
                  ? "bg-zinc-950 border-red-400/40 text-red-300"
                  : "bg-zinc-950 border-white/30 text-white"
              }`}
            >
              {c.rank}
              {c.suit}
            </div>
          ))}
          {dealer.length === 0 && (
            <div className="text-xs text-white/40">No cards yet.</div>
          )}
        </div>
        <div className="text-[11px] text-white/50">
          Value: <span className="font-semibold">{dealerValue}</span>
        </div>
      </div>

      {/* Player hand */}
      <div className="rounded-2xl bg-zinc-900/70 border border-white/10 p-3">
        <div className="text-xs text-white/60 mb-1">You</div>
        <div className="flex gap-2 mb-1">
          {player.map((c, i) => (
            <div
              key={cardKey(c, i)}
              className={`w-10 h-14 rounded-xl border flex items-center justify-center text-xs font-semibold ${
                c.suit === "♥" || c.suit === "♦"
                  ? "bg-zinc-950 border-red-400/40 text-red-300"
                  : "bg-zinc-950 border-white/30 text-white"
              }`}
            >
              {c.rank}
              {c.suit}
            </div>
          ))}
          {player.length === 0 && (
            <div className="text-xs text-white/40">No cards yet.</div>
          )}
        </div>
        <div className="text-[11px] text-white/50 mb-2">
          Value: <span className="font-semibold">{playerValue}</span>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {phase === "bet" && (
            <button
              onClick={startRound}
              disabled={!canPlay}
              className="flex-1 py-2 rounded-full bg-emerald-500 text-emerald-950 text-sm font-semibold disabled:bg-zinc-700 disabled:text-white/40"
            >
              Deal
            </button>
          )}

          {phase === "player" && (
            <>
              <button
                onClick={hit}
                className="flex-1 py-2 rounded-full bg-emerald-500 text-emerald-950 text-sm font-semibold"
              >
                Hit
              </button>
              <button
                onClick={stand}
                className="flex-1 py-2 rounded-full bg-zinc-700 text-white text-sm font-semibold"
              >
                Stand
              </button>
            </>
          )}

          {phase === "result" && (
            <button
              onClick={newRound}
              className="flex-1 py-2 rounded-full bg-emerald-500 text-emerald-950 text-sm font-semibold"
            >
              New Round
            </button>
          )}
        </div>
      </div>

      {/* Result text */}
      <div className="text-xs text-center text-white/70 min-h-[18px]">
        {resultText || "Place a bet and press Deal to start."}
      </div>
    </div>
  );
}
