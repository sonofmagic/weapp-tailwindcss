export interface IChange {
  oldValue: string
  newValue: string
}

export class Recorder {
  public changes: IChange[]
  constructor () {
    this.changes = []
  }

  push (record: IChange) {
    this.changes.push(record)
  }

  clear () {
    this.changes.length = 0
  }

  forEach (callbackfn: (value: IChange, index: number, array: IChange[]) => void, thisArg?: any) {
    this.changes.forEach(callbackfn, thisArg)
  }
}
