// src/pages/casino/BlackjackGame.tsx
import React, { useMemo, useState } from "react";
import DealerHand from "./components/DealerHand";
import PlayerHand from "./components/PlayerHand";
import type { PlayingCard, Rank, Suit } from "./components/CardDisplay";

type Props = {
  chips: number;
  setChips: React.Dispatch<React.SetStateAction<number>>;
};

type Phase = "betting" | "playerTurn" | "dealerTurn" | "result";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function createDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card: PlayingCard): number {
  if (card.rank === "A") return 11;
  if (card.rank === "K" || card.rank === "Q" || card.rank === "J")
    return 10;
  return Number(card.rank);
}

function handTotal(cards: PlayingCard[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValue(c);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export default function BlackjackGame({ chips, setChips }: Props) {
  const [deck, setDeck] = useState<PlayingCard[]>(() => createDeck());
  const [playerCards, setPlayerCards] = useState<PlayingCard[]>([]);
  const [dealerCards, setDealerCards] = useState<PlayingCard[]>([]);
  const [phase, setPhase] = useState<Phase>("betting");
  const [bet, setBet] = useState<number>(100);
  const [message, setMessage] = useState<string>("Place your bet to start.");

  const playerTotal = useMemo(
    () => handTotal(playerCards),
    [playerCards]
  );
  const dealerTotal = useMemo(
    () => (phase === "playerTurn" ? null : handTotal(dealerCards)),
    [dealerCards, phase]
  );

  function drawCard(currentDeck: PlayingCard[]): [PlayingCard, PlayingCard[]] {
    if (currentDeck.length === 0) {
      const fresh = createDeck();
      return [fresh[0], fresh.slice(1)];
    }
    const [card, ...rest] = currentDeck;
    return [card, rest];
  }

  function handleBetChange(raw: string) {
    const n = Number(raw.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const minBet = 10;
    const clamped = Math.max(minBet, Math.min(n, chips));
    setBet(clamped);
  }

  function startRound() {
    const minBet = 10;
    if (bet < minBet) {
      alert(`Minimum bet is ${minBet} chips.`);
      return;
    }
    if (bet > chips) {
      alert("Not enough chips for that bet.");
      return;
    }

    // take bet
    setChips((c) => c - bet);

    let newDeck = createDeck();
    const p: PlayingCard[] = [];
    const d: PlayingCard[] = [];

    let card;
    [card, newDeck] = drawCard(newDeck);
    p.push(card);
    [card, newDeck] = drawCard(newDeck);
    d.push(card);
    [card, newDeck] = drawCard(newDeck);
    p.push(card);
    [card, newDeck] = drawCard(newDeck);
    d.push(card);

    setDeck(newDeck);
    setPlayerCards(p);
    setDealerCards(d);
    setPhase("playerTurn");
    setMessage("Hit or Stand.");
  }

  function hit() {
    if (phase !== "playerTurn") return;

    let newDeck = deck.slice();
    let card;
    [card, newDeck] = drawCard(newDeck);
    const newPlayer = [...playerCards, card];

    setDeck(newDeck);
    setPlayerCards(newPlayer);

    const total = handTotal(newPlayer);
    if (total > 21) {
      // bust
      setPhase("result");
      setMessage("You busted. Dealer wins.");
    }
  }

  function stand() {
    if (phase !== "playerTurn") return;
    setPhase("dealerTurn");

    let newDeck = deck.slice();
    let newDealer = dealerCards.slice();

    while (handTotal(newDealer) < 17) {
      let card;
      [card, newDeck] = drawCard(newDeck);
      newDealer = [...newDealer, card];
    }

    setDeck(newDeck);
    setDealerCards(newDealer);

    const pTotal = handTotal(playerCards);
    const dTotal = handTotal(newDealer);

    let msg = "";
    if (dTotal > 21) {
      // dealer busts → player wins 2x
      setChips((c) => c + bet * 2);
      msg = `Dealer busts with ${dTotal}. You win +${bet} chips.`;
    } else if (pTotal > dTotal) {
      setChips((c) => c + bet * 2);
      msg = `You win! ${pTotal} vs ${dTotal}. +${bet} chips.`;
    } else if (pTotal === dTotal) {
      // push → return bet
      setChips((c) => c + bet);
      msg = `Push. You both have ${pTotal}. Bet returned.`;
    } else {
      msg = `Dealer wins with ${dTotal} vs your ${pTotal}.`;
    }

    setMessage(msg);
    setPhase("result");
  }

  function resetRound() {
    setPlayerCards([]);
    setDealerCards([]);
    setPhase("betting");
    setMessage("Place your bet to start.");
  }

  return (
    <div className="space-y-4">
      {/* Bet + status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs text-white/60 mb-1">Bet amount</div>
          <input
            type="tel"
            value={bet}
            onChange={(e) => handleBetChange(e.target.value)}
            disabled={phase !== "betting"}
            className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50"
          />
          <div className="mt-1 flex gap-1">
            {[10, 50, 100, 500].map((v) => (
              <button
                key={v}
                disabled={phase !== "betting" || v > chips}
                onClick={() => setBet(v)}
                className="px-2 py-1 rounded-full bg-zinc-800 text-[11px] text-white/70 disabled:opacity-40"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="text-white/60">Your chips</div>
          <div className="text-lg font-bold text-emerald-300">
            {chips.toLocaleString()} 🟡
          </div>
        </div>
      </div>

      {/* Hands */}
      <div className="space-y-4 rounded-2xl bg-zinc-950/80 border border-white/10 p-3">
        <DealerHand
          cards={dealerCards}
          hideHole={phase === "playerTurn"}
          total={dealerTotal}
        />
        <div className="h-px bg-white/10 my-1" />
        <PlayerHand cards={playerCards} total={playerTotal} />
      </div>

      {/* Controls */}
      <div className="space-y-2">
        {phase === "betting" && (
          <button
            onClick={startRound}
            disabled={chips <= 0}
            className="w-full py-3 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97] disabled:opacity-40"
          >
            Deal cards
          </button>
        )}

        {phase === "playerTurn" && (
          <div className="flex gap-2">
            <button
              onClick={hit}
              className="flex-1 py-3 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
            >
              Hit
            </button>
            <button
              onClick={stand}
              className="flex-1 py-3 rounded-full bg-zinc-800 text-white font-semibold text-sm active:scale-[0.97]"
            >
              Stand
            </button>
          </div>
        )}

        {phase === "result" && (
          <button
            onClick={resetRound}
            className="w-full py-3 rounded-full bg-zinc-800 text-white font-semibold text-sm active:scale-[0.97]"
          >
            New hand
          </button>
        )}

        <div className="text-[11px] text-white/60 mt-1">{message}</div>
      </div>
    </div>
  );
}
