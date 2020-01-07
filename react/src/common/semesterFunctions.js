
export const getTimetableSemester = (semesters) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const semestersDescending = semesters
    .map(s => ({
      year: s.year,
      semester: s.semester,
      timetableStartTime: new Date(s.courseDesciptionSubmission),
    }))
    .slice()
    .sort((a, b) => (b.timetableStartTime - a.timetableStartTime));
  const now = Date.now();
  const timetableSemester = semestersDescending.find(s => (s.timetableStartTime < now));
  return timetableSemester;
};

export const getOngoingSemester = (semesters) => {
  const now = Date.now();
  const ongoingSemester = semesters.find(s => (
    (new Date(s.beginning) < now) && (now < new Date(s.end))
  ));
  return ongoingSemester;
};

export const getCurrentSchedule = (semesters) => {
  const USED_SCHEDULE_FIELDS = [
    'beginning',
    'end',
    'courseRegistrationPeriodStart',
    'courseRegistrationPeriodEnd',
    'courseAddDropPeriodEnd',
    'courseDropDeadline',
    'courseEvaluationDeadline',
    'gradePosting',
  ];

  // eslint-disable-next-line fp/no-mutating-methods
  const allSchedules = semesters
    .map(s => (
      USED_SCHEDULE_FIELDS.map(f => ({
        year: s.year,
        semester: s.semester,
        type: f,
        time: new Date(s[f]),
      }))
    ))
    .reduce((acc, val) => acc.concat(val), [])
    .sort((a, b) => (a.time - b.time));
  const now = Date.now();
  const currentSchedule = allSchedules
    .find(s => (s.time > now));

  return currentSchedule;
};
