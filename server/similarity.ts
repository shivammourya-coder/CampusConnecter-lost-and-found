import { ItemRecord } from './db.js';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
  'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'found', 'lost', 'item', 'please', 'help', 'contact', 'anyone', 'misplaced', 'left'
]);

function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function calculateJaccard(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersectionCount = 0;
  for (const t of setA) {
    if (setB.has(t)) intersectionCount++;
  }
  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

export interface MatchEvaluation {
  item: ItemRecord;
  matchScore: number; // 0 to 100
  matchPercentage: string; // e.g. "92% Possible Match"
  reasons: string[];
  overlapKeywords: string[];
}

export function findMatchesForItem(targetItem: ItemRecord, allItems: ItemRecord[]): MatchEvaluation[] {
  // Target item must be compared only against opposite type
  const oppositeType = targetItem.type === 'Lost' ? 'Found' : 'Lost';

  const candidates = allItems.filter(item => 
    item.id !== targetItem.id && 
    item.type === oppositeType && 
    item.status !== 'Resolved'
  );

  const targetTitleTokens = tokenize(targetItem.title);
  const targetDescTokens = tokenize(targetItem.description);
  const targetLocTokens = tokenize(targetItem.location);

  const results: MatchEvaluation[] = [];

  for (const candidate of candidates) {
    const candidateTitleTokens = tokenize(candidate.title);
    const candidateDescTokens = tokenize(candidate.description);
    const candidateLocTokens = tokenize(candidate.location);

    const reasons: string[] = [];
    let score = 0;

    // 1. Category Matching (25% weight)
    if (targetItem.category.toLowerCase() === candidate.category.toLowerCase()) {
      score += 25;
      reasons.push(`Matching category: ${targetItem.category}`);
    }

    // 2. Title Token Overlap (35% weight)
    const titleSimilarity = calculateJaccard(targetTitleTokens, candidateTitleTokens);
    const sharedTitleTokens = targetTitleTokens.filter(t => candidateTitleTokens.includes(t));
    if (titleSimilarity > 0) {
      const titleScore = Math.min(35, Math.round(titleSimilarity * 45));
      score += titleScore;
      if (sharedTitleTokens.length > 0) {
        reasons.push(`Title keywords matched: "${sharedTitleTokens.slice(0, 3).join(', ')}"`);
      }
    }

    // 3. Location Overlap (20% weight)
    const locSimilarity = calculateJaccard(targetLocTokens, candidateLocTokens);
    const sharedLocTokens = targetLocTokens.filter(t => candidateLocTokens.includes(t));
    if (locSimilarity > 0 || sharedLocTokens.length > 0) {
      const locScore = Math.min(20, Math.max(12, Math.round(locSimilarity * 25)));
      score += locScore;
      reasons.push(`Location proximity match: "${sharedLocTokens.join(', ') || targetItem.location}"`);
    }

    // 4. Description Semantic Similarity (20% weight)
    const descSimilarity = calculateJaccard(targetDescTokens, candidateDescTokens);
    const sharedDescTokens = targetDescTokens.filter(t => candidateDescTokens.includes(t));
    if (descSimilarity > 0) {
      const descScore = Math.min(20, Math.round(descSimilarity * 30));
      score += descScore;
      if (sharedDescTokens.length > 0) {
        reasons.push(`Description details overlap: "${sharedDescTokens.slice(0, 3).join(', ')}"`);
      }
    }

    // Cross-match: target title in candidate description or vice versa
    const crossTitleInDesc = targetTitleTokens.filter(t => candidateDescTokens.includes(t));
    if (crossTitleInDesc.length > 0 && score < 90) {
      const bonus = Math.min(10, crossTitleInDesc.length * 4);
      score += bonus;
    }

    // Calculate union of shared keywords for badge display
    const allShared = Array.from(new Set([
      ...sharedTitleTokens,
      ...sharedLocTokens,
      ...sharedDescTokens,
      ...crossTitleInDesc
    ]));

    // Cap between 0 and 99% unless exact identical match
    const finalScore = Math.min(98, Math.max(0, Math.round(score)));

    if (finalScore >= 30) {
      results.push({
        item: candidate,
        matchScore: finalScore,
        matchPercentage: `${finalScore}% Possible Match`,
        reasons: reasons.length > 0 ? reasons : ['General category and context similarity'],
        overlapKeywords: allShared.slice(0, 5)
      });
    }
  }

  // Sort highest match first
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
