import style from './MessageCustomPage.module.scss';

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import messageCustomContext from '@/contexts/messageCustomContext';

import classNames from 'classnames';

import { db } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

import MessageCustomList from '@/components/MessageCustomList/MessageCustomList';
import ShortButtonList from '@/components/ShortButtonList/ShortButtonList';
import Header from '@/components/Header/Header';

import blossomInfoList, { blossomInfoListType } from '@/data/blossomInfoList';
import { A11yHidden } from '@/components/A11yHidden/A11yHidden';
import { atom, useRecoilState } from 'recoil';
import { getPageTotalCount } from '@/utils/getPageTotalCount';

const userInfoState = atom<{ nickname: string; blossomSrc: string }>({
  key: 'userInfoState',
  default: {
    nickname: '',
    blossomSrc: 'cherry-blossom1',
  },
});

const MessageCustomPage = () => {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);

  const navigate = useNavigate();
  const { uid } = useParams<string>();

  useEffect(() => {
    (async () => {
      const docRef = doc(db, `users/${uid}`);
      const docSnap = await getDoc(docRef);
      setUserInfo({ ...userInfo, nickname: docSnap.data()?.userNickname });

      getPageTotalCount(uid);
    })();
  }, []);

  const handleSelect = (e: React.TouchEvent<HTMLButtonElement>) => {
    const blossomImage: HTMLDivElement | null =
      document.querySelector('.blossomImage');
    const buttonElement = (e.target as HTMLButtonElement).closest('button');

    blossomInfoList.forEach((item: blossomInfoListType) => {
      if (parseInt(buttonElement?.id ?? '') === item.id) {
        blossomImage?.setAttribute('src', `/assets/${item.src}.png`);
        setUserInfo({ ...userInfo, blossomSrc: item.src });
        return;
      }
    });
  };

  const handleNext = async () => {
    navigate(`/write-message/${uid}/${userInfo.blossomSrc}`);
  };

  return (
    <messageCustomContext.Provider value={{ blossomInfoList, handleSelect }}>
      <A11yHidden as={'h1'}>벚꽃이지면</A11yHidden>
      <div className={style.pageSetting}>
        <div className={style.customContainer}>
          <div className={style.header}>
            <Header
              userName={userInfo.nickname}
              subText={'벚꽃을 골라주세요!'}
            />
          </div>
          <div className={style.blossomMain}>
            <img
              className={classNames('blossomImage', style.blossomImage)}
              src={`/assets/${userInfo.blossomSrc}.png`}
              alt={
                blossomInfoList.find(
                  (blossom: blossomInfoListType) =>
                    blossom.src === userInfo.blossomSrc
                )?.alt ?? ''
              }
            />
          </div>
          <MessageCustomList />
        </div>
        <div>
          <ShortButtonList
            firstText={'이전'}
            firstClick={() => navigate(-1)}
            secondText={'다음'}
            secondClick={handleNext}
          />
        </div>
      </div>
    </messageCustomContext.Provider>
  );
};

export default MessageCustomPage;
