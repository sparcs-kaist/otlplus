
export const getTimetableSemester = (semesters) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const semestersDescending = semesters
    .map((s) => {
      if (s.courseDesciptionSubmission === null) {
        return undefined;
      }
      return {
        semesterObject: s,
        timetableStartTime: new Date(s.courseDesciptionSubmission),
      };
    })
    .filter(s => (s !== undefined))
    .sort((a, b) => (b.timetableStartTime - a.timetableStartTime));
  const now = Date.now();
  const timetableSemester = semestersDescending.find(s => (s.timetableStartTime < now));
  if (timetableSemester === undefined) {
    return semesters[semesters.length - 1];
  }
  return timetableSemester.semesterObject;
};

export const getOngoingSemester = (semesters) => {
  const now = Date.now();
  const ongoingSemester = semesters.find((s) => {
    if (s.beginning === null || s.end === null) {
      return false;
    }
    return (new Date(s.beginning) < now) && (now < new Date(s.end));
  });
  if (ongoingSemester === undefined) {
    return semesters[semesters.length - 1];
  }
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
      USED_SCHEDULE_FIELDS.map((f) => {
        if (s[f] === null) {
          return undefined;
        }
        return {
          year: s.year,
          semester: s.semester,
          type: f,
          time: new Date(s[f]),
        };
      })
    ))
    .reduce((acc, val) => acc.concat(val), [])
    .filter(s => (s !== undefined))
    .sort((a, b) => (a.time - b.time));
  const now = Date.now();
  const currentSchedule = allSchedules
    .find(s => (s.time > now));

  return currentSchedule;
};
