import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Scroller from '../components/Scroller';
import ProjectBlock from '../components/blocks/ProjectBlock';

import memberBatteryImage from '../static/images/members/Members-05-battery_kor.png';
import memberDaybreakerImage from '../static/images/members/Members-05-daybreaker_kor.png';
import memberJulingksImage from '../static/images/members/Members-05-julingks_kor.png';
import memberMajjaImage from '../static/images/members/Members-ext-majja_kor.png';

import memberCanchoImage from '../static/images/members/Members-07-cancho_kor.png';
import memberDynamanImage from '../static/images/members/Members-07-dynaman_kor.png';
import memberElaborateImage from '../static/images/members/Members-07-elaborate_kor.png';
import memberGangokImage from '../static/images/members/Members-07-gangok_kor.png';
import memberTruthImage from '../static/images/members/Members-07-truth_kor.png';

import memberMayflowerImage from '../static/images/members/Members-08-mayflower_kor.png';
import memberRenoImage from '../static/images/members/Members-08-reno_kor.png';

import memberImaiImage from '../static/images/members/Members-09-imai_kor.png';
import memberKussImage from '../static/images/members/Members-09-kuss_kor.png';

import memberAlphaminImage from '../static/images/members/Members-10-alphamin_kor.png';
import memberBoolgomImage from '../static/images/members/Members-10-boolgom_kor.png';
import memberNonameImage from '../static/images/members/Members-10-noname_kor.png';
import memberLeeopopImage from '../static/images/members/Members-10-leeopop_kor.png';
import memberPillibiImage from '../static/images/members/Members-10-pillibi_kor.png';

import memberOvermaniaImage from '../static/images/members/Members-11-overmania_kor.png';
import memberRaonImage from '../static/images/members/Members-11-raon_kor.png';
import memberRodumaniImage from '../static/images/members/Members-11-rodumani_kor.png';
import memberSealImage from '../static/images/members/Members-11-seal_kor.png';
import memberSunguardImage from '../static/images/members/Members-11-sunguard_kor.png';

import memberAonImage from '../static/images/members/Members-12-aon_kor.png';
import memberChaosImage from '../static/images/members/Members-12-chaos_kor.png';
import memberCoffeeImage from '../static/images/members/Members-12-coffee_kor.png';
import memberDaedooImage from '../static/images/members/Members-12-daedoo_kor.png';
import memberNaldoImage from '../static/images/members/Members-12-naldo_kor.png';
import memberWhitegoldImage from '../static/images/members/Members-12-whitegold_kor.png';
import memberYasikImage from '../static/images/members/Members-12-yasik_kor.png';

import memberManduImage from '../static/images/members/Members-13-mandu_kor.png';
import memberNobrainImage from '../static/images/members/Members-13-nobrain_kor.png';
import memberSamjoImage from '../static/images/members/Members-13-samjo_kor.png';

import memberSteinImage from '../static/images/members/Members-14-stein_kor.png';
import memberCoearthImage from '../static/images/members/Members-14-coearth_kor.png';
import memberGeorgeImage from '../static/images/members/Members-14-george_kor.png';
import memberLeejeokImage from '../static/images/members/Members-14-leejeok_kor.png';

import memberAllkindsImage from '../static/images/members/Members-15-allkinds_kor.png';
import memberBogoImage from '../static/images/members/Members-15-bogo_kor.png';
import memberCheshireImage from '../static/images/members/Members-15-cheshire_kor.png';
import memberDideeImage from '../static/images/members/Members-15-didee_kor.png';
import memberEtrangerImage from '../static/images/members/Members-15-etranger_kor.png';
import memberHoodImage from '../static/images/members/Members-15-hood_kor.png';
import memberMangoImage from '../static/images/members/Members-15-mango_kor.png';
import memberMossImage from '../static/images/members/Members-15-moss_kor.png';
import memberNullImage from '../static/images/members/Members-15-null_kor.png';
import memberPotatoImage from '../static/images/members/Members-15-potato_kor.png';
import memberSwanImage from '../static/images/members/Members-15-swan_kor.png';
import memberZealotImage from '../static/images/members/Members-15-zealot_kor.png';

import memberAkaisImage from '../static/images/members/Members-16-akais_kor.png';
import memberHersheyImage from '../static/images/members/Members-16-hershey_kor.png';
import memberJamesImage from '../static/images/members/Members-16-james_kor.png';
import memberJaydubImage from '../static/images/members/Members-16-jaydub_kor.png';
import memberJuheeuuImage from '../static/images/members/Members-16-juheeuu_kor.png';
import memberLeesiaImage from '../static/images/members/Members-16-leesia_kor.png';
import memberParangImage from '../static/images/members/Members-16-parang_kor.png';
import memberSemiImage from '../static/images/members/Members-16-semi_kor.png';
import memberYounsImage from '../static/images/members/Members-16-youns_kor.png';

import memberTinkImage from '../static/images/members/Members-17-tink_kor.png';
import memberYoloImage from '../static/images/members/Members-17-yolo_kor.png';

import memberAppleseedImage from '../static/images/members/Members-18-appleseed_kor.png';

import memberMiniImage from '../static/images/members/Members-19-mini_kor.png';
import memberWinrobrineImage from '../static/images/members/Members-19-winrobrine_kor.png';

import memberDoraImage from '../static/images/members/Members-20-dora_kor.png';

import memberKkomaImage from '../static/images/members/Members-21-kkoma_kor.png';
import memberPlatypusImage from '../static/images/members/Members-21-platypus_kor.png';


class CreditPage extends Component {
  projects = [
    {
      index: 1,
      mainTitle: 'LKIN',
      subTitle: '-',
      period: '-',
      fields:
        [
          {
            title: 'Project Manager', people: [],
          }, {
            title: 'Designer', people: [],
          }, {
            title: 'Developer', people: [],
          },
        ],
    },
    {
      index: 20,
      mainTitle: 'OTL',
      subTitle: '모의시간표',
      period: '2009',
      fields:
        [
          {
            title: 'Developer',
            people: [
              { name: '김민우', image: memberJulingksImage },
              { name: '김종균', image: memberTruthImage },
              { name: '김준기', image: memberDaybreakerImage },
              { name: '유충국', image: memberMajjaImage },
            ],
          },
          {
            title: 'Special Thanks To',
            people: [
              { name: '강철', image: memberCanchoImage },
              { name: '안병욱', image: memberElaborateImage },
            ],
          },
        ],
    },
    {
      index: 21,
      mainTitle: 'OTL',
      subTitle: '추가개발',
      period: '2010 ~ 2012',
      fields:
        [
          {
            title: 'Project Manager',
            people: [
              {
                name: '배성경',
                image: memberImaiImage,
                caption: '2011',
              },
              {
                name: '김재겸',
                image: memberNonameImage,
                caption: '2012',
              },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '김재겸', image: memberNonameImage },
              { name: '박일우', image: memberOvermaniaImage },
              { name: '배성경', image: memberImaiImage },
              { name: '심규민', image: memberBoolgomImage },
              { name: '안재만', image: memberKussImage },
              { name: '유민정', image: memberAlphaminImage },
              { name: '이윤석', image: memberGangokImage },
              { name: '정재성', image: memberBatteryImage },
              { name: '정종혁', image: memberSunguardImage },
              { name: '정창제', image: memberRodumaniImage },
              { name: '조유정', image: memberMayflowerImage },
              { name: '진태진', image: memberDynamanImage },
            ],
          },
        ],
    },
    {
      index: 22,
      mainTitle: 'OTL',
      subTitle: '과목사전',
      period: '2012 ~ 2013',
      fields:
        [
          {
            title: 'Project Manager',
            people: [
              {
                name: '유민정',
                image: memberAlphaminImage,
                caption: '2012.05 ~ 2012.09',
              },
              {
                name: '마재의',
                image: memberChaosImage,
                caption: '2012.09 ~ 2013.03',
              },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '박지향', image: memberSealImage },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '김정민', image: memberCoffeeImage },
              { name: '마재의', image: memberChaosImage },
              { name: '박중언', image: memberYasikImage },
              { name: '박지혁', image: memberNaldoImage },
              { name: '유민정', image: memberAlphaminImage },
              { name: '윤필립', image: memberPillibiImage },
              { name: '이태현', image: memberWhitegoldImage },
              { name: '정종혁', image: memberSunguardImage },
              { name: '정창제', image: memberRodumaniImage },
              { name: '채종욱', image: memberAonImage },
            ],
          },
        ],
    },
    {
      index: 30,
      mainTitle: 'OTL Plus',
      subTitle: '과목사전',
      period: '2015.09 ~ 2016.06',
      fields:
        [
          {
            title: 'Project Manager',
            people: [
              {
                name: '황태현',
                image: memberManduImage,
                caption: '2015.09 ~ 2015.11',
              },
              {
                name: '서동민',
                image: memberHoodImage,
                caption: '2015.12 ~ 2016.06',
              },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '김찬욱', image: memberDaedooImage },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '고지훈', image: memberMangoImage },
              { name: '김강인', image: memberRaonImage },
              { name: '김재성', image: memberSteinImage },
              { name: '서동민', image: memberHoodImage },
              { name: '이강원', image: memberPotatoImage },
              { name: '조성원', image: memberSamjoImage },
              { name: '최정운', image: memberCoearthImage },
              { name: '한승현', image: memberZealotImage },
              { name: '황태현', image: memberManduImage },
            ],
          },
        ],
    },
    {
      index: 31,
      mainTitle: 'OTL Plus',
      subTitle: '모의시간표',
      period: '2016.09 ~ 2017.12',
      fields:
        [
          {
            title: 'Project Manager',
            people: [
              {
                name: '김재성',
                image: memberSteinImage,
                caption: '2016.09 ~ 2017.05',
              },
              {
                name: '한승현',
                image: memberZealotImage,
                caption: '2017.06 ~ 2017.12',
              },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '한승현', image: memberZealotImage, caption: '3 credits' },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '고지훈', image: memberMangoImage, caption: '3 credits' },
              { name: '김재성', image: memberSteinImage, caption: '3 credits' },
              { name: '김태준', image: memberNobrainImage, caption: '2 credits' },
              { name: '서덕담', image: memberDideeImage, caption: '2 credits' },
              { name: '오종훈', image: memberLeejeokImage, caption: '2 credits' },
              { name: '이강원', image: memberPotatoImage, caption: '2 credits' },
              { name: '조형준', image: memberGeorgeImage, caption: '3 credits' },
              { name: '최정운', image: memberCoearthImage, caption: '3 credits' },
              { name: '한승현', image: memberZealotImage, caption: '2 credits' },
            ],
          },
        ],
    },
    {
      index: 32,
      mainTitle: 'OTL Plus',
      subTitle: '모바일 & 리뉴얼',
      period: '2018.01 ~ 2020.01',
      fields:
        [
          {
            title: 'Project Manager',
            people: [
              {
                name: '한승현',
                image: memberZealotImage,
                caption: '2018.01 ~ 2020.01',
              },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '한승현', image: memberZealotImage, caption: '4 credits' },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '강찬규', image: memberAppleseedImage, caption: '1 credit' },
              { name: '강현우', image: memberLeesiaImage, caption: '2 credits' },
              { name: '고지훈', image: memberMangoImage, caption: '1 credit' },
              { name: '김경서', image: memberMossImage, caption: '1 credit' },
              { name: '마재의', image: memberChaosImage, caption: '1 credit' },
              { name: '문재호', image: memberJamesImage, caption: '1 credit' },
              { name: '박수호', image: memberEtrangerImage, caption: '1 credit' },
              { name: '박현우', image: memberWinrobrineImage, caption: '1 credit' },
              { name: '서혜인', image: memberBogoImage, caption: '1 credit' },
              { name: '손주희', image: memberJuheeuuImage, caption: '2 credits' },
              { name: '엄성하', image: memberSemiImage, caption: '1 credit' },
              { name: '이선민', image: memberAllkindsImage, caption: '1 credit' },
              { name: '이세연', image: memberCheshireImage, caption: '1 credit' },
              { name: '이정연', image: memberParangImage, caption: '1 credit' },
              { name: '이주영', image: memberNullImage, caption: '1 credit' },
              { name: '지수환', image: memberSwanImage, caption: '1 credit' },
              { name: '최윤서', image: memberYounsImage, caption: '1 credit' },
              { name: '하현정', image: memberYoloImage, caption: '1 credit' },
              { name: '허미나', image: memberHersheyImage, caption: '1 credit' },
              { name: '황재영', image: memberAkaisImage, caption: '1 credit' },
              { name: '한승현', image: memberZealotImage, caption: '4 credits' },
              { name: '한우현', image: memberTinkImage, caption: '1 credit' },
            ],
          },
        ],
    },
    {
      index: 1000,
      mainTitle: 'OTL App',
      subTitle: '-',
      period: '2020.02 ~',
      fields:
        [
          {
            title: 'TF Lead',
            people: [
              { name: '박현우', image: memberWinrobrineImage, caption: '2020.02 ~ 2021.01' },
              { name: '오승빈', image: memberPlatypusImage, caption: '2021.07 ~' },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '조유민', image: null, caption: '1 credits' },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '오승빈', image: memberPlatypusImage, caption: '3 credits' },
              { name: '문동우', image: null, caption: '2 credits' },
              { name: '정성엽', image: null, caption: '1 credits' },
            ],
          },
        ],
    },
    {
      index: 33,
      mainTitle: 'OTL Plus',
      subTitle: '졸업플래너',
      period: '2021.09 ~',
      fields:
        [
          {
            title: 'Project Manager',
            people: [
              {
                name: '한승현',
                image: memberZealotImage,
                caption: '2021.09 ~ 2023.03',
              },
              {
                name: '조유민',
                image: null,
                caption: '2023.03 ~',
              },
            ],
          },
          {
            title: 'TF Lead',
            people: [
              {
                name: '한승현',
                image: memberZealotImage,
                caption: '2023.03 ~',
              },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '양성현', image: null, caption: '1 credit' },
              { name: '이혜원', image: null, caption: '1 credit' },
              { name: '한승현', image: memberZealotImage, caption: '4 credits' },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '김동혁', image: memberKkomaImage, caption: '3 credits' },
              { name: '김민희', image: memberMiniImage, caption: '3 credits' },
              { name: '김재성', image: memberSteinImage, caption: '1 credits' },
              { name: '오승빈', image: memberPlatypusImage, caption: '1 credit' },
              { name: '이지윤', image: memberDoraImage, caption: '4 credits' },
              { name: '이진우', image: memberJaydubImage, caption: '3 credits' },
              { name: '한승현', image: memberZealotImage, caption: '4 credits' },
              { name: '홍은기', image: null, caption: '1 credits' },
              { name: '황제욱', image: null, caption: '1 credits' },
            ],
          },
        ],
    },
    {
      index: 9001,
      mainTitle: 'Sysops & Tech Leads',
      subTitle: '-',
      period: '-',
      fields:
        [
          {
            title: 'LKIN',
            people: [
              {
                name: '서창민',
                caption: '2009 ~ 2010',
                image: memberRenoImage,
              },
              {
                name: '이근홍',
                caption: '2011 ~ 2012',
                image: memberLeeopopImage,
              },
            ],
          },
          {
            title: 'OTL',
            people: [
              {
                name: '배성경',
                image: memberImaiImage,
                caption: '2011',
              },
              {
                name: '김재겸',
                image: memberNonameImage,
                caption: '2012',
              },
              {
                name: '유민정',
                image: memberAlphaminImage,
                caption: '2012.05 ~ 2012.09',
              },
              {
                name: '마재의',
                image: memberChaosImage,
                caption: '2012.09 ~ 2015.04',
              },
              {
                name: '황태현',
                image: memberManduImage,
                caption: '2015.05 ~ 2015.11',
              },
              {
                name: '서동민',
                image: memberHoodImage,
                caption: '2015.12 ~ 2016.05',
              },
              {
                name: '김재성',
                image: memberSteinImage,
                caption: '2016.06 ~ 2017.06',
              },
              {
                name: '한승현',
                image: memberZealotImage,
                caption: '2017.06 ~ 2017.12',
              },
            ],
          },
          {
            title: 'OTL Plus',
            people: [
              {
                name: '김재성',
                image: memberSteinImage,
                caption: '2016.06 ~ 2017.06',
              },
              {
                name: '한승현',
                image: memberZealotImage,
                caption: '2017.06 ~ 2023.03',
              },
              {
                name: '오승빈',
                image: memberPlatypusImage,
                caption: '2023.03 ~',
              },
            ],
          },
        ],
    },
  ]

  constructor(props) {
    super(props);
    this.state = {
      selectedProjectIndex: 33,
    };
  }

  selectProject = (project) => {
    this.setState({
      selectedProjectIndex: project.index,
    });
  }

  render() {
    const { selectedProjectIndex } = this.state;

    const selectedProject = this.projects.find((p) => (p.index === selectedProjectIndex));

    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <div className={classNames('page-grid', 'page-grid--full')}>
          <div className={classNames('section')}>
            <div className={classNames('subsection', 'subsection--credit')}>
              <div className={classNames('block-grid')}>
                {
                  this.projects.map((p) => (
                    <ProjectBlock
                      project={p}
                      index={p.index}
                      onClick={this.selectProject}
                      isRaised={selectedProjectIndex === p.index}
                      key={p.index}
                    />
                  ))
                }
              </div>
              <Scroller key={selectedProjectIndex}>
                <div className={classNames('subsection--credit__people-list')}>
                  {
                    selectedProject.fields.map((f) => (
                      <div className={classNames('subsection--credit__people-list__group')} key={f.title}>
                        <div className={classNames('title')}>{f.title}</div>
                        {
                          f.people.map((p) => (
                            <div className={classNames('subsection--credit__people-list__group__elem')} key={p.name}>
                              <img src={p.image} alt={p.name} />
                              {p.caption ? <div className={classNames('caption')}>{p.caption}</div> : null}
                            </div>
                          ))
                        }
                      </div>
                    ))
                  }
                </div>
              </Scroller>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default CreditPage;
