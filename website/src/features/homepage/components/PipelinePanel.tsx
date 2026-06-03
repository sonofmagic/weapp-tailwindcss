const pipelineSteps: Array<{ id: string, title: string, description: string, tone: string }> = [
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
    description: '从真实源码收集候选类名',
    shortDescription: '只转已生成类名',
    tone: 'class-set',
  },
  {
    id: 'targets',
    title: 'Web / Weapp 同源输出',
    shortTitle: '输出',
    description: '按目标生成 CSS',
    shortDescription: 'Web 与小程序分端',
    tone: 'targets',
  },
] satisfies Array<{ id: string, title: string, shortTitle: string, description: string, shortDescription: string, tone: string }>

export function PipelinePanel() {
  return (
    <div className="home-pipeline" aria-label="weapp-tailwindcss 转换流水线">
      <div className="home-pipeline__header">
        <span>generator</span>
        <code>target: web | weapp</code>
      </div>
      <div className="home-pipeline__code" aria-hidden="true">
        <span className="text-slate-500">className=</span>
        <span className="text-[#07c160]">"grid px-4 bg-[#07c160]"</span>
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
        <span>输出</span>
        <strong>稳定 CSS + 精确类名转义</strong>
      </div>
    </div>
  )
}
