@echo off
echo Installing ShapeConnect Frontend...
echo.

echo Step 1: Installing Node.js dependencies...
npm install

echo.
echo Step 2: Installing Tailwind CSS...
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

echo.
echo Installation complete!
echo.
echo To start the development server, run:
echo npm start
echo.
pause