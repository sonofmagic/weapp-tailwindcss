#!/usr/bin/env node
/**
 * Start Docusaurus dev server bound to 0.0.0.0 and print LAN IPs explicitly.
 */
import { spawn } from 'node:child_process'
import os from 'node:os'
import process from 'node:process'

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 4000

/**
 * Check if an IPv4 address is in private ranges.
 * - 10.0.0.0 – 10.255.255.255
 * - 172.16.0.0 – 172.31.255.255
 * - 192.168.0.0 – 192.168.255.255
 */
function isPrivateIPv4(addr) {
  if (!addr) {
    return false
  }
  if (addr.startsWith('10.')) {
    return true
  }
  const seg = addr.split('.').map(Number)
  if (seg[0] === 172 && seg[1] >= 16 && seg[1] <= 31) {
    return true
  }
  if (addr.startsWith('192.168.')) {
    return true
  }
  return false
}

function listLANIPv4() {
  const ifs = os.networkInterfaces()
  const addrs = []
  for (const name of Object.keys(ifs)) {
    for (const info of ifs[name] || []) {
      if (!info || info.internal) {
        continue
      }
      const family = typeof info.family === 'string' ? info.family : (info.family === 4 ? 'IPv4' : 'IPv6')
      if (family !== 'IPv4') {
        continue
      }
      if (info.address && info.address !== '127.0.0.1' && isPrivateIPv4(info.address)) {
        addrs.push({ iface: name, address: info.address })
      }
    }
  }
  return addrs
}

function printHelpfulInfo(port) {
  const addrs = listLANIPv4()
  console.log('\nDev server is starting with host 0.0.0.0 ...\n')
  console.log(`Local:    http://localhost:${port}`)
  if (addrs.length) {
    const primary = addrs[0].address
    console.log(`Network:  http://${primary}:${port}`)
    if (addrs.length > 1) {
      for (let i = 1; i < addrs.length; i++) {
        console.log(`          http://${addrs[i].address}:${port} (${addrs[i].iface})`)
      }
    }
  }
  else {
    console.log('Network:  未检测到局域网 IP（可能未连接网络）')
  }
  console.log('\n提示：想要远程访问，可使用 cloudflared / ngrok / localtunnel 暴露该地址。\n')
}

function start(port) {
  printHelpfulInfo(port)
  const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  const args = ['run', 'docusaurus', 'start', '--port', String(port), '--host', '0.0.0.0']
  const child = spawn(pnpmCmd, args, {
    stdio: 'inherit',
    env: process.env,
  })
  child.on('exit', (code) => {
    process.exitCode = code ?? 0
  })
}

start(DEFAULT_PORT)
