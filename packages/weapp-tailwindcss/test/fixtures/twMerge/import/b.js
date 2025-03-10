import { b } from './shared'

clsx({ 'px-[35px]': true, 'px-[35px]': false, [`px-[35px] ${b}`]: isTrue() });