// src/pages/casino/hooks/useBlackjack.ts
import { useMemo, useState } from "react";
import type { PlayingCard, Rank, Suit } from "../components/CardDisplay";

export type Phase = "betting" | "playerTurn" | "dealerTurn" | "result";

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

const MIN_BET = 10;

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
  if (card.rank === "K" || card.rank === "Q" || card.rank === "J") return 10;
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

function drawCard(currentDeck: PlayingCard[]): [PlayingCard, PlayingCard[]] {
  if (currentDeck.length === 0) {
    const fresh = createDeck();
    return [fresh[0], fresh.slice(1)];
  }
  const [card, ...rest] = currentDeck;
  return [card, rest];
}

export function useBlackjack(
  chips: number,
  setChips: React.Dispatch<React.SetStateAction<number>>
) {
  const [deck, setDeck] = useState<PlayingCard[]>(() => createDeck());
  const [playerCards, setPlayerCards] = useState<PlayingCard[]>([]);
  const [dealerCards, setDealerCards] = useState<PlayingCard[]>([]);
  const [phase, setPhase] = useState<Phase>("betting");
  const [bet, setBet] = useState<number>(100);
  const [message, setMessage] = useState<string>("Place your bet to start.");

  const playerTotal = useMemo(() => handTotal(playerCards), [playerCards]);

  const dealerTotal = useMemo(
    () => (phase === "playerTurn" ? null : handTotal(dealerCards)),
    [dealerCards, phase]
  );

  function handleBetChange(raw: string) {
    const n = Number(raw.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(MIN_BET, Math.min(n, chips));
    setBet(clamped);
  }

  function startRound() {
    if (bet < MIN_BET) {
      alert(`Minimum bet is ${MIN_BET} chips.`);
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

    let card: PlayingCard;
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
    let card: PlayingCard;
    [card, newDeck] = drawCard(newDeck);
    const newPlayer = [...playerCards, card];

    setDeck(newDeck);
    setPlayerCards(newPlayer);

    const total = handTotal(newPlayer);
    if (total > 21) {
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
      let card: PlayingCard;
      [card, newDeck] = drawCard(newDeck);
      newDealer = [...newDealer, card];
    }

    setDeck(newDeck);
    setDealerCards(newDealer);

    const pTotal = handTotal(playerCards);
    const dTotal = handTotal(newDealer);

    let msg = "";
    if (dTotal > 21) {
      setChips((c) => c + bet * 2);
      msg = `Dealer busts with ${dTotal}. You win +${bet} chips.`;
    } else if (pTotal > dTotal) {
      setChips((c) => c + bet * 2);
      msg = `You win! ${pTotal} vs ${dTotal}. +${bet} chips.`;
    } else if (pTotal === dTotal) {
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

  return {
    // state
    phase,
    bet,
    message,
    playerCards,
    dealerCards,
    playerTotal,
    dealerTotal,
    minBet: MIN_BET,
    // actions
    setBet,
    handleBetChange,
    startRound,
    hit,
    stand,
    resetRound,
  };
}
