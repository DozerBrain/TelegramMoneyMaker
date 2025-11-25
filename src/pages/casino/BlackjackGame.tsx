// src/pages/casino/BlackjackGame.tsx
import React, { useMemo, useState } from "react";

type CardSuit = "♠" | "♥" | "♦" | "♣";
type CardRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

type Card = {
  suit: CardSuit;
  rank: CardRank;
};

type Props = {
  chips: number;
  setChips: (next: number) => void; // ✅ this matches Games.tsx
};

type Phase = "betting" | "playerTurn" | "dealerTurn" | "finished";

function makeDeck(): Card[] {
  const suits: CardSuit[] = ["♠", "♥", "♦", "♣"];
  const ranks: CardRank[] = [
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
  const deck: Card[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      deck.push({ suit: s, rank: r });
    }
  }
  // simple shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(rank: CardRank): number {
  if (rank === "A") return 11; // handle later
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  return Number(rank);
}

function handValue(hand: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;

  for (const c of hand) {
    total += cardValue(c.rank);
    if (c.rank === "A") aces += 1;
  }

  // downgrade aces from 11 to 1 if we bust
  let soft = false;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  if (aces > 0) {
    soft = true;
  }
  return { total, soft };
}

function isBlackjack(hand: Card[]) {
  const { total } = handValue(hand);
  return hand.length === 2 && total === 21;
}

export default function BlackjackGame({ chips, setChips }: Props) {
  const [deck, setDeck] = useState<Card[]>(() => makeDeck());
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [bet, setBet] = useState<number>(50);
  const [phase, setPhase] = useState<Phase>("betting");
  const [message, setMessage] = useState<string>("Place your bet to start.");
  const [lastResult, setLastResult] = useState<string | null>(null);

  const minBet = 10;

  function drawCard(currentDeck: Card[]): [Card, Card[]] {
    if (currentDeck.length === 0) {
      const fresh = makeDeck();
      return [fresh[0], fresh.slice(1)];
    }
    const [card, ...rest] = currentDeck;
    return [card, rest];
  }

  function resetHands() {
    setPlayerHand([]);
    setDealerHand([]);
  }

  function startRound() {
    if (bet < minBet) {
      alert(`Minimum bet is ${minBet} chips.`);
      return;
    }
    if (bet > chips) {
      alert("You don't have enough chips for that bet.");
      return;
    }

    // take bet up-front
    setChips(chips - bet);
    resetHands();
    setLastResult(null);

    let d = deck;
    let p: Card[] = [];
    let dealer: Card[] = [];

    // deal player, dealer, player, dealer
    [p[0], d] = drawCard(d);
    [dealer[0], d] = drawCard(d);
    [p[1], d] = drawCard(d);
    [dealer[1], d] = drawCard(d);

    setDeck(d);
    setPlayerHand(p);
    setDealerHand(dealer);

    const playerBJ = isBlackjack(p);
    const dealerBJ = isBlackjack(dealer);

    if (playerBJ || dealerBJ) {
      // immediate resolution
      setPhase("finished");
      if (playerBJ && dealerBJ) {
        // push
        setChips((c) => c + bet);
        setMessage("Both you and dealer have blackjack. Push.");
        setLastResult("Push");
      } else if (playerBJ) {
        const win = Math.floor(bet * 2.5); // 3:2 payout approximated
        setChips((c) => c + win);
        setMessage("Blackjack! You win 3:2.");
        setLastResult("Blackjack win");
      } else {
        setMessage("Dealer has blackjack. You lose.");
        setLastResult("Dealer blackjack");
      }
    } else {
      setPhase("playerTurn");
      setMessage("Hit or Stand?");
    }
  }

  function hit() {
    if (phase !== "playerTurn") return;

    let d = deck;
    let newHand = [...playerHand];
    let card: Card;
    [card, d] = drawCard(d);
    newHand.push(card);
    setDeck(d);
    setPlayerHand(newHand);

    const { total } = handValue(newHand);
    if (total > 21) {
      setPhase("finished");
      setMessage("You busted. Dealer wins.");
      setLastResult("Bust");
    } else {
      setMessage("Hit or Stand?");
    }
  }

  function stand() {
    if (phase !== "playerTurn") return;

    setPhase("dealerTurn");
    setMessage("Dealer's turn...");

    let d = deck;
    let dealer = [...dealerHand];

    // dealer hits until 17+ (classic rule)
    while (true) {
      const { total } = handValue(dealer);
      if (total >= 17) break;
      let card: Card;
      [card, d] = drawCard(d);
      dealer.push(card);
    }

    setDeck(d);
    setDealerHand(dealer);

    const playerTotal = handValue(playerHand).total;
    const dealerTotal = handValue(dealer).total;

    setPhase("finished");

    if (dealerTotal > 21) {
      // dealer busts, player wins
      setChips((c) => c + bet * 2);
      setMessage("Dealer busts. You win!");
      setLastResult("Win");
    } else if (dealerTotal === playerTotal) {
      // push
      setChips((c) => c + bet);
      setMessage("Push. Your bet is returned.");
      setLastResult("Push");
    } else if (playerTotal > dealerTotal) {
      // normal win
      setChips((c) => c + bet * 2);
      setMessage("You win!");
      setLastResult("Win");
    } else {
      setMessage("Dealer wins.");
      setLastResult("Lose");
    }
  }

  function newRound() {
    setPhase("betting");
    setMessage("Place your bet to start.");
    resetHands();
  }

  const playerValue = useMemo(() => handValue(playerHand).total, [playerHand]);
  const dealerValue = useMemo(() => handValue(dealerHand).total, [dealerHand]);

  function handleBetChange(value: string) {
    const n = Number(value.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(minBet, Math.min(n, chips));
    setBet(clamped);
  }

  return (
    <div className="text-sm text-white">
      {/* Status */}
      <div className="mb-3 text-xs text-white/70">{message}</div>

      {/* Chips + bet */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] text-white/60">Your chips</div>
          <div className="text-lg font-bold text-emerald-300">
            {chips.toLocaleString()} 🟡
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-white/60">Bet</div>
          <input
            type="tel"
            value={bet}
            onChange={(e) => handleBetChange(e.target.value)}
            disabled={phase !== "betting"}
            className="w-24 px-2 py-1 rounded-lg bg-black/60 border border-white/20 text-right text-sm"
          />
          <div className="flex gap-1 mt-1 justify-end">
            {[10, 50, 100, 500].map((v) => (
              <button
                key={v}
                onClick={() => phase === "betting" && setBet(Math.min(v, chips))}
                className="px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] text-white/70"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dealer hand */}
      <div className="mb-3">
        <div className="text-[11px] text-white/60 mb-1">
          Dealer{" "}
          {phase === "betting" && "(waiting)"}
          {phase !== "betting" && `(${dealerValue})`}
        </div>
        <div className="flex gap-2 flex-wrap">
          {dealerHand.length === 0 ? (
            <div className="text-[11px] text-white/40">No cards yet.</div>
          ) : (
            dealerHand.map((c, idx) => (
              <div
                key={idx}
                className="w-10 h-14 rounded-lg bg-zinc-900 border border-white/20 flex flex-col items-center justify-center text-xs"
              >
                <div
                  className={
                    c.suit === "♥" || c.suit === "♦"
                      ? "text-red-400"
                      : "text-white"
                  }
                >
                  {c.rank}
                </div>
                <div className="text-[13px] mt-0.5">
                  {c.suit}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Player hand */}
      <div className="mb-4">
        <div className="text-[11px] text-white/60 mb-1">
          You ({playerValue})
        </div>
        <div className="flex gap-2 flex-wrap">
          {playerHand.length === 0 ? (
            <div className="text-[11px] text-white/40">
              No cards yet. Place a bet to start.
            </div>
          ) : (
            playerHand.map((c, idx) => (
              <div
                key={idx}
                className="w-10 h-14 rounded-lg bg-zinc-900 border border-emerald-300/50 flex flex-col items-center justify-center text-xs"
              >
                <div
                  className={
                    c.suit === "♥" || c.suit === "♦"
                      ? "text-red-400"
                      : "text-white"
                  }
                >
                  {c.rank}
                </div>
                <div className="text-[13px] mt-0.5">
                  {c.suit}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {phase === "betting" && (
          <button
            onClick={startRound}
            className="flex-1 py-2 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
            disabled={chips < minBet}
          >
            Deal
          </button>
        )}

        {phase === "playerTurn" && (
          <>
            <button
              onClick={hit}
              className="flex-1 py-2 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
            >
              Hit
            </button>
            <button
              onClick={stand}
              className="flex-1 py-2 rounded-full bg-zinc-700 text-white font-semibold text-sm active:scale-[0.97]"
            >
              Stand
            </button>
          </>
        )}

        {phase === "finished" && (
          <button
            onClick={newRound}
            className="flex-1 py-2 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
          >
            New Round
          </button>
        )}
      </div>

      {/* Last result */}
      {lastResult && (
        <div className="mt-3 text-[11px] text-white/60">
          Last result:{" "}
          <span
            className={
              lastResult === "Win" || lastResult === "Blackjack win"
                ? "text-emerald-400 font-semibold"
                : lastResult === "Push"
                ? "text-white font-semibold"
                : "text-red-400 font-semibold"
            }
          >
            {lastResult}
          </span>
        </div>
      )}
    </div>
  );
}
