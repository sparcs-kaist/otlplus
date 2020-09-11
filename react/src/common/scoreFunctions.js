export const getSingleScoreLabel = score => (
  ['?', 'F', 'D', 'C', 'B', 'A'][score]
);


export const getAverageScoreLabel = (score, reviewNum) => {
  if (reviewNum === 0) {
    return '?';
  }
  return ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'][Math.round(score)];
};
