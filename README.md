# shake-it
```
发布准备
```
1. src/main.js   firebaseConfig 整个json配置为对应项目的firebaseConfig
2. src/common/config 对应的远程域名base配置。
3. 删除firebase 配置相关文件。
4. firebase init 关联自身项目。public 设置为 dist目录
5. npm install && npm run build
6. firebase deploy

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
