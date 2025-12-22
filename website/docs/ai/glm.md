# 平台对接配置管理 API 文档

## 基础信息

- **基础路径**: `/platform-docking-config`
- **Content-Type**: `application/json`
- **响应格式**: 统一使用 `JsonResult<T>` 格式

## 统一响应结构
n
{
  "code": 0,        // 响应码，0表示成功，非0表示失败
  "msg": "消息",     // 响应消息
  "data": {}        // 响应数据，类型根据接口而定
}## 通用字段说明

所有配置实体都继承自 `BaseEntity`，包含以下通用字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳（毫秒） |
| uts | Long | 更新时间戳（毫秒） |

---

## 一、样本上报开关设置

### 1.1 获取样本上报开关设置

- **URL**: `/platform-docking-config/sample-reporting-switch`
- **Method**: `GET`
- **权限要求**: 无特殊权限要求

#### 响应数据 (SampleReportingSwitchConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| networkMonitoringEnabled | Boolean | 网监平台上报开关：false-关闭，true-开启 |
| syncToSuperior | Boolean | 向上级同步：false-否，true-是 |
| reportToSecurityPlatform | Boolean | 上报网安平台：false-否，true-是 |
| subordinateBandwidth | Integer | 下级中心传输带宽（Kbps） |
| maxSampleFileSize | Integer | 样本文件最大（M） |

#### 请求示例
ript
fetch('/platform-docking-config/sample-reporting-switch', {
  method: 'GET'
})
.then(response => response.json())
.then(data => {
  if (data.code === 0) {
    console.log('获取成功', data.data);
  }
});#### 响应示例

{
  "code": 0,
  "msg": "",
  "data": {
    "id": 1,
    "cts": 1699000000000,
    "uts": 1699000000000,
    "networkMonitoringEnabled": true,
    "syncToSuperior": false,
    "reportToSecurityPlatform": true,
    "subordinateBandwidth": 1000,
    "maxSampleFileSize": 100
  }
}### 1.2 保存样本上报开关设置

- **URL**: `/platform-docking-config/sample-reporting-switch`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

#### 请求参数 (SampleReportingSwitchConfig)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 否 | 数据库主键ID，更新时必填 |
| networkMonitoringEnabled | Boolean | 否 | 网监平台上报开关 |
| syncToSuperior | Boolean | 否 | 向上级同步 |
| reportToSecurityPlatform | Boolean | 否 | 上报网安平台 |
| subordinateBandwidth | Integer | 否 | 下级中心传输带宽（Kbps） |
| maxSampleFileSize | Integer | 否 | 样本文件最大（M） |

#### 请求示例
ript
fetch('/platform-docking-config/sample-reporting-switch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    networkMonitoringEnabled: true,
    syncToSuperior: false,
    reportToSecurityPlatform: true,
    subordinateBandwidth: 1000,
    maxSampleFileSize: 100
  })
})
.then(response => response.json())
.then(data => {
  if (data.code === 0) {
    console.log('保存成功', data.data);
  }
});---

## 二、通用信息设置

### 2.1 获取通用信息设置

- **URL**: `/platform-docking-config/general-info`
- **Method**: `GET`

#### 响应数据 (GeneralInfoConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| unitCode | String | 单位编码 |
| unitName | String | 单位名称 |
| unitLevel | String | 单位级别 |
| affiliatedZone | String | 所属分区 |
| deviceLocation | String | 设备位置 |
| voltageLevel | String | 电压等级 |
| securityZone | String | 安全区域 |
| managementModuleIp | String | 管理模块IP地址 |
| managementModuleMac | String | 管理模块MAC地址 |
| managementModuleName | String | 管理模块名称 |
| managementCenterId | String | 管理中心标识 |
| brandCode | String | 品牌编码 |
| registrationCode | String | 注册码 |

### 2.2 保存通用信息设置

- **URL**: `/platform-docking-config/general-info`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

#### 请求参数 (GeneralInfoConfig)

所有字段均为可选，根据实际需要传递。

---

## 三、第三方平台上报设置

### 3.1 获取所有第三方平台上报设置

- **URL**: `/platform-docking-config/third-party-platform-report`
- **Method**: `GET`

#### 响应数据

返回 `List<ThirdPartyPlatformReportConfig>` 数组

#### 响应数据字段 (ThirdPartyPlatformReportConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| reportEnabled | Boolean | 上报开关：false-关闭，true-开启 |
| reportType | String | 上报类型：上级中心/分析平台 |
| ipAddress | String | IP地址 |
| port | Integer | 端口号 |

### 3.2 保存第三方平台上报设置

- **URL**: `/platform-docking-config/third-party-platform-report`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

#### 请求参数 (ThirdPartyPlatformReportConfig)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 否 | 数据库主键ID，更新时必填 |
| reportEnabled | Boolean | 否 | 上报开关 |
| reportType | String | 否 | 上报类型 |
| ipAddress | String | 否 | IP地址 |
| port | Integer | 否 | 端口号 |

### 3.3 删除第三方平台上报设置

- **URL**: `/platform-docking-config/third-party-platform-report/{id}`
- **Method**: `DELETE`
- **权限要求**: 需要系统设置删除权限（会记录操作日志）

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 要删除的配置ID |

#### 请求示例

fetch('/platform-docking-config/third-party-platform-report/1', {
  method: 'DELETE'
})
.then(response => response.json())
.then(data => {
  if (data.code === 0) {
    console.log('删除成功');
  }
});---

## 四、网安平台上报设置

### 4.1 获取网安平台上报设置

- **URL**: `/platform-docking-config/network-security-platform-report`
- **Method**: `GET`

#### 响应数据 (NetworkSecurityPlatformReportConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| reportEnabled | Boolean | 上报开关：false-关闭，true-开启 |
| type1NetworkMonitoringIp | String | 一型网监地址IP |
| type1NetworkMonitoringPort | Integer | 一型网监地址端口 |
| virusDbUpdateDays | Integer | 未更新病毒库时间（天） |
| dockingPlatform | String | 对接平台：南瑞/科东 |
| securityPlatformIp | String | 网安平台对接地址IP |
| securityPlatformPort | Integer | 网安平台对接地址端口 |

### 4.2 保存网安平台上报设置

- **URL**: `/platform-docking-config/network-security-platform-report`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

---

## 五、二型网监平台上报设置

### 5.1 获取二型网监平台上报设置

- **URL**: `/platform-docking-config/type2-network-monitoring-platform`
- **Method**: `GET`

#### 响应数据 (Type2NetworkMonitoringPlatformConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| syslogReportEnabled | Boolean | syslog上报开关：false-关闭，true-开启 |
| networkMonitoringPlatformIp | String | 网监平台IP地址 |
| networkMonitoringPlatformPort | Integer | 网监平台端口 |

### 5.2 保存二型网监平台上报设置

- **URL**: `/platform-docking-config/type2-network-monitoring-platform`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

---

## 六、恶意代码信息上报设置

### 6.1 获取恶意代码信息上报设置

- **URL**: `/platform-docking-config/malicious-code-info-report`
- **Method**: `GET`

#### 响应数据 (MaliciousCodeInfoReportConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| type1NetworkMonitoringEnabled | Boolean | 一型网监上报：false-关闭，true-开启 |
| securityPlatformReportEnabled | Boolean | 网安平台上报：false-关闭，true-开启 |

### 6.2 保存恶意代码信息上报设置

- **URL**: `/platform-docking-config/malicious-code-info-report`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

---

## 七、隔离装置对接设置

### 7.1 获取所有隔离装置对接设置

- **URL**: `/platform-docking-config/isolation-device-docking`
- **Method**: `GET`

#### 响应数据

返回 `List<IsolationDeviceDockingConfig>` 数组

### 7.2 根据区域和方向获取隔离装置对接设置

- **URL**: `/platform-docking-config/isolation-device-docking/zone/{zone}/direction/{direction}`
- **Method**: `GET`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| zone | Integer | 是 | 区域：1-一区，2-二区，3-三区 |
| direction | String | 是 | 方向：receive-接收，send-发送 |

#### 请求示例

fetch('/platform-docking-config/isolation-device-docking/zone/1/direction/send', {
  method: 'GET'
})
.then(response => response.json())
.then(data => {
  if (data.code === 0) {
    console.log('获取成功', data.data);
  }
});#### 响应数据字段 (IsolationDeviceDockingConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| zone | Integer | 区域：1-一区，2-二区，3-三区 |
| direction | String | 方向：receive-接收，send-发送 |
| server | String | 服务器地址 |
| port | Integer | 端口号 |
| username | String | 用户名 |
| password | String | 密码 |
| directory | String | 目录 |
| heartbeatDirectory | String | 心跳目录（仅发送方向） |
| terminalStatsUploadDirectory | String | 终端统计和样本上传目录（仅发送方向） |
| upgradeFeedbackDirectory | String | 升级反馈目录（仅发送方向） |
| sm2PublicKey | String | SM2公钥（仅发送方向） |
| suffix | String | 后缀 |
| verifySignature | Boolean | 是否验签：false-否，true-是 |
| sendFileSize | Integer | 发送文件大小（M，仅发送方向） |

### 7.3 保存隔离装置对接设置

- **URL**: `/platform-docking-config/isolation-device-docking`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

### 7.4 删除隔离装置对接设置

- **URL**: `/platform-docking-config/isolation-device-docking/{id}`
- **Method**: `DELETE`
- **权限要求**: 需要系统设置删除权限（会记录操作日志）

---

## 八、国分云对接设置

### 8.1 获取所有国分云对接设置

- **URL**: `/platform-docking-config/guofen-cloud-docking`
- **Method**: `GET`

#### 响应数据

返回 `List<GuofenCloudDockingConfig>` 数组

### 8.2 根据配置类型获取国分云对接设置

- **URL**: `/platform-docking-config/guofen-cloud-docking/type/{configType}`
- **Method**: `GET`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| configType | String | 是 | 配置类型：feature_library_upgrade-特征库升级设置，sample_report-样本上报设置 |

#### 响应数据字段 (GuofenCloudDockingConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| configType | String | 配置类型：feature_library_upgrade-特征库升级设置，sample_report-样本上报设置 |
| server | String | 服务器地址 |
| port | Integer | 端口号 |
| username | String | 用户名 |
| password | String | 密码 |
| dailyHeartbeatTime | String | 每天发送心跳日志时间（时） |
| downloadFileInterval | Integer | 间隔下载文件（分钟） |
| dailyClientInfoTime | String | 每天发送客户端信息时间（时） |
| maliciousCodeSourceServiceIp | String | 恶意代码管理模块源服务IP（仅样本上报设置） |
| registrationName | String | 注册名（仅样本上报设置） |
| activationCode | String | 激活码（仅样本上报设置） |
| heartbeatInterval | Integer | 间隔发送心跳（分钟，仅样本上报设置） |
| maxSampleFileSize | Integer | 样本文件最大（M，仅样本上报设置） |
| keyVersion | String | 密钥版本（仅样本上报设置） |
| sm2PublicKey | String | SM2公钥（仅样本上报设置） |

### 8.3 保存国分云对接设置

- **URL**: `/platform-docking-config/guofen-cloud-docking`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

---

## 九、流量采集和分析平台对接设置

### 9.1 获取所有流量采集和分析平台对接设置

- **URL**: `/platform-docking-config/traffic-collection-analysis-platform`
- **Method**: `GET`

#### 响应数据

返回 `List<TrafficCollectionAnalysisPlatformConfig>` 数组

### 9.2 根据区域和方向获取流量采集和分析平台对接设置

- **URL**: `/platform-docking-config/traffic-collection-analysis-platform/zone/{zone}/direction/{direction}`
- **Method**: `GET`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| zone | Integer | 是 | 区域：3-三区 |
| direction | String | 是 | 方向：receive-接收，send-发送 |

#### 响应数据字段 (TrafficCollectionAnalysisPlatformConfig)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 数据库主键ID |
| cts | Long | 创建时间戳 |
| uts | Long | 更新时间戳 |
| zone | Integer | 区域：3-三区 |
| direction | String | 方向：receive-接收，send-发送 |
| server | String | 服务器地址 |
| port | Integer | 端口号 |
| username | String | 用户名 |
| password | String | 密码 |
| directory | String | 目录 |
| suffix | String | 后缀 |
| sendFileSize | Integer | 发送文件大小（M，仅发送方向） |
| verifySignature | Boolean | 是否验签：false-否，true-是 |

### 9.3 保存流量采集和分析平台对接设置

- **URL**: `/platform-docking-config/traffic-collection-analysis-platform`
- **Method**: `POST`
- **权限要求**: 需要系统设置编辑权限（会记录操作日志）

### 9.4 删除流量采集和分析平台对接设置

- **URL**: `/platform-docking-config/traffic-collection-analysis-platform/{id}`
- **Method**: `DELETE`
- **权限要求**: 需要系统设置删除权限（会记录操作日志）

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 非0 | 失败，具体错误信息见 `msg` 字段 |

## 注意事项

1. 所有保存和删除操作都会记录操作日志（类型：系统设置）
2. 时间戳字段（cts、uts）为毫秒级时间戳
3. Boolean 类型字段：`false` 表示关闭/否，`true` 表示开启/是
4. 部分字段仅在特定方向或配置类型下有效，请根据实际情况传递
5. 更新配置时，需要传递 `id` 字段；新建配置时，不需要传递 `id` 字段