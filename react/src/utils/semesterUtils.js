import i18n from 'i18next';

export const getSemesterName = (semesterIndex) => {
  const semesterNames = {
    1: i18n.t('ui.semester.spring'),
    2: i18n.t('ui.semester.summer'),
    3: i18n.t('ui.semester.fall'),
    4: i18n.t('ui.semester.winter'),
  };
  return semesterNames[semesterIndex];
};

export const getTimetableSemester = (semesters) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const semestersDescending = semesters
    .filter((s) => s.courseDesciptionSubmission !== null)
    .map((s) => ({
      semesterObject: s,
      timetableStartTime: new Date(s.courseDesciptionSubmission),
    }))
    .sort((a, b) => b.timetableStartTime - a.timetableStartTime);
  const now = Date.now();
  const timetableSemester = semestersDescending.find((s) => s.timetableStartTime < now);
  if (timetableSemester === undefined) {
    return semesters[semesters.length - 1];
  }
  return timetableSemester.semesterObject;
};

// SYNC: Keep synchronized with Django apps/subject/models.py Semester.get_ongoing_semester()
export const getOngoingSemester = (semesters) => {
  const now = Date.now();
  const ongoingSemester = semesters.find(
    (s) => new Date(s.beginning) < now && now < new Date(s.end),
  );
  return ongoingSemester; // Should return undefined when matching semester does not exist
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
    .map((s) =>
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
      }),
    )
    .flat(1)
    .filter((s) => s !== undefined)
    .sort((a, b) => a.time - b.time);
  const now = Date.now();
  const currentSchedule = allSchedules.find((s) => s.time > now);

  return currentSchedule;
};
