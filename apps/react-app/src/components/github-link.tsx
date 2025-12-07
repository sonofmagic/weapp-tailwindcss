import { Button } from "@/components/ui/button"
import { ArrowUpRightIcon, GithubIcon } from "@/features/home/icons"

type GithubLinkProps = {
  href?: string
}

export function GithubLink({ href = "https://github.com/sonofmagic/weapp-tailwindcss" }: GithubLinkProps) {
  return (
    <Button variant="outline" size="sm" className="gap-2" asChild>
      <a href={href} target="_blank" rel="noreferrer">
        <GithubIcon className="size-4" />
        GitHub
        <ArrowUpRightIcon className="size-3" />
      </a>
    </Button>
  )
}
