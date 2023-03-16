import {
  createContext,
  useState,
  useParams,
  useEffect,
  useLayoutEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';

import HeaderTitle from '@/components/HeaderTitle/HeaderTitle';
import UsageDescription from '@/components/UsageDescription/UsageDescription';
import blossomTree from '@/assets/main-page/main-tree.png';
import BackgroundCustomList from '@/components/BackgroundCustomList/BackgroundCustomList';
import ShortButtonList from '@/components/ShortButtonList/ShortButtonList';
import OriginTree from '@/components/OriginTree/OriginTree';

import classNames from 'classnames';
import style from './MakeTreePage.module.scss';
import headerStyle from '@/components/Header/Header.module.scss';
import selectPink from '@/assets/custom/select-bg-pink.png';
import selectNight from '@/assets/custom/select-bg-night.png';
import selectSky from '@/assets/custom/select-bg-sky.png';
import bgPink from '@/assets/custom/bg-pink.png';
import bgNight from '@/assets/custom/bg-night.png';
import bgSky from '@/assets/custom/bg-sky.png';

import { useUpdateData } from '@/firebase/firestore/useUpdateData';
import { useReadData } from '@/firebase/firestore/useReadData';

const backgroundImageList = [
  {
    id: 1,
    bigSrc: bgSky,
    isSelected: false,
    smallSrc: selectSky,
  },
  {
    id: 2,
    bigSrc: bgNight,
    isSelected: false,
    smallSrc: selectNight,
  },
  {
    id: 3,
    bigSrc: bgPink,
    isSelected: false,
    smallSrc: selectPink,
  },
];

export const BgContext = createContext();

const MakeTreePage = () => {
  // const { uid } = useParams();
  const navigate = useNavigate();

  const { updateData } = useUpdateData('users');
  const { readData, data, isLoading, error } = useReadData('users');

  const [selectBg, setSelectBg] = useState(
    JSON.stringify('/src/assets/custom/bg-pink.png')
  );

  let targetUid;
  const localUserName = JSON.parse(localStorage.getItem('user'));
  const localUid = JSON.parse(localStorage.getItem('uid'));
  const localUserList = JSON.parse(localStorage.getItem('userList'));

  useEffect(() => {
    localStorage.setItem('bgSrc', selectBg);
  }, []);

  const handleSelect = (e) => {
    const backgoundImage = document.querySelector('.MakeTreePage');
    const buttonElement = e.target.closest('button');

    backgroundImageList.map((item) => {
      if (parseInt(buttonElement.id) === item.id) {
        backgoundImage.style = `background :url(${item.bigSrc}) center no-repeat`;
        setSelectBg(item.bigSrc);
        localStorage.setItem('bgSrc', JSON.stringify(item.bigSrc));
        return;
      }
    });
  };

  const handleComplete = async () => {
    const bgSrc = JSON.parse(localStorage.getItem('bgSrc'));
    const user = JSON.parse(localStorage.getItem('user'));
    updateData(localUid, {
      bgSrc: bgSrc,
      isMade: true,
      url: `https://localhost:3000/share-tree/${localUid}`,
    });
    navigate(`/share-tree/${localUid}`, { replace: true });

    // 뒤로 가기 막기 코드
    history.pushState(null, null, location.href);
    window.onpopstate = function (event) {
      history.go(1);
    };
  };

  const value = { backgroundImageList, setSelectBg, handleSelect };

  useLayoutEffect(() => {
    localUserList.map((user) => {
      if (user.uid === localUid && user.isMade) {
        navigate(`/share-tree/${localUid}`);
      }
    });
  }, []);

  return (
    <BgContext.Provider value={value}>
      <div className={style.makeTreeContainer}>
        <header className={headerStyle.header}>
          <UsageDescription subText={'벚꽃나무에 이름을 적어주세요'} />
          <HeaderTitle userName={`${localUserName ? localUserName : ''}`} />
        </header>
        <OriginTree className={style.originTree} />
        <div className={style.makeTreeCustom}>
          <UsageDescription
            className={style.makeTreeCustomText}
            subText={'벚꽃나무의 하늘을 선택해주세요.'}
          />
          <BackgroundCustomList />
          <ShortButtonList
            firstText={'취소'}
            firstClick={() => navigate('/')}
            secondText={'완료'}
            secondClick={handleComplete}
          />
        </div>
      </div>
    </BgContext.Provider>
  );
};

export default MakeTreePage;
