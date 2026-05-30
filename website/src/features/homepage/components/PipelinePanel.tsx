const pipelineSteps: Array<{ id: string, title: string, description: string, tone: string }> = [
  {
    id: 'source',
    title: 'Tailwind CSS 入口',
    description: '@import "tailwindcss" + @source',
    tone: 'source',
  },
  {
    id: 'class-set',
    title: 'classNameSet 精确命中',
    description: '从真实源码收集候选类名',
    tone: 'class-set',
  },
  {
    id: 'targets',
    title: 'Web / Weapp 同源输出',
    description: 'v5 generator 按目标生成 CSS',
    tone: 'targets',
  },
]

export function PipelinePanel() {
  return (
    <div className="home-pipeline" aria-label="weapp-tailwindcss v5 转换流水线">
      <div className="home-pipeline__header">
        <span>v5 generator</span>
        <code>target: web | weapp</code>
      </div>
      <div className="home-pipeline__code" aria-hidden="true">
        <span className="text-slate-500">className=</span>
        <span className="text-[#07c160]">"grid px-4 bg-[#07c160]"</span>
      </div>
      <div className="home-pipeline__steps">
        {pipelineSteps.map((step, index) => (
          <div className={`home-pipeline__step home-pipeline__step--${step.tone}`} key={step.id}>
            <span className="home-pipeline__index">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
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
