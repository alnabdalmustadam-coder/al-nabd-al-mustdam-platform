const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'karim', 'Desktop', 'sustainsulse', 'components', 'sections', 'HeroSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Top Container: change xl:flex-row to lg:flex-row, xl:items-stretch to lg:items-stretch
content = content.replace(
  '<div className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col xl:flex-row items-center xl:items-stretch justify-center gap-8 xl:gap-6 2xl:gap-12 min-h-[600px] py-12 xl:py-20 pointer-events-none mt-4 lg:mt-10 xl:mt-0">',
  '<div className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 lg:gap-4 xl:gap-8 2xl:gap-12 min-h-[600px] py-12 lg:py-16 xl:py-20 pointer-events-none mt-4 lg:mt-6 xl:mt-0">'
);

// 2. Left Side wrapper
content = content.replace(
  '<div className="w-full lg:w-[80%] xl:w-[30%] 2xl:w-[450px] order-2 xl:order-1 flex items-center justify-center pointer-events-none">',
  '<div className="w-full lg:w-[32%] xl:w-[30%] 2xl:w-[450px] order-2 lg:order-1 flex items-stretch justify-center pointer-events-none py-2 lg:py-0">'
);

// 3. Left Side Card
content = content.replace(
  'className="w-full max-w-[450px] min-h-[350px] xl:h-[500px] text-right pointer-events-auto bg-white/5 backdrop-blur-md p-6 sm:p-8 xl:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 shadow-xl flex flex-col justify-between cursor-pointer"',
  'className="w-full max-w-[450px] lg:max-w-none h-full min-h-[350px] text-right pointer-events-auto bg-white/5 backdrop-blur-md p-6 sm:p-8 lg:p-6 xl:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 shadow-xl flex flex-col justify-between cursor-pointer"'
);

// 4. Center Side wrapper
content = content.replace(
  '<div className="w-full lg:w-[80%] xl:w-[40%] flex-1 order-1 xl:order-2 flex flex-col items-center justify-center gap-6 pointer-events-auto px-2 sm:px-4">',
  '<div className="w-full lg:w-[36%] xl:w-[40%] flex-1 order-1 lg:order-2 flex flex-col items-center justify-center gap-4 lg:gap-6 pointer-events-auto px-2 sm:px-4 lg:px-0">'
);

// 5. Center Title
content = content.replace(
  '<h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight mb-4 sm:mb-6 text-slate-900 drop-shadow-sm">',
  '<h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black leading-tight mb-4 sm:mb-6 text-slate-900 drop-shadow-sm">'
);

// 6. Buttons
content = content.replace(
  '<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">',
  '<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full mt-2 lg:mt-4">'
);
content = content.replace(
  '<Button href="/courses" size="lg" className="h-10 sm:h-12 w-full sm:w-auto text-sm sm:text-base border border-white/20 px-6 sm:px-8">',
  '<Button href="/courses" size="lg" className="h-11 sm:h-12 xl:h-14 w-full sm:w-auto text-sm sm:text-base xl:text-lg font-bold border border-white/20 px-6 sm:px-8 xl:px-10">'
);
content = content.replace(
  '<Button href="/corporate" variant="secondary" size="lg" className="h-10 sm:h-12 w-full sm:w-auto text-sm sm:text-base bg-white/70 backdrop-blur-md border-white/80 px-4 sm:px-8">',
  '<Button href="/corporate" variant="secondary" size="lg" className="h-11 sm:h-12 xl:h-14 w-full sm:w-auto text-sm sm:text-base xl:text-lg font-bold bg-white/70 backdrop-blur-md border border-white/80 px-4 sm:px-8 xl:px-10">'
);

// 7. Right Side Wrapper
content = content.replace(
  '<div className="w-full lg:w-[80%] xl:w-[30%] 2xl:w-[450px] order-3 flex items-center justify-center pointer-events-none mb-24 xl:mb-0">',
  '<div className="w-full lg:w-[32%] xl:w-[30%] 2xl:w-[450px] order-3 flex items-stretch justify-center pointer-events-none mb-24 lg:mb-0 py-2 lg:py-0">'
);

// 8. Right Side Card
content = content.replace(
  'className="relative w-full max-w-[450px] aspect-[4/3] sm:aspect-auto sm:h-[400px] xl:h-[500px] flex items-center justify-center pointer-events-auto bg-white/5 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl cursor-pointer"',
  'className="relative w-full max-w-[450px] lg:max-w-none h-full aspect-[4/3] sm:aspect-auto min-h-[350px] flex items-center justify-center pointer-events-auto bg-white/5 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl cursor-pointer"'
);

// Fix Center Stats Card mt-auto so it pushes if the center grows
content = content.replace(
  'className="w-full relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.1)] rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 mx-auto flex flex-row items-center justify-around gap-2 sm:gap-4 transition-all duration-700 hover:shadow-[0_30px_60px_-10px_rgba(23,58,124,0.15)] hover:-translate-y-0.5 group shrink-0 lg:max-w-xl"',
  'className="w-full relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.1)] rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 mx-auto flex flex-row items-center justify-around gap-2 sm:gap-4 transition-all duration-700 hover:shadow-[0_30px_60px_-10px_rgba(23,58,124,0.15)] hover:-translate-y-0.5 group shrink-0 lg:max-w-xl mt-auto"'
);

// Make the Central Glass panel stretch upwards slightly
content = content.replace(
  'className="relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_40px_80px_-20px_rgba(23,58,124,0.15)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 xl:p-12 w-full max-w-xl mx-auto overflow-hidden transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(23,58,124,0.2)] hover:-translate-y-1 group"',
  'className="relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_40px_80px_-20px_rgba(23,58,124,0.15)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:px-8 xl:p-12 w-full max-w-xl mx-auto flex flex-col justify-center overflow-hidden transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(23,58,124,0.2)] hover:-translate-y-1 group mb-auto h-full"'
);


fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated vertical alignment and tablet sizing!");
