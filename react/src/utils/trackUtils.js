import i18n from 'i18next';

export const getYearName = (year) => {
  if (year <= 2000 || year >= 2100) {
    return '';
  }
  return year.toString();
};

export const getGeneralTrackName = (track) => {
  return `${i18n.t('ui.track.general')} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
};

export const getMajorTrackName = (track) => {
  return `${i18n.t('ui.track.major')} - ${getYearName(track.department[i18n.t('js.property.name')])} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
};

export const getAdditionalTrackName = (track) => {
  if (track.type === 'DOUBLE') {
    return `${i18n.t('ui.track.doubleMajor')} - ${track.department[i18n.t('js.property.name')]} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
  }
  if (track.type === 'MINOR') {
    return `${i18n.t('ui.track.minor')} - ${track.department[i18n.t('js.property.name')]} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
  }
  if (track.type === 'ADVANCED') {
    return `${i18n.t('ui.track.advancedMajor')} - ${track.department[i18n.t('js.property.name')]} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
  }
  if (track.type === 'INTERDISCIPLINARY') {
    return `${i18n.t('ui.track.interdisciplinaryMajor')} (${getYearName(track.start_year)}~${getYearName(track.end_year)})`;
  }
  return 'Unknown';
};
