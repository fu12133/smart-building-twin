# Why

用户要求上传 GitHub 并让其他人直接使用。当前项目仅在本机运行，尚未初始化 Git 仓库。需要建立远端源码仓库和公网静态部署。

# What Changes

- 初始化 Git，上传当前应用、规格与测试文档到当前登录的 GitHub 账号。
- 配置 GitHub Actions 自动构建和 GitHub Pages 发布，支持仓库子路径。
- 为 CI 支持标准 Chromium 验收环境，保留本机 Edge harness。
- 在公网生产站点验证三维模型和 2.5D 设备交互，提供可分享网址。

# Capabilities

## New Capabilities
- `public-deployment`: 可重复的 GitHub Pages 发布和公网访问。

## Modified Capabilities
None.

# Impact

新增公开 GitHub 仓库、Actions 工作流与 Pages 静态站点。用户已明确选择公开仓库和 GitHub Pages，站点供其他人访问。现有模型与数据仍为明确标注的演示内容；没有账户系统或真实 IoT 连接。
