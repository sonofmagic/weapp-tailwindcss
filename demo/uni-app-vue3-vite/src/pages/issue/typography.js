const arr = [
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th'], // 'headings',
  ['h1'],
  ['h2'],
  ['h3'],
  ['h4'],
  ['h5'],
  ['h6'],
  ['p'],
  ['a'],
  ['blockquote'],
  ['figure'],
  ['figcaption'],
  ['strong'],
  ['em'],
  ['code'],
  ['pre'],
  ['ol'],
  ['ul'],
  ['li'],
  ['table'],
  ['thead'],
  ['tr'],
  ['th'],
  ['td'],
  ['img'],
  // ['video'],
  ['hr'],
  // ['lead'], //, ],//, '[class~="lead"]'],
  // ['kbd'],
];

export const html = `
${arr
  .map((array) => {
    return array
      .map((tag) => {
        return `<${tag}>${tag}</${tag}>`;
      })
      .join('\n');
  })
  .join('\n')}
`;
