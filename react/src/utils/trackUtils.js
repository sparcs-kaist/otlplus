import i18n from 'i18next';

export const getYearName = (year) => {
  if (year <= 2000 || year >= 2100) {
    return '';
  }
  return year.toString();
};

export const getGeneralTrackName = (track, short = false) => {
  const name = i18n.t('ui.track.general');
  const year = `${getYearName(track.start_year)}~${getYearName(track.end_year)}`;
  return `${name} (${year})`;
};

export const getMajorTrackName = (track, short = false) => {
  const name = track.department[i18n.t('js.property.name')];
  const year = `${getYearName(track.start_year)}~${getYearName(track.end_year)}`;
  return `${name} (${year})`;
};

export const getAdditionalTrackName = (track, short = false) => {
  const type = (
    track.type === 'DOUBLE'
      ? i18n.t('ui.track.doubleMajor')
      : track.type === 'MINOR'
        ? i18n.t('ui.track.minor')
        : track.type === 'ADVANCED'
          ? i18n.t('ui.track.advancedMajor')
          : track.type === 'INTERDISCIPLINARY'
            ? i18n.t('ui.track.interdisciplinaryMajor')
            : '기타'
  );
  const name = (
    track.type !== 'INTERDISCIPLINARY'
      ? track.department[i18n.t('js.property.name')]
      : ''
  );
  const year = `${getYearName(track.start_year)}~${getYearName(track.end_year)}`;
  if (track.type === 'INTERDISCIPLINARY') {
    return `${type} (${year})`;
  }
  if (short) {
    return `${name} (${year})`;
  }
  return `${type} - ${name} (${year})`;
};
