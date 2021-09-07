import { sum } from './commonUtils';


export const getSingleScoreLabel = (score) => (
  ['?', 'F', 'D', 'C', 'B', 'A'][score]
);


export const getAverageScoreLabel = (score, reviewNum) => {
  if (reviewNum === 0) {
    return '?';
  }
  return ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'][Math.round(score)];
};

// Keep synchronozed with Django apps/subject/models.py Review.calc_average()
export const calcAverage = (reviews) => {
  const nonzeroReviews = reviews.filter((r) => (r.grade !== 0 && r.load !== 0 && r.speech !== 0));
  const reviewNum = reviews.length;
  const totalWeight = sum(nonzeroReviews.map((r) => (r.like + 1)));
  const gradeSum = sum(nonzeroReviews.map((r) => (r.like + 1) * r.grade * 3));
  const loadSum = sum(nonzeroReviews.map((r) => (r.like + 1) * r.load * 3));
  const speechSum = sum(nonzeroReviews.map((r) => (r.like + 1) * r.speech * 3));
  const grade = (totalWeight !== 0) ? (gradeSum + 0.0) / totalWeight : 0.0;
  const load = (totalWeight !== 0) ? (loadSum + 0.0) / totalWeight : 0.0;
  const speech = (totalWeight !== 0) ? ((speechSum + 0.0) / totalWeight) : 0.0;
  return [reviewNum, totalWeight, [gradeSum, loadSum, speechSum], [grade, load, speech]];
};
