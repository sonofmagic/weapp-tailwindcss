import { useCurrentSiteLocale } from '@site/src/i18n/runtime'

const pipelineStepCopy = {
  'zh-cn': [
    {
      id: 'source',
      title: 'Tailwind CSS 入口',
      shortTitle: '入口',
      description: '@import "tailwindcss" + @source',
      shortDescription: '@import + @source',
      tone: 'source',
    },
    {
      id: 'class-set',
      title: 'classNameSet 精确命中',
      shortTitle: '命中',
      description: '只转换已生成类名',
      shortDescription: '只转已生成类名',
      tone: 'class-set',
    },
    {
      id: 'targets',
      title: 'Web / Weapp 分端输出',
      shortTitle: '输出',
      description: 'target 自动切换',
      shortDescription: 'Web 与小程序分端',
      tone: 'targets',
    },
  ],
  'en': [
    {
      id: 'source',
      title: 'Tailwind CSS entry',
      shortTitle: 'Entry',
      description: '@import "tailwindcss" + @source',
      shortDescription: '@import + @source',
      tone: 'source',
    },
    {
      id: 'class-set',
      title: 'Precise classNameSet hit',
      shortTitle: 'Match',
      description: 'Transform generated classes only',
      shortDescription: 'Generated classes only',
      tone: 'class-set',
    },
    {
      id: 'targets',
      title: 'Web / Weapp split output',
      shortTitle: 'Output',
      description: 'target switches automatically',
      shortDescription: 'Web vs mini app output',
      tone: 'targets',
    },
  ],
} satisfies Record<string, Array<{ id: string, title: string, shortTitle: string, description: string, shortDescription: string, tone: string }>>

export function PipelinePanel() {
  const locale = useCurrentSiteLocale()
  const pipelineSteps = pipelineStepCopy[locale]

  return (
    <div className="home-pipeline" aria-label={locale === 'en' ? 'weapp-tailwindcss transformation pipeline' : 'weapp-tailwindcss 转换流水线'}>
      <div className="home-pipeline__header">
        <span>generator</span>
        <code>target: web | weapp</code>
      </div>
      <div className="home-pipeline__code" aria-hidden="true">
        <span className="text-slate-500">className=</span>
        <span className="text-[#0ea5e9]">"grid px-4 bg-[#0ea5e9]"</span>
      </div>
      <div className="home-pipeline__steps">
        {pipelineSteps.map(step => (
          <div className={`home-pipeline__step home-pipeline__step--${step.tone}`} key={step.id}>
            <span className="home-pipeline__index" aria-hidden="true"></span>
            <div>
              <strong>
                <span className="home-pipeline__full-text">{step.title}</span>
                <span className="home-pipeline__mobile-text">{step.shortTitle}</span>
              </strong>
              <p>
                <span className="home-pipeline__full-text">{step.description}</span>
                <span className="home-pipeline__mobile-text">{step.shortDescription}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="home-pipeline__output">
        <span>{locale === 'en' ? 'Output' : '输出'}</span>
        <strong>{locale === 'en' ? 'Stable CSS + precise class escaping' : '稳定 CSS + 精确类名转义'}</strong>
      </div>
    </div>
  )
}
