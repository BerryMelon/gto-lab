import { Node, NUM_ACTIONS } from './Node';

export class KuhnTrainer {
  nodeMap: Map<string, Node> = new Map();

  train(iterations: number) {
    let cards = [1, 2, 3]; // Jack, Queen, King
    let util = 0;
    for (let i = 0; i < iterations; i++) {
      for (let c1 = cards.length - 1; c1 > 0; c1--) {
        const c2 = Math.floor(Math.random() * (c1 + 1));
        [cards[c1], cards[c2]] = [cards[c2], cards[c1]];
      }
      util += this.cfr(cards, "", 1, 1);
    }
    return util / iterations;
  }

  private cfr(cards: number[], history: string, p0: number, p1: number): number {
    const plays = history.length;
    const player = plays % 2;
    const opponent = 1 - player;

    // Return payoff for terminal states
    if (plays > 1) {
      const terminalPass = history[plays - 1] === 'p';
      const doubleBet = history.slice(-2) === 'bb';
      const isPlayerCardHigher = cards[player] > cards[opponent];

      if (terminalPass) {
        if (history === 'pp') {
          return isPlayerCardHigher ? 1 : -1;
        } else {
          return 1;
        }
      } else if (doubleBet) {
        return isPlayerCardHigher ? 2 : -2;
      }
    }

    const infoSet = cards[player] + history;
    let node = this.nodeMap.get(infoSet);
    if (!node) {
      node = new Node(infoSet);
      this.nodeMap.set(infoSet, node);
    }

    const strategy = node.getStrategy(player === 0 ? p0 : p1);
    const util = new Array(NUM_ACTIONS).fill(0);
    let nodeUtil = 0;

    for (let a = 0; a < NUM_ACTIONS; a++) {
      const nextHistory = history + (a === 0 ? "p" : "b");
      util[a] = player === 0
        ? -this.cfr(cards, nextHistory, p0 * strategy[a], p1)
        : -this.cfr(cards, nextHistory, p0, p1 * strategy[a]);
      nodeUtil += strategy[a] * util[a];
    }

    for (let a = 0; a < NUM_ACTIONS; a++) {
      const regret = util[a] - nodeUtil;
      node.regretSum[a] += (player === 0 ? p1 : p0) * regret;
    }

    return nodeUtil;
  }

  getResults() {
    const sortedKeys = Array.from(this.nodeMap.keys()).sort();
    return sortedKeys.map(key => {
      const node = this.nodeMap.get(key)!;
      return {
        infoSet: key,
        strategy: node.getAverageStrategy(),
      };
    });
  }
}
