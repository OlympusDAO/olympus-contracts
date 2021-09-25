export interface Node {
  type: string
}

export interface AntlrToken {
  type: string
  text: string
  start: number
  stop: number
  line: number
  column: number
}

export interface TokenizeOptions {
  range?: boolean
  loc?: boolean
}

export interface ParseOptions extends TokenizeOptions {
  tokens?: boolean
  tolerant?: boolean
}

export interface Token {
  type: string
  value: string
  range?: [number, number]
  loc?: {
    start: {
      line: number
      column: number
    }
    end: {
      line: number
      column: number
    }
  }
}
