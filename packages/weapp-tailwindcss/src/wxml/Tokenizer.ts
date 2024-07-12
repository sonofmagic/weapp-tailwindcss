// 针对微信的属性表达式进行切词
// https://github.com/sonofmagic/weapp-tailwindcss/issues/319
// all state
export enum State {
  START,
  TEXT,
  OPEN_BRACE,
  POTENTIAL_CLOSE,
  BRACES_COMPLETE,
}

export interface Token {
  start: number
  end: number
  value: string
}

export class Tokenizer {
  private state: State
  private buffer: string
  private tokens: Token[]
  private bufferStartIndex: number

  constructor() {
    this.reset()
  }

  private processChar(char: string, index: number) {
    switch (this.state) {
      case State.START:
        if (char === ' ') {
          // Ignore leading spaces
        }
        else if (char === '{') {
          this.state = State.OPEN_BRACE
          this.bufferStartIndex = index
          this.buffer += char
        }
        else {
          this.state = State.TEXT
          this.bufferStartIndex = index
          this.buffer += char
        }
        break

      case State.TEXT:
        if (char === ' ') {
          this.tokens.push({ start: this.bufferStartIndex, end: index, value: this.buffer })
          this.buffer = ''
          this.state = State.START
        }
        else if (char === '{') {
          this.buffer += char
          this.state = State.OPEN_BRACE
        }
        else {
          this.buffer += char
        }
        break

      case State.OPEN_BRACE:
        if (char === '}') {
          this.buffer += char
          this.state = State.POTENTIAL_CLOSE
        }
        else {
          this.buffer += char
        }
        break

      case State.POTENTIAL_CLOSE:
        if (char === '}') {
          this.buffer += char
          this.state = State.BRACES_COMPLETE
        }
        else {
          this.buffer += `}${char}`
          this.state = State.OPEN_BRACE
        }
        break

      case State.BRACES_COMPLETE:
        if (char === ' ') {
          this.tokens.push({ start: this.bufferStartIndex, end: index, value: this.buffer })
          this.buffer = ''
          this.state = State.START
        }
        else {
          this.buffer += char
          this.state = State.TEXT
        }
        break

      default:
        throw new Error('Unexpected state')
    }
  }

  public run(input: string): Token[] {
    for (let i = 0; i < input.length; i++) {
      const char = input[i]
      this.processChar(char, i)
    }
    // Push the last buffer if it's not empty
    if (this.buffer.length > 0) {
      this.tokens.push({ start: this.bufferStartIndex, end: input.length, value: this.buffer })
    }
    return this.tokens
  }

  public reset() {
    this.state = State.START
    this.buffer = ''
    this.tokens = []
    this.bufferStartIndex = 0
  }
}
