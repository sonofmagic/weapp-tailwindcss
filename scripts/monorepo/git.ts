import type { ConfigValues, SimpleGit, SimpleGitOptions } from 'simple-git'
import get from 'get-value'
import gitUrlParse from 'git-url-parse'
import { simpleGit } from 'simple-git'

export class GitClient {
  private client: SimpleGit
  #config: ConfigValues | undefined
  constructor(options: Partial<SimpleGitOptions> = {}) {
    this.client = simpleGit(options)
  }

  listConfig() {
    return this.client.listConfig()
  }

  async init() {
    const listConfig = await this.listConfig()
    this.#config = listConfig.all
    return this.#config
  }

  async getConfig() {
    if (this.#config) {
      return this.#config
    }
    else {
      return await this.init()
    }
  }

  async getGitUrl() {
    const config = await this.getConfig()
    const x = get(config, 'remote.origin.url')
    if (x) {
      return gitUrlParse(x)
    }
  }

  async getRepoName() {
    const url = await this.getGitUrl()
    if (url) {
      return `${url.owner}/${url.name}`
    }
  }

  async getUser() {
    const config = await this.getConfig()
    const name: string = get(config, 'user.name')
    const email: string = get(config, 'user.email')
    return {
      name,
      email,
    }
  }
}
