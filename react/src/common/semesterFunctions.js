import { SCHEDULE_FIELDS } from '../shapes/SemesterShape';

export const getTimetableSemester = (semesters) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const semestersDescending = semesters
    .map(s => ({
      year: s.year,
      semester: s.semester,
      beginning: new Date(s.beginning),
    }))
    .slice()
    .sort((a, b) => (b.beginning - a.beginning));
  const now = Date.now();
  const timetableSemester = semestersDescending.find(s => (s.beginning < now));
  return timetableSemester;
};

export const getOngoingSemester = (semesters) => {
  const now = Date.now();
  const ongoingSemester = semesters.find(s => (
    (new Date(s.beginning) < now) && (now < new Date(s.end))
  ));
  return ongoingSemester;
}

export const getCurrentSchedule = (semesters) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const allSchedules = semesters
    .map(s => (
      SCHEDULE_FIELDS.map(f => ({
        year: s.year,
        semester: s.semester,
        type: f,
        time: new Date(s[f]),
      }))
    ))
    .flat()
    .sort((a, b) => (a.time - b.time));
  const now = Date.now();
  const currentSchedule = allSchedules
    .find(s => (s.time > now));

  return currentSchedule;
};
