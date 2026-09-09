interface WebHmrCleanup {
  closeBrowser: () => Promise<unknown>
  stopServer: () => unknown | Promise<unknown>
  restoreSource: () => Promise<unknown>
  closeProject: () => Promise<unknown>
}

export async function cleanupWebHmrSession(actions: WebHmrCleanup) {
  // 先断开观察者，再停止被观察服务，避免浏览器重连把清理误判为运行失败。
  try {
    await actions.closeBrowser()
  }
  finally {
    try {
      await actions.stopServer()
    }
    finally {
      try {
        await actions.restoreSource()
      }
      finally {
        await actions.closeProject()
      }
    }
  }
}
