export const getYearName = (year) => {
  if (year <= 2000 || year >= 2100) {
    return '';
  }
  return year.toString();
};

export const getGeneralTrackName = (track) => {
  return `일반 (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
};

export const getMajorTrackName = (track) => {
  return `전공-${getYearName(track.department.name)} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
};

export const getAdditionalTrackName = (track) => {
  if (track.type === 'DOUBLE') {
    return `복수전공-${track.department.name} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
  }
  if (track.type === 'MINOR') {
    return `부전공-${track.department.name} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
  }
  if (track.type === 'ADVANCED') {
    return `심화전공-${track.department.name} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
  }
  if (track.type === 'INTERDISCIPLINARY') {
    return `자유융합전공 (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
  }
  return 'Unknown';
};
