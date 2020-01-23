const reviews = [
  {
    id: 2892,
    course: {
      id: 3992,
      old_code: 'CS493',
      department: { code: 'CS', name: '전산학과' },
      code_num: '4',
      title: '전산학특강 I',
      title_en: 'Special Topics in Computer Science I',
      type: '전공선택',
      type_en: 'Major Elective',
      summary: '등록되지 않았습니다.',
      review_num: 0,
    },
    lecture: {
      id: 104514,
      title: '전산학특강 I<고급알고리즘>',
      course: 3992,
      old_code: 'CS493',
      class_no: '',
      year: 2012,
      semester: 3,
      code: '36.493',
      department: 3847,
      department_code: 'CS',
      department_name: '전산학과',
      type: '전공선택',
      type_en: 'Major Elective',
      limit: 0,
      num_people: 8,
      is_english: true,
      credit: 1,
      credit_au: 0,
      common_title: '전산학특강 I',
      class_title: '<고급알고리즘>',
      professors_str_short: '정지원',
    },
    comment: ' 오트 교수님은 원래 학점은 잘 주시고, 딱 1학점 정도의 로드입니다. 숙제 3번이고, 출석체크는 학기중에 한번 했지만 성적에는 크게 반영되지 않은듯 합니다. 사실 Network flow같이 알고리즘 수업때 다루지 않은 내용을 배우고 싶었지만 그런걸 가르치진 않았고, 수학적으로 알고리즘을 어떻게 설명하는가 (또는 증명하는가) 에 대한 내용을 주로 다뤘습니다. 시험은 기말 한번입니다.\n 알고리즘에 좀 관심있는분이 들으면 여유있게 1학점 챙기실 수 있을 듯.',
    like: 0,
    is_deleted: 0,
    load: 0,
    grade: 0,
    speech: 0,
    grade_letter: '?',
    load_letter: '?',
    speech_letter: '?',
    userspecific_is_liked: false,
  },
  {
    id: 2932,
    course: {
      id: 876,
      old_code: 'HSS047',
      department: { code: 'HSS', name: '인문사회과학부' },
      code_num: '0',
      title: '축구와 풋살',
      title_en: 'Soccer and Futsal',
      type: '교양필수',
      type_en: 'Mandatory General Courses',
      summary: '게임의 기본기술 계발. 드리블, 패스, 규칙, 기본적인 전술, 중급수준의 축구의 기술과 기교에 중점을 둔다.',
      review_num: 4,
    },
    lecture: {
      id: 100171,
      title: '축구',
      course: 876,
      old_code: 'HSS047',
      class_no: 'A',
      year: 2012,
      semester: 1,
      code: '10.187',
      department: 3894,
      department_code: 'HSS',
      department_name: '인문사회과학과',
      type: '교양필수',
      type_en: 'Mandatory General Courses',
      limit: 30,
      num_people: 22,
      is_english: false,
      credit_au: 2,
      credit: 0,
      common_title: '축구',
      class_title: 'A',
      professors_str_short: '임재형',
    },
    comment: '축구를 배운다기 보다는 축구를 하러가는 과목입니다. \n\n체력 단련이나 축구연습에 꽤 도움 되구요, 일주일에 한번씩 의무적으로 운동하게 되서 좋습니다 ',
    like: 0,
    is_deleted: 0,
    grade: 0,
    load: 0,
    speech: 0,
    grade_letter: '?',
    load_letter: '?',
    speech_letter: '?',
    userspecific_is_liked: false,
  },
  {
    id: 2939,
    course: {
      id: 1723,
      old_code: 'IP406',
      department: { code: 'IP', name: '지식재산 부전공 프로그램' },
      code_num: '4',
      title: '지식재산의 이해',
      title_en: 'Understanding Intellectual Property',
      type: '전공필수',
      type_en: 'Major Required',
      summary: '21세기는 지식과 정보가 기업경쟁력의 원천이 되는 지식기반사회이고 독자적인 기술개발과 지식재산권의확보가 국가경쟁력을 좌우하는 중요한 요소로 대두되고 있는 만큼 지식재산권 변화에 맞는 최고의 경쟁력확보를 위해 지식재산권을 강의한다.',
      review_num: 5,
    },
    lecture: {
      id: 105392,
      title: '지식재산의 이해',
      course: 1723,
      old_code: 'IP406',
      class_no: '',
      year: 2012,
      semester: 3,
      code: '17.406',
      department: 3978,
      department_code: 'IP',
      department_name: '지식재산 부전공 프로그램',
      type: '전공선택',
      type_en: 'Major Elective',
      limit: 40,
      num_people: 4,
      is_english: false,
      credit: 3,
      credit_au: 0,
      common_title: '지식재산의 이해',
      class_title: 'A',
      professors_str_short: '윤연수',
    },
    comment: '지식재산에 관련된 법 위주로 수업이 진행됩니다. 기업가를 위한 법 수업과 매우 비슷한 방식이며 중간, 기말 시험 외에는 퀴즈, 숙제가 없었습니다. 시험은 오픈북이고 교수님이 시험에서 종종 예상을 벗어나는 답의 문제를 내시는 경우도 있습니다. 그 로드는 거의 없고 학점은 평균적으로 주시는 것 같습니다. 스스로 관심이 많아서 질문도 많이 하고 공부를 열심히 하면 그만큼 많이 남는 과목이라 생각됩니다.',
    like: 0,
    is_deleted: 0,
    grade: 0,
    load: 0,
    speech: 0,
    grade_letter: '?',
    load_letter: '?',
    speech_letter: '?',
    userspecific_is_liked: false,
  },
];

export default reviews;
