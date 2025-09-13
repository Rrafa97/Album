@echo off
echo 🔨 构建静态网站...
call npm run build

if not exist "out" (
    echo ❌ 构建失败，out目录不存在
    pause
    exit /b 1
)

echo 📝 创建.nojekyll文件...
echo. > out\.nojekyll

echo 🌿 设置gh-pages分支...
git checkout --orphan gh-pages
git reset --hard
git clean -fd

echo 📁 复制构建文件...
xcopy /E /I /Y out\* .

echo 📤 添加文件到git...
git add .
git commit -m "Deploy to GitHub Pages"

echo 🚀 推送到GitHub Pages...
git push origin gh-pages --force

echo 🔄 切换回master分支...
git checkout master

echo ✅ 部署完成！
echo 🌐 你的网站将在几分钟后可在以下地址访问：
echo    https://rrafa97.github.io/Album/
pause
