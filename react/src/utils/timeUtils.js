import i18n from 'i18next';

export const getDayStr = (day) => {
  const dayNames = [
    i18n.t('ui.day.monday'),
    i18n.t('ui.day.tuesday'),
    i18n.t('ui.day.wednesday'),
    i18n.t('ui.day.thursday'),
    i18n.t('ui.day.friday'),
    i18n.t('ui.day.saturday'),
    i18n.t('ui.day.sunday'),
  ];
  return dayNames[day];
};

export const getTimeStr = (time) => {
  const hour = Math.floor(time / 60);
  const minute = time % 60;
  return `${hour}:${String(minute).padStart(2, '0')}`;
};

export const getRangeStr = (day, begin, end) => {
  return `${getDayStr(day)} ${getTimeStr(begin)} ~ ${getTimeStr(end)}`;
};
