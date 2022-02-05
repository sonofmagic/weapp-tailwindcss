import { useCallback, useState } from "react";
import { View, Text, Button } from "@tarojs/components";
// import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";

import styles from './index.module.scss'
import './index.scss'

const Index = () => {

  const [flag] = useState(true)
  return (
    <View className={`text-[100px] font-bold underline ${styles['xxx']} ${flag ? 'bg-[#adfafa]' : null}`}>123</View>
  );
};

export default Index;
