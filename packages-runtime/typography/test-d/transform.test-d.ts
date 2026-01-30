import { expectType } from 'tsd'
import transform from '../src/transform'

expectType<string>(transform('<p>hello</p>'))
expectType<string>(transform('<p class="text">hello</p>', { prefix: 'prose-' }))
