/**
 * ⚔️ PK BATTLE LOGIC
 * Handles PK battle scoring and results.
 */

export const PK_ROUND_DURATION = 120; // 2 minutes

export const calculatePkResult = (score: number, opponentScore: number): 'win' | 'loss' | 'draw' => {
  if (score > opponentScore) return 'win';
  if (score < opponentScore) return 'loss';
  return 'draw';
};

export const generatePkIncrements = (round: number) => {
  // Dramatic bias to ensure clear wins/losses/draws
  // Round 1: Host likely wins, Round 2: Opponent likely wins, Round 3: Random
  let bias = 1.0;
  if (round === 1) bias = 2.5;
  else if (round === 2) bias = 0.4;
  else bias = Math.random() > 0.5 ? 2.0 : 0.5;

  const hostInc = Math.floor(Math.random() * 100 * bias);
  const oppInc = Math.floor(Math.random() * 100 * (1/bias));

  return { hostInc, oppInc };
};
