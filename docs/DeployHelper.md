# 部署发包流程

1. **确保前端项目源码与后端项目源码在同一目录下**
2. 把 [GitHub 发布项目](https://github.com/CoolKit-Technologies/ha-addon) 和 [Gitee 发布项目](https://gitee.com/eWeLink/Home-Assistant-AddOn) fork 到自己仓库
3. 把 fork 的仓库克隆到本地同一目录
4. 打包
    - FrontEnd: `npm run build`
    - BackEnd: `npm run build`
5. 同步到 fork 仓库：在后端项目运行 `npm run sync`
6. 在发布代码仓库中提交代码并提交一个 `Pull Request`
7. Done! ^_^
