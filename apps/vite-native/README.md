<https://developers.weixin.qq.com/community/develop/doc/00040e5a0846706e893dcc2425600>

分包的 entry 必须放在

```json
"packOptions": {
    "ignore": [],
    "include": [
      {
        "value": "packageA/index.js",
        "type": "file"
      },
      {
        "value": "packageB/index.js",
        "type": "file"
      }
    ]
  }
```
