// src/pages/casino/BlackjackGame.tsx
import React, { useMemo, useState } from "react";

type Props = {
  chips: number;
  onChipsChange: (next: number) => void;
};

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

type Card = {
  suit: Suit;
  rank: Rank;
};

type RoundState = "idle" | "playerTurn" | "dealerTurn" | "finished";

function createDeck(): Card[] {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const ranks: Rank[] = [
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

function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (rank === "K" || rank === "Q" || rank === "J" || rank === "10") return 10;
  return Number(rank);
}

// return best blackjack total (handle A as 1 or 11)
function handTotal(cards: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const c of cards) {
    total += cardValue(c.rank);
    if (c.rank === "A") aces += 1;
  }

  // downgrade Aces from 11 → 1 while busting
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handTotal(cards) === 21;
}

function formatCardLabel(card: Card): string {
  return `${card.rank}${card.suit}`;
}

function CardView({ card }: { card: Card }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <div className="w-12 h-16 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/15 flex flex-col items-center justify-between px-1 py-1 shadow-md relative">
      <div
        className={`text-[10px] font-semibold ${
          isRed ? "text-red-400" : "text-white"
        }`}
      >
        {card.rank}
      </div>
      <div className="text-lg">💸</div>
      <div
        className={`text-[11px] ${
          isRed ? "text-red-400" : "text-white"
        }`}
      >
        {card.suit}
      </div>
    </div>
  );
}

function HiddenCard() {
  return (
    <div className="w-12 h-16 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-500 border border-emerald-300/70 flex items-center justify-center shadow-lg">
      <span className="text-lg">?</span>
    </div>
  );
}

export default function BlackjackGame({ chips, onChipsChange }: Props) {
  const [deck, setDeck] = useState<Card[]>(() => createDeck());
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [bet, setBet] = useState<number>(100);
  const [roundState, setRoundState] = useState<RoundState>("idle");
  const [message, setMessage] = useState<string>("Place your bet and press Deal.");
  const [revealDealer, setRevealDealer] = useState<boolean>(false);
  const [lastOutcome, setLastOutcome] = useState<"win" | "lose" | "push" | null>(null);

  const minBet = 10;

  const playerTotal = useMemo(() => handTotal(playerHand), [playerHand]);
  const dealerTotal = useMemo(() => handTotal(dealerHand), [dealerHand]);

  function drawCard(currentDeck: Card[]): [Card, Card[]] {
    if (currentDeck.length === 0) {
      const fresh = createDeck();
      return [fresh[0], fresh.slice(1)];
    }
    const [card, ...rest] = currentDeck;
    return [card, rest];
  }

  function handleBetInput(value: string) {
    const cleaned = value.replace(/[^\d]/g, "");
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(minBet, Math.min(n, chips));
    setBet(clamped);
  }

  function setQuickBet(amount: number) {
    const clamped = Math.max(minBet, Math.min(amount, chips));
    setBet(clamped);
  }

  function startNewRound() {
    if (roundState === "playerTurn" || roundState === "dealerTurn") return;

    if (chips <= 0) {
      setMessage("You have no chips. Go earn or buy more chips first.");
      return;
    }

    if (bet < minBet) {
      setMessage(`Minimum bet is ${minBet} chips.`);
      return;
    }

    if (bet > chips) {
      setMessage("You don't have enough chips for that bet.");
      return;
    }

    // take bet up-front
    onChipsChange(chips - bet);

    let d = deck;
    const p: Card[] = [];
    const dl: Card[] = [];

    // deal: player, dealer, player, dealer
    let c;
    [c, d] = drawCard(d);
    p.push(c);
    [c, d] = drawCard(d);
    dl.push(c);
    [c, d] = drawCard(d);
    p.push(c);
    [c, d] = drawCard(d);
    dl.push(c);

    setDeck(d);
    setPlayerHand(p);
    setDealerHand(dl);
    setRevealDealer(false);
    setLastOutcome(null);

    const pTotal = handTotal(p);
    const dTotal = handTotal(dl);

    if (isBlackjack(p) && isBlackjack(dl)) {
      // push
      setRoundState("finished");
      setMessage("Both have Blackjack! Push.");
      setLastOutcome("push");
      onChipsChange(chips - bet + bet); // refund bet
    } else if (isBlackjack(p)) {
      setRoundState("finished");
      setMessage("Blackjack! You win 2.5x your bet.");
      setLastOutcome("win");
      const payout = Math.floor(bet * 2.5);
      onChipsChange(chips - bet + payout);
    } else if (isBlackjack(dl)) {
      setRoundState("finished");
      setRevealDealer(true);
      setMessage("Dealer has Blackjack. You lose.");
      setLastOutcome("lose");
      // bet already lost
    } else {
      setRoundState("playerTurn");
      setMessage("Your turn – Hit or Stand?");
    }
  }

  function handleHit() {
    if (roundState !== "playerTurn") return;

    let d = deck;
    let c;
    [c, d] = drawCard(d);
    const newHand = [...playerHand, c];

    setDeck(d);
    setPlayerHand(newHand);

    const total = handTotal(newHand);
    if (total > 21) {
      setRoundState("finished");
      setRevealDealer(true);
      setMessage("You busted. Dealer wins.");
      setLastOutcome("lose");
      // bet already lost
    } else {
      setMessage("You drew a card. Hit or Stand?");
    }
  }

  function handleStand() {
    if (roundState !== "playerTurn") return;

    setRoundState("dealerTurn");
    setRevealDealer(true);

    let d = deck;
    let dealer = [...dealerHand];

    // dealer hits until 17+
    while (handTotal(dealer) < 17) {
      let c;
      [c, d] = drawCard(d);
      dealer.push(c);
    }

    setDeck(d);
    setDealerHand(dealer);

    const pTotal = handTotal(playerHand);
    const dTotal = handTotal(dealer);

    if (dTotal > 21) {
      // dealer busts, you win 2x
      setMessage("Dealer busts! You win.");
      setRoundState("finished");
      setLastOutcome("win");
      onChipsChange(chips + bet * 2); // you get bet back + win bet
      return;
    }

    if (pTotal > dTotal) {
      setMessage("You win! Higher hand than dealer.");
      setRoundState("finished");
      setLastOutcome("win");
      onChipsChange(chips + bet * 2);
    } else if (pTotal < dTotal) {
      setMessage("Dealer wins. Better luck next time.");
      setRoundState("finished");
      setLastOutcome("lose");
      // bet already lost
    } else {
      setMessage("Push. Your bet is returned.");
      setRoundState("finished");
      setLastOutcome("push");
      onChipsChange(chips + bet); // refund
    }
  }

  function handleNewDeckIfNeeded() {
    if (deck.length < 15) {
      setDeck(createDeck());
    }
  }

  // whenever a new round starts from idle/finished, ensure deck is okay
  function handleDealClick() {
    handleNewDeckIfNeeded();
    startNewRound();
  }

  const canAct = roundState === "playerTurn";

  return (
    <div className="text-white text-sm space-y-4">
      {/* Bet + chips row */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex-1">
          <div className="text-[11px] text-white/60 mb-1">Bet (min {minBet})</div>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={bet}
              onChange={(e) => handleBetInput(e.target.value)}
              className="flex-1 rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none"
            />
            <div className="flex gap-1">
              {[10, 50, 100, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => setQuickBet(v)}
                  className="px-2 py-1 rounded-full bg-zinc-800 text-[11px] text-white/70"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-white/60">Chips</div>
          <div className="text-lg font-bold text-emerald-300">
            {chips.toLocaleString()} 🟡
          </div>
        </div>
      </div>

      {/* Dealer hand */}
      <div className="rounded-2xl bg-zinc-950/80 border border-white/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/70">Dealer</span>
          <span className="text-xs text-white/60">
            {revealDealer ? `Total: ${dealerTotal}` : "Total: ???"}
          </span>
        </div>
        <div className="flex gap-2">
          {dealerHand.map((card, idx) =>
            idx === 0 || revealDealer ? (
              <CardView key={idx} card={card} />
            ) : (
              <HiddenCard key={idx} />
            )
          )}
          {dealerHand.length === 0 && (
            <span className="text-[11px] text-white/40">No cards yet.</span>
          )}
        </div>
      </div>

      {/* Player hand */}
      <div className="rounded-2xl bg-zinc-950/80 border border-white/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/70">You</span>
          <span className="text-xs text-white/60">
            Total: {playerHand.length === 0 ? "-" : playerTotal}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {playerHand.map((card, idx) => (
            <CardView key={idx} card={card} />
          ))}
          {playerHand.length === 0 && (
            <span className="text-[11px] text-white/40">No cards yet.</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleDealClick}
          className="flex-1 py-2 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
        >
          {roundState === "idle" || roundState === "finished" ? "Deal" : "Re-Deal"}
        </button>
        <button
          onClick={handleHit}
          disabled={!canAct}
          className={`flex-1 py-2 rounded-full text-sm font-semibold ${
            canAct
              ? "bg-zinc-800 text-white active:scale-[0.97]"
              : "bg-zinc-900 text-white/40"
          }`}
        >
          Hit
        </button>
        <button
          onClick={handleStand}
          disabled={!canAct}
          className={`flex-1 py-2 rounded-full text-sm font-semibold ${
            canAct
              ? "bg-zinc-800 text-white active:scale-[0.97]"
              : "bg-zinc-900 text-white/40"
          }`}
        >
          Stand
        </button>
      </div>

      {/* Message */}
      <div className="text-[11px] text-white/60">
        {message}
        {lastOutcome && (
          <>
            {" "}
            {lastOutcome === "win" && (
              <span className="text-emerald-400 font-semibold">(+win)</span>
            )}
            {lastOutcome === "lose" && (
              <span className="text-red-400 font-semibold">(-lose)</span>
            )}
            {lastOutcome === "push" && (
              <span className="text-amber-300 font-semibold">(push)</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
