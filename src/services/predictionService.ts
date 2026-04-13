import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Prediction {
  id: string;
  roomId: string;
  hostUid: string;
  question: string;
  sideYes: string;
  sideNo: string;
  status: 'open' | 'closed' | 'settled' | 'cancelled';
  winningSide?: 'yes' | 'no' | null;
  totalYes: number;
  totalNo: number;
  model: 1 | 2;
  targetMultiplier?: number;
  actualMultiplier?: number;
  startTime: any;
  endTime?: any;
}

export interface Bet {
  id: string;
  userId: string;
  predictionId: string;
  side: 'yes' | 'no';
  amount: number;
  settled: boolean;
  payout?: number;
  timestamp: any;
}

const HOUSE_FEE = 0.10; // 10%

export const predictionService = {
  /**
   * Create a new prediction
   */
  async createPrediction(data: Omit<Prediction, 'id' | 'status' | 'totalYes' | 'totalNo' | 'startTime'>) {
    const predictionRef = doc(collection(db, 'predictions'));
    const prediction: Prediction = {
      ...data,
      id: predictionRef.id,
      status: 'open',
      totalYes: 0,
      totalNo: 0,
      startTime: serverTimestamp(),
    };
    
    await runTransaction(db, async (transaction) => {
      transaction.set(predictionRef, prediction);
    });
    
    return predictionRef.id;
  },

  /**
   * Place a bet on a prediction
   */
  async placeBet(userId: string, predictionId: string, side: 'yes' | 'no', amount: number) {
    const userRef = doc(db, 'users', userId);
    const predictionRef = doc(db, 'predictions', predictionId);
    const betRef = doc(collection(db, 'bets'));
    const txRef = doc(collection(db, 'transactions'));

    return await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const predictionDoc = await transaction.get(predictionRef);

      if (!userDoc.exists()) throw new Error("User not found");
      if (!predictionDoc.exists()) throw new Error("Prediction not found");

      const userData = userDoc.data();
      const predictionData = predictionDoc.data() as Prediction;

      if (predictionData.status !== 'open') throw new Error("Prediction is not open for betting");
      
      // VIP Check for Model 2
      if (predictionData.model === 2) {
        const isVIP = (userData.nobleTitle && userData.nobleTitle !== 'None') || 
                    (userData.svipStatus && userData.svipStatus.status === 'active');
        if (!isVIP) {
          throw new Error("Boosted Predictions are exclusive to VIP & Noble members! 👑");
        }
      }

      if (userData.diamonds < amount) throw new Error("Insufficient diamonds");

      // Update user balance
      transaction.update(userRef, {
        diamonds: increment(-amount),
        totalDiamondsSpent: increment(amount)
      });

      // Update prediction totals
      transaction.update(predictionRef, {
        [side === 'yes' ? 'totalYes' : 'totalNo']: increment(amount)
      });

      // Create bet record
      transaction.set(betRef, {
        id: betRef.id,
        userId,
        predictionId,
        side,
        amount,
        settled: false,
        timestamp: serverTimestamp()
      });

      // Create transaction record
      transaction.set(txRef, {
        id: txRef.id,
        fromUid: userId,
        toUid: 'system',
        amount,
        type: 'prediction_bet',
        referenceId: predictionId,
        timestamp: serverTimestamp()
      });

      return betRef.id;
    });
  },

  /**
   * Settle a prediction and pay out winners
   */
  async settlePrediction(predictionId: string, winningSide: 'yes' | 'no') {
    const predictionRef = doc(db, 'predictions', predictionId);
    const bankRef = doc(db, 'bank', 'global');

    return await runTransaction(db, async (transaction) => {
      const predictionDoc = await transaction.get(predictionRef);
      if (!predictionDoc.exists()) throw new Error("Prediction not found");
      
      const prediction = predictionDoc.data() as Prediction;
      if (prediction.status === 'settled') throw new Error("Prediction already settled");

      const winningTotal = winningSide === 'yes' ? prediction.totalYes : prediction.totalNo;
      const losingTotal = winningSide === 'yes' ? prediction.totalNo : prediction.totalYes;

      // Model 1: Pari-mutuel with Stake Return
      // Formula: total_payout = winner_bet + (winner_bet / winning_total) * (losers_total * 0.9)
      
      // Model 2: Dynamic Multiplier
      // Formula: payout = bet_amount * multiplier
      
      let actualMultiplier = 1;
      
      if (prediction.model === 1) {
        if (winningTotal > 0) {
          const profitPool = losingTotal * (1 - HOUSE_FEE);
          actualMultiplier = 1 + (profitPool / winningTotal);
        } else {
          actualMultiplier = 1; // No winners
        }
      } else {
        // Model 2 logic
        const targetMultiplier = prediction.targetMultiplier || 2.0;
        const requiredProfit = winningTotal * (targetMultiplier - 1);
        
        const bankDoc = await transaction.get(bankRef);
        const bankBalance = bankDoc.exists() ? bankDoc.data().balance : 0;

        if (losingTotal >= requiredProfit) {
          actualMultiplier = targetMultiplier;
        } else {
          const shortfall = requiredProfit - losingTotal;
          if (bankBalance >= shortfall) {
            actualMultiplier = targetMultiplier;
            transaction.update(bankRef, { balance: increment(-shortfall), lastUpdated: serverTimestamp() });
          } else {
            const maxAffordable = 1 + (losingTotal + bankBalance) / winningTotal;
            actualMultiplier = Math.max(1.1, maxAffordable);
            // Use up remaining bank
            if (bankBalance > 0) {
              transaction.update(bankRef, { balance: 0, lastUpdated: serverTimestamp() });
            }
          }
        }
      }

      // Update prediction status
      transaction.update(predictionRef, {
        status: 'settled',
        winningSide,
        actualMultiplier,
        endTime: serverTimestamp()
      });

      // We can't iterate over all bets in a single transaction if there are thousands
      // For this applet, we'll fetch them and process. In production, this would be a background job.
      const betsQuery = query(collection(db, 'bets'), where('predictionId', '==', predictionId));
      const betsSnapshot = await getDocs(betsQuery);

      for (const betDoc of betsSnapshot.docs) {
        const bet = betDoc.data() as Bet;
        if (bet.side === winningSide) {
          const payout = Math.floor(bet.amount * actualMultiplier);
          
          // Update user balance
          const userRef = doc(db, 'users', bet.userId);
          transaction.update(userRef, {
            diamonds: increment(payout)
          });

          // Update bet record
          transaction.update(betDoc.ref, {
            settled: true,
            payout
          });

          // Create transaction record
          const txRef = doc(collection(db, 'transactions'));
          transaction.set(txRef, {
            id: txRef.id,
            fromUid: 'system',
            toUid: bet.userId,
            amount: payout,
            type: 'prediction_payout',
            referenceId: predictionId,
            timestamp: serverTimestamp()
          });
        } else {
          // Update losing bet
          transaction.update(betDoc.ref, {
            settled: true,
            payout: 0
          });
        }
      }

      // Add house fee to bank if Model 1
      if (prediction.model === 1 && losingTotal > 0) {
        const houseFeeAmount = losingTotal * HOUSE_FEE;
        transaction.set(bankRef, { 
          balance: increment(houseFeeAmount), 
          lastUpdated: serverTimestamp() 
        }, { merge: true });
      }

      return actualMultiplier;
    });
  }
};
