import i18n from 'i18next';

export const getStr = (examtime) => examtime[i18n.t('js.property.str')];

export const getTimeStr = (examtime) => {
  const fullStr = getStr(examtime);
  return fullStr.slice(fullStr.indexOf(' '));
};
