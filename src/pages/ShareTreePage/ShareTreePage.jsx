import { useParams } from 'react-router-dom';
import { useState } from 'react';

import style from './ShareTreePage.module.scss';

import Header from '@/components/Header/Header';
import OriginTree from '@/components/OriginTree/OriginTree';
import LongButtonList from '@/components/LongButtonList/LongButtonList';
import HamburgerButton from '@/components/HamburgerButton/HamburgerButton';
import SideMenu from '@/components/SideMenu/SideMenu';

const ShareTreePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const { uid } = useParams();
  const userList = JSON.parse(localStorage.getItem('userList'));
  let userName;
  let bgSrc;
  let flowerList;

  userList.map((user) => {
    if (user.uid === uid) {
      userName = user.displayName;
      bgSrc = user.bgSrc;
      flowerList = user.flowerList;
    }
  });

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={style.shareTreeContainer}>
      <Header
        userName={userName}
        className={style.shareTreeSubTitle}
        subText={`${flowerList.length}송이의 벚꽃이 피었어요 ! `}
      />
      <OriginTree />
      <LongButtonList
        firstText={'벚꽃 달아주기'}
        secondText={'내 벚꽃나무 보러가기'}
      />
      <div onClick={handleMenuClick}>
        <HamburgerButton />
      </div>
      {isMenuOpen && <SideMenu />}
    </div>
  );
};

export default ShareTreePage;
