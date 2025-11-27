import { MENTION_SCALE } from './constants';

export const calculateTUEFinalGrade = (presence, participation, evaluations) => {
    // Presence: 5%, Participation: 5%, Evaluations: 90%
    const presenceWeight = 0.05;
    const participationWeight = 0.05;
    const evaluationsWeight = 0.90;

    let evalWeightedSum = 0;
    let evalCoeffSum = 0;

    evaluations.forEach(ev => {
        if (ev.grade !== undefined && ev.grade !== null) {
            evalWeightedSum += Number(ev.grade) * Number(ev.coefficient);
            evalCoeffSum += Number(ev.coefficient);
        }
    });

    const evalAverage = evalCoeffSum > 0 ? evalWeightedSum / evalCoeffSum : 0;

    const finalGrade = (Number(presence || 0) * presenceWeight) +
        (Number(participation || 0) * participationWeight) +
        (evalAverage * evaluationsWeight);

    return Number(finalGrade.toFixed(2));
};

export const calculateAttendanceGrade = (attended, total) => {
    if (!total || total === 0) return 0;
    const percentage = (attended / total) * 100;
    return (percentage / 100) * 20;
};

export const getMention = (average) => {
    const grade = Number(average);
    const mention = MENTION_SCALE.find(m => grade >= m.min);
    return mention ? mention.label : 'F';
};
