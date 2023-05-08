
export const getYearOfItem = (item) => {
  switch (item.item_type) {
    case 'TAKEN':
      return item.lecture.year;
    case 'FUTURE':
      return item.year;
    case 'ARBITRARY':
      return item.year;
    default:
      return 2000;
  }
};

export const getSemesterOfItem = (item) => {
  switch (item.item_type) {
    case 'TAKEN':
      return item.lecture.semester;
    case 'FUTURE':
      return item.semester;
    case 'ARBITRARY':
      return item.semester;
    default:
      return 2000;
  }
};

export const getCreditOfItem = (item) => {
  // TODO: Implement additional customization
  if (item.item_type === 'TAKEN') {
    return item.lecture.credit;
  }
  if (item.item_type === 'FUTURE') {
    return item.course.credit;
  }
  if (item.item_type === 'ARBITRARY') {
    return item.credit;
  }
  return 0;
};

export const getAuOfItem = (item) => {
  if (item.item_type === 'TAKEN') {
    return item.lecture.credit_au;
  }
  if (item.item_type === 'FUTURE') {
    return item.course.credit_au;
  }
  if (item.item_type === 'ARBITRARY') {
    return item.credit_au;
  }
  return 0;
};

export const getCreditAndAuOfItem = (item) => {
  return getCreditOfItem(item) + getAuOfItem(item);
};

export const getIdOfArbitrary = (type, typeEn, department) => {
  if (department) {
    if (typeEn.endsWith('Required')) {
      return -(department.id * 100 + 1);
    }
    if (typeEn.endsWith('Elective')) {
      return -(department.id * 100 + 2);
    }
    return -(department.id * 100 + 3);
  }
  return -991;
};

export const getTitleOfArbitrary = (type, typeEn, department) => {
  return `임의의 ${type} 과목`;
};

export const getTitleEnOfArbitrary = (type, typeEn, department) => {
  return `Arbitrary ${typeEn} Course`;
};

export const getOldCodeOfArbitrary = (type, typeEn, department) => {
  if (typeEn.startsWith('Major')) {
    return `${department.code}---`;
  }
  return 'HSS---';
};

export const getCourseOfItem = (item) => {
  switch (item.item_type) {
    case ('TAKEN'):
      return item.course;
    case ('FUTURE'):
      return item.course;
    case ('ARBITRARY'):
      return {
        id: getIdOfArbitrary(item.type, item.type_en, item.department),
        isArbitrary: true,
        department: item.department,
        type: item.type,
        type_en: item.type_en,
        credit: item.credit,
        credit_au: item.credit_au,
        title: getTitleOfArbitrary(item.type, item.type_en, item.department),
        title_en: getTitleEnOfArbitrary(item.type, item.type_en, item.department),
        old_code: getOldCodeOfArbitrary(item.type, item.type_en, item.department),
      };
    default:
      return null;
  }
};

export const isAddedCourse = (course, planner) => {
  return planner
    && [...planner.taken_items, ...planner.future_items, ...planner.arbitrary_items]
      .some((i) => (!i.is_excluded && (getCourseOfItem(i).id === course.id)));
};
