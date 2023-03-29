import i18n from 'i18next';


export const getTypeOptions = () => [
  ['ALL', i18n.t('ui.type.allShort')],
  ['BR', i18n.t('ui.type.basicRequiredShort')], ['BE', i18n.t('ui.type.basicElectiveShort')],
  ['MR', i18n.t('ui.type.majorRequiredShort')], ['ME', i18n.t('ui.type.majorElectiveShort')],
  ['MGC', i18n.t('ui.type.mandatoryGeneralCourseShort')], ['HSE', i18n.t('ui.type.humanitiesSocialElectiveShort')],
  ['GR', i18n.t('ui.type.generalRequiredShort')], ['EG', i18n.t('ui.type.electiveGraduateShort')],
  ['OE', i18n.t('ui.type.otherElectiveShort')],
  ['ETC', i18n.t('ui.type.etcShort')],
];


// eslint-disable-next-line fp/no-mutating-methods
export const getDepartmentOptions = () => ([
  ['ALL', i18n.t('ui.department.allShort'), 100],
  ['HSS', i18n.t('ui.department.hssShort'), 200],
  ['CE', i18n.t('ui.department.ceShort'), 500], ['MSB', i18n.t('ui.department.msbShort'), 500],
  ['ME', i18n.t('ui.department.meShort'), 500], ['PH', i18n.t('ui.department.phShort'), 500],
  ['BiS', i18n.t('ui.department.bisShort'), 500], ['IE', i18n.t('ui.department.ieShort'), 500],
  ['ID', i18n.t('ui.department.idShort'), 500], ['BS', i18n.t('ui.department.bsShort'), 500],
  ['MAS', i18n.t('ui.department.masShort'), 500], ['NQE', i18n.t('ui.department.nqeShort'), 500],
  ['EE', i18n.t('ui.department.eeShort'), 500], ['CS', i18n.t('ui.department.csShort'), 500],
  ['AE', i18n.t('ui.department.aeShort'), 500], ['CH', i18n.t('ui.department.chShort'), 500],
  ['CBE', i18n.t('ui.department.cbeShort'), 500], ['MS', i18n.t('ui.department.msShort'), 500],
  ['TS', i18n.t('ui.department.tsShort'), 500],
  ['ETC', i18n.t('ui.department.etcShort'), 900],
]
  .sort((a, b) => {
    if (a[2] !== b[2]) {
      return a[2] - b[2];
    }
    return (a[1] < b[1]) ? -1 : 1;
  })
  .map((o) => o.slice(0, 2))
);


export const getLevelOptions = () => [
  ['ALL', i18n.t('ui.level.allShort')],
  ['100', i18n.t('ui.level.100sShort')], ['200', i18n.t('ui.level.200sShort')],
  ['300', i18n.t('ui.level.300sShort')], ['400', i18n.t('ui.level.400sShort')],
];


export const getTermOptions = () => [
  ['ALL', i18n.t('ui.term.allShort')],
  ['3', i18n.t('ui.term.3yearsShort')],
];


export const getLabelOfValue = (options, value) => {
  const matchedOption = options.find((o) => o[0] === value);
  if (!matchedOption) {
    return 'Unknown';
  }
  return matchedOption[1];
};
