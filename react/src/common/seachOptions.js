import i18n from 'i18next';


export const typeOptions = [
  ['ALL', 'ui.type.allShort'],
  ['BR', 'ui.type.basicRequiredShort'], ['BE', 'ui.type.basicElectiveShort'],
  ['MR', 'ui.type.majorRequiredShort'], ['ME', 'ui.type.majorElectiveShort'],
  ['MGC', 'ui.type.mandatoryGeneralCourseShort'], ['HSE', 'ui.type.humanitiesSocialElectiveShort'],
  ['GR', 'ui.type.generalRequiredShort'], ['EG', 'ui.type.electiveGraduateShort'],
  ['OE', 'ui.type.otherElectiveShort'],
  ['ETC', 'ui.type.etcShort'],
];


// eslint-disable-next-line fp/no-mutating-methods
export const getSotredDepartmentOptions = () => ([
  ['ALL', 'ui.department.allShort', 100],
  ['HSS', 'ui.department.hssShort', 200],
  ['CE', 'ui.department.ceShort', 500], ['MSB', 'ui.department.msbShort', 500],
  ['ME', 'ui.department.meShort', 500], ['PH', 'ui.department.phShort', 500],
  ['BiS', 'ui.department.bisShort', 500], ['IE', 'ui.department.ieShort', 500],
  ['ID', 'ui.department.idShort', 500], ['BS', 'ui.department.bsShort', 500],
  ['MAS', 'ui.department.masShort', 500], ['NQE', 'ui.department.nqeShort', 500],
  ['EE', 'ui.department.eeShort', 500], ['CS', 'ui.department.csShort', 500],
  ['AE', 'ui.department.aeShort', 500], ['CH', 'ui.department.chShort', 500],
  ['CBE', 'ui.department.cbeShort', 500], ['MS', 'ui.department.msShort', 500],
  ['TS', 'ui.department.tsShort', 500],
  ['ETC', 'ui.department.etcShort', 900],
]
  .sort((a, b) => {
    if (a[2] !== b[2]) {
      return a[2] - b[2];
    }
    return (i18n.t(a[1]) < i18n.t(b[1])) ? -1 : 1;
  })
  .map((o) => o.slice(0, 2))
);


export const levelOptions = [
  ['ALL', 'ui.level.allShort'],
  ['100', 'ui.level.100sShort'], ['200', 'ui.level.200sShort'],
  ['300', 'ui.level.300sShort'], ['400', 'ui.level.400sShort'],
];


export const termOptions = [
  ['ALL', 'ui.term.allShort'],
  ['3', 'ui.term.3yearsShort'],
];


export const getNameKeyOfValue = (options, value) => {
  const matchedOption = options.find((o) => o[0] === value);
  if (!matchedOption) {
    return 'Unknown';
  }
  return matchedOption[1];
};
