import { Image, Text, View } from 'rsmax/one'
import styles from './index.css'

export default () => {
  return (
    <View className={styles.app}>
      <View className={styles.header}>
        <Image
          src="https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ"
          className={styles.logo}
        />
        <View className={styles.text}>
          编辑
          {' '}
          <Text>src/pages/index/index.js</Text>
          开始
        </View>
      </View>
    </View>
  )
}

// TypeError: Cannot read property 'current' of undefined
//     at li.callLifecycle (createPageConfig.js:142)
//     at li.onLoad (createPageConfig.js:100)
//     at l.<anonymous> (VM496 WASubContext.js:1)
//     at VM496 WASubContext.js:1
//     at X (VM496 WASubContext.js:1)
//     at VM496 WASubContext.js:1
//     at Array.forEach (<anonymous>)
//     at VM496 WASubContext.js:1
//     at Array.forEach (<anonymous>)
//     at VM496 WASubContext.js:1(env: macOS,mp,1.06.2503300; lib: 3.8.7)
