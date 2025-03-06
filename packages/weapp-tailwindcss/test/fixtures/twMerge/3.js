// Strings (variadic)
clsx('px-[35px]', true && true && 'px-[35px]' , 'px-[35px]');
//=> 'foo bar baz'
const cc = `px-[35px]`
// Objects
clsx({ 'px-[35px]': true, 'px-[35px]': false, [`px-[35px] ${cc}`]: isTrue() });
//=> 'foo baz'

// Objects (variadic)
clsx({ 'px-[35px]': true }, { 'px-[35px]': false }, null, { 'px-[35px]': 'hello' });
//=> 'foo --foobar'

// Arrays
clsx(['px-[35px]', 0, false && 'px-[35px]', 'px-[35px]']);
//=> 'foo bar'

// Arrays (variadic)
clsx(['px-[35px]'], ['', 0, false, 'px-[35px]'], [['px-[35px]', [['px-[35px]'], 'px-[35px]']]]);
//=> 'foo bar baz hello there'

// Kitchen sink (with nesting)
clsx('px-[35px]', [1 && 'px-[35px]', { 'px-[35px]': false, 'px-[35px]': null }, ['px-[35px]', ['px-[35px]']]], 'px-[35px]');
//=> 'foo bar hello world cya'