#!/bin/bash

# 构建静态网站
echo "🔨 构建静态网站..."
npm run build

# 检查构建是否成功
if [ ! -d "out" ]; then
    echo "❌ 构建失败，out目录不存在"
    exit 1
fi

# 创建.nojekyll文件
echo "📝 创建.nojekyll文件..."
touch out/.nojekyll

# 初始化gh-pages分支（如果不存在）
echo "🌿 设置gh-pages分支..."
git checkout --orphan gh-pages
git reset --hard
git clean -fd

# 复制构建文件
echo "📁 复制构建文件..."
cp -r out/* .

# 添加文件到git
echo "📤 添加文件到git..."
git add .
git commit -m "Deploy to GitHub Pages"

# 推送到gh-pages分支
echo "🚀 推送到GitHub Pages..."
git push origin gh-pages --force

# 切换回master分支
echo "🔄 切换回master分支..."
git checkout master

echo "✅ 部署完成！"
echo "🌐 你的网站将在几分钟后可在以下地址访问："
echo "   https://rrafa97.github.io/Album/"
