#!/usr/bin/env node

require('./patch-ajv-keywords')
require('./patch-chalk')
require('@vue/cli-service/bin/vue-cli-service')
