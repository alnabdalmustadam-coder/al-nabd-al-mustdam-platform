const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'karim', 'Desktop', 'sustainsulse', 'components', 'sections', 'HeroSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update section container
content = content.replace(
  '<section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 pt-16">',
  '<section className="relative min-h-screen 2xl:min-h-0 2xl:h-screen flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-50 pt-28 pb-32 lg:pt-16 lg:pb-0">'
);

// Update Hero Content Container
content = content.replace(
  '<div className="relative z-10 w-full max-w-[1700px] mx-auto px-6 lg:px-16 flex flex-col xl:flex-row items-stretch justify-between gap-12 xl:gap-0 min-h-[600px] py-12 xl:py-20 pointer-events-none">',
  '<div className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col xl:flex-row items-center xl:items-stretch justify-center gap-8 xl:gap-6 2xl:gap-12 min-h-[600px] py-12 xl:py-20 pointer-events-none mt-4 lg:mt-10 xl:mt-0">'
);

// Update Left Side Container
content = content.replace(
  '<div className="w-full xl:w-[450px] order-2 xl:order-1 flex items-center justify-center pointer-events-none">',
  '<div className="w-full lg:w-[80%] xl:w-[30%] 2xl:w-[450px] order-2 xl:order-1 flex items-center justify-center pointer-events-none">'
);

// Update Left Side Card
content = content.replace(
  'className="w-[450px] h-[500px] text-right pointer-events-auto bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 shadow-xl flex flex-col justify-between cursor-pointer"',
  'className="w-full max-w-[450px] min-h-[350px] xl:h-[500px] text-right pointer-events-auto bg-white/5 backdrop-blur-md p-6 sm:p-8 xl:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 shadow-xl flex flex-col justify-between cursor-pointer"'
);

// Update Left Side Title
content = content.replace(
  '<h2 className="text-3xl lg:text-4xl font-black mb-6 leading-tight text-[#173A7C] drop-shadow-sm">',
  '<h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6 leading-tight text-[#173A7C] drop-shadow-sm line-clamp-2">'
);

// Update Left Side Desc
content = content.replace(
  '<p className="text-slate-600 text-sm lg:text-base leading-relaxed font-medium line-clamp-6">',
  '<p className="text-slate-600 text-sm xl:text-base leading-relaxed font-medium line-clamp-3 sm:line-clamp-4 xl:line-clamp-5">'
);

// Update Left Side Button
content = content.replace(
  'className="bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 hover:bg-white text-base h-14 shadow-sm w-full">',
  'className="bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 hover:bg-white text-sm sm:text-base h-12 sm:h-14 shadow-sm w-full mt-6">'
);

// Update Center Side Container
content = content.replace(
  '<div className="flex-1 order-1 xl:order-2 flex flex-col items-center justify-center gap-6 pointer-events-auto px-4">',
  '<div className="w-full lg:w-[80%] xl:w-[40%] flex-1 order-1 xl:order-2 flex flex-col items-center justify-center gap-6 pointer-events-auto px-2 sm:px-4">'
);

// Update Center Side Box
content = content.replace(
  'className="relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_40px_80px_-20px_rgba(23,58,124,0.15)] rounded-[2.5rem] p-8 lg:p-12 w-full max-w-xl mx-auto overflow-hidden transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(23,58,124,0.2)] hover:-translate-y-1 group"',
  'className="relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_40px_80px_-20px_rgba(23,58,124,0.15)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 xl:p-12 w-full max-w-xl mx-auto overflow-hidden transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(23,58,124,0.2)] hover:-translate-y-1 group"'
);

// Update Center Side Subtitle
content = content.replace(
  '<p className="text-[#5CB07C] text-sm sm:text-base font-bold mb-4 tracking-wide bg-white/60 shadow-sm border border-white/80 inline-block px-4 py-1.5 rounded-full backdrop-blur-md">',
  '<p className="text-[#5CB07C] text-xs sm:text-sm md:text-base font-bold mb-3 sm:mb-4 tracking-wide bg-white/60 shadow-sm border border-white/80 inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-md">'
);

// Update Center Side Main Title
content = content.replace(
  '<h1 className="text-2xl sm:text-3xl font-black leading-tight mb-6 text-slate-900 drop-shadow-sm">',
  '<h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight mb-4 sm:mb-6 text-slate-900 drop-shadow-sm">'
);
content = content.replace(
  '<span className="gradient-text">التميز المهني</span>',
  '<span className="gradient-text sm:mt-2 inline-block">التميز المهني</span>'
);
content = content.replace(
  '<br />',
  '<br className="hidden sm:block" />'
);

// Update Typewriter
content = content.replace(
  '<div className="text-lg sm:text-xl text-slate-800 mb-8 h-10 flex items-center justify-center gap-2 font-semibold">',
  '<div className="text-base sm:text-lg lg:text-xl text-slate-800 mb-6 sm:mb-8 h-8 sm:h-10 flex items-center justify-center gap-2 font-semibold">'
);
content = content.replace(
  '<span className="text-[#173A7C] font-black min-w-[120px] inline-block text-right tracking-tight drop-shadow-sm">',
  '<span className="text-[#173A7C] font-black min-w-[80px] sm:min-w-[120px] inline-block text-right tracking-tight drop-shadow-sm">'
);

// Update CTAs
content = content.replace(
  '<div className="flex flex-col sm:flex-row items-center justify-center gap-4">',
  '<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">'
);
content = content.replace(
  '<Button href="/courses" size="lg" className="h-12 text-base border border-white/20 px-8">',
  '<Button href="/courses" size="lg" className="h-10 sm:h-12 w-full sm:w-auto text-sm sm:text-base border border-white/20 px-6 sm:px-8">'
);
content = content.replace(
  '<Button href="/corporate" variant="secondary" size="lg" className="h-12 text-base bg-white/70 backdrop-blur-md border-white/80 px-8">',
  '<Button href="/corporate" variant="secondary" size="lg" className="h-10 sm:h-12 w-full sm:w-auto text-sm sm:text-base bg-white/70 backdrop-blur-md border-white/80 px-4 sm:px-8">'
);


// Update Stats Box
content = content.replace(
  'className="w-full relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.1)] rounded-[2rem] p-6 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-around gap-8 sm:gap-4 transition-all duration-700 hover:shadow-[0_30px_60px_-10px_rgba(23,58,124,0.15)] hover:-translate-y-0.5 group"',
  'className="w-full relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.1)] rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 mx-auto flex flex-row items-center justify-around gap-2 sm:gap-4 transition-all duration-700 hover:shadow-[0_30px_60px_-10px_rgba(23,58,124,0.15)] hover:-translate-y-0.5 group shrink-0 lg:max-w-xl"'
);

// Update Stat 1 container
content = content.replace(
  '<div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-center">',
  '<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 relative z-10 w-1/2 justify-center text-center sm:text-right">'
);

// Update Stat 1 Icon Box
content = content.replace(
  '<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] bg-white/70 flex items-center justify-center shadow-sm border border-white/80 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">',
  '<div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-[1rem] sm:rounded-[1.25rem] bg-white/70 flex items-center justify-center shadow-sm border border-white/80 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">'
);

// Update Stat 1 Icon
content = content.replace(
  '<svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#173A7C]"',
  '<svg className="w-5 h-5 sm:w-7 sm:h-7 text-[#173A7C]"'
);

// Update Stat 1 text box
// we need to replace the two identical <div className="text-right"> since there are two stats, we will do it explicitly.
// Or we just use global regex. Let\'s do global regex for these repetitive small fixes where safe:
content = content.replace(
  /className="text-right">/g,
  'className="flex flex-col text-center sm:text-right w-full sm:w-auto">'
);
content = content.replace(
  /className="text-2xl sm:text-3xl font-black text-slate-900 leading-none block mb-1 drop-shadow-sm">/g,
  'className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight mb-0.5 sm:mb-1 drop-shadow-sm">'
);
content = content.replace(
  /className="text-xs text-slate-600 font-bold tracking-wide">/g,
  'className="text-[10.5px] sm:text-xs text-slate-600 font-bold tracking-wide">'
);


// Update Divider
content = content.replace(
  '<div className="w-px h-12 bg-white/60 hidden sm:block relative z-10 shadow-sm"></div>',
  '<div className="w-px h-10 sm:h-12 bg-white/60 relative z-10 shadow-sm block"></div>'
);
content = content.replace(
  '<div className="h-px w-full bg-white/60 sm:hidden relative z-10 shadow-sm"></div>',
  ''
);

// Update Stat 2 container
content = content.replace(
  '<div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-center">',
  '<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 relative z-10 w-1/2 justify-center text-center sm:text-right">'
);

// Update Stat 2 Icon Box
content = content.replace(
  '<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] bg-white/70 flex items-center justify-center shadow-sm border border-white/80 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">',
  '<div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-[1rem] sm:rounded-[1.25rem] bg-white/70 flex items-center justify-center shadow-sm border border-white/80 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">'
);
content = content.replace(
  '<svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#5CB07C]"',
  '<svg className="w-5 h-5 sm:w-7 sm:h-7 text-[#5CB07C]"'
);


// Update Right Side container
content = content.replace(
  '<div className="w-full xl:w-[450px] order-3 xl:order-3 flex items-center justify-center pointer-events-none">',
  '<div className="w-full lg:w-[80%] xl:w-[30%] 2xl:w-[450px] order-3 flex items-center justify-center pointer-events-none mb-24 xl:mb-0">'
);

// Update Right Side Box
content = content.replace(
  'className="relative w-[450px] h-[500px] flex items-center justify-center pointer-events-auto bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl cursor-pointer"',
  'className="relative w-full max-w-[450px] aspect-[4/3] sm:aspect-auto sm:h-[400px] xl:h-[500px] flex items-center justify-center pointer-events-auto bg-white/5 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl cursor-pointer"'
);

// Update Right Side Inner Image container
content = content.replace(
  '<div className="w-full h-full relative overflow-hidden rounded-[2.5rem]">',
  '<div className="w-full h-full relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">'
);
content = content.replace(
  'className="w-full h-full object-fill transition-transform duration-700 hover:scale-105"',
  'className="w-full h-full object-fill sm:object-cover transition-transform duration-700 hover:scale-105"'
);

// Update Right Side Tabby Logo
content = content.replace(
  '<div className="absolute -top-6 -right-6 px-3.5 py-1.5 bg-white/20 backdrop-blur-[30px] rounded-2xl shadow-[0_15px_40px_rgba(23,58,124,0.15)] border border-white/60 hover:-translate-y-1 hover:scale-105 transition-all duration-500 flex items-center justify-center z-30">',
  '<div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 px-3 sm:px-3.5 py-1 sm:py-1.5 bg-white/20 backdrop-blur-[30px] rounded-xl sm:rounded-2xl shadow-[0_15px_40px_rgba(23,58,124,0.15)] border border-white/60 hover:-translate-y-1 hover:scale-105 transition-all duration-500 flex items-center justify-center z-30">'
);
content = content.replace(
  '<img src="/tabby.webp" alt="Tabby" className="h-8 sm:h-9 w-auto object-contain drop-shadow-md" />',
  '<img src="/tabby.webp" alt="Tabby" className="h-6 sm:h-8 lg:h-9 w-auto object-contain drop-shadow-md" />'
);

// Update Right Side Tamara Logo
content = content.replace(
  '<div className="absolute -bottom-6 -left-6 px-3.5 py-1.5 bg-white/20 backdrop-blur-[30px] rounded-2xl shadow-[0_15px_40px_rgba(23,58,124,0.15)] border border-white/60 hover:-translate-y-1 hover:scale-105 transition-all duration-500 flex items-center justify-center z-30">',
  '<div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 px-3 sm:px-3.5 py-1 sm:py-1.5 bg-white/20 backdrop-blur-[30px] rounded-xl sm:rounded-2xl shadow-[0_15px_40px_rgba(23,58,124,0.15)] border border-white/60 hover:-translate-y-1 hover:scale-105 transition-all duration-500 flex items-center justify-center z-30">'
);
content = content.replace(
  '<img src="/Tamara.webp" alt="Tamara" className="h-8 sm:h-9 w-auto object-contain drop-shadow-md" />',
  '<img src="/Tamara.webp" alt="Tamara" className="h-6 sm:h-8 lg:h-9 w-auto object-contain drop-shadow-md" />'
);

// Update Carousel Controls Container
content = content.replace(
  '<div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30 pointer-events-auto">',
  '<div className="absolute bottom-8 sm:bottom-16 xl:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-8 z-30 pointer-events-auto bg-white/30 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none px-6 py-2 rounded-full sm:px-0 sm:py-0 border border-white/40 sm:border-none">'
);

// Update Carousel Next/Prev buttons
content = content.replace(
  /className="w-12 h-12 rounded-full bg-white\/90 hover:bg-\[\#173A7C\] hover:text-white backdrop-blur-xl flex items-center justify-center text-\[\#173A7C\] transition-all shadow-lg border border-slate-200 group\/btn"/g,
  'className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-[#173A7C] hover:text-white backdrop-blur-xl flex items-center justify-center text-[#173A7C] transition-all shadow-lg border border-slate-200 group/btn"'
);
content = content.replace(
  /className="w-6 h-6 group-hover\/btn:scale-110 transition-transform"/g,
  'className="w-5 h-5 sm:w-6 sm:h-6 group-hover/btn:scale-110 transition-transform"'
);

// Update Carousel Tracker Dots
content = content.replace(
  /className=\{\`h-3 rounded-full transition-all duration-300 shadow-sm \$\{/g,
  'className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 shadow-sm ${'
);
content = content.replace(
  /currentSlide === idx \? "bg-\[\#173A7C\] w-10" : "bg-\[\#173A7C\]\/20 w-3 hover:bg-\[\#173A7C\]\/40"/g,
  'currentSlide === idx ? "bg-[#173A7C] w-8 sm:w-10" : "bg-[#173A7C]/20 w-2.5 sm:w-3 hover:bg-[#173A7C]/40"'
);

// Write changes
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated HeroSection.tsx with fully responsive classes!");

