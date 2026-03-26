export const NUM_ACTIONS = 2; // PASS=0, BET=1

export class Node {
  infoSet: string;
  regretSum: number[];
  strategy: number[];
  strategySum: number[];

  constructor(infoSet: string) {
    this.infoSet = infoSet;
    this.regretSum = new Array(NUM_ACTIONS).fill(0);
    this.strategy = new Array(NUM_ACTIONS).fill(0);
    this.strategySum = new Array(NUM_ACTIONS).fill(0);
  }

  getStrategy(realizationWeight: number): number[] {
    let normalizingSum = 0;
    for (let a = 0; a < NUM_ACTIONS; a++) {
      this.strategy[a] = this.regretSum[a] > 0 ? this.regretSum[a] : 0;
      normalizingSum += this.strategy[a];
    }
    for (let a = 0; a < NUM_ACTIONS; a++) {
      if (normalizingSum > 0) {
        this.strategy[a] /= normalizingSum;
      } else {
        this.strategy[a] = 1.0 / NUM_ACTIONS;
      }
      this.strategySum[a] += realizationWeight * this.strategy[a];
    }
    return this.strategy;
  }

  getAverageStrategy(): number[] {
    let avgStrategy = new Array(NUM_ACTIONS).fill(0);
    let normalizingSum = 0;
    for (let a = 0; a < NUM_ACTIONS; a++) {
      normalizingSum += this.strategySum[a];
    }
    for (let a = 0; a < NUM_ACTIONS; a++) {
      if (normalizingSum > 0) {
        avgStrategy[a] = this.strategySum[a] / normalizingSum;
      } else {
        avgStrategy[a] = 1.0 / NUM_ACTIONS;
      }
    }
    return avgStrategy;
  }
}
