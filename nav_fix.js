const fs = require('fs');
const path = require('path');
const file = path.join('c:', 'Users', 'karim', 'Desktop', 'sustainsulse', 'components', 'layout', 'Navbar.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">',
  '<div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 flex items-center justify-between">'
);

content = content.replace(
  '{/* Logo */}\n          <Link href="/" className="flex items-center gap-3 group shrink-0">',
  '{/* Logo */}\n          <div className="flex-1 flex justify-start shrink-0">\n            <Link href="/" className="flex items-center gap-3 group">'
);
content = content.replace(
  '<img src="/logo.svg" alt="TTi Logo" className="h-12 w-auto object-contain" />\n          </Link>',
  '<img src="/logo.svg" alt="TTi Logo" className="h-10 lg:h-10 xl:h-12 w-auto object-contain" />\n            </Link>\n          </div>'
);

content = content.replace(
  '<div className="hidden lg:flex items-center gap-0.5 xl:gap-1 justify-center flex-1 mx-4 lg:mx-2 xl:mx-8 relative">',
  '<div className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 justify-center shrink-0 mx-2 relative">'
);

content = content.replace(
  '{/* Desktop CTA */}\n          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">',
  '{/* Desktop CTA & Mobile Toggle Wrapper */}\n          <div className="flex-1 flex items-center justify-end gap-2 xl:gap-3">\n            <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">'
);

content = content.replace(
  'سجّل الآن\n            </Button>\n          </div>\n\n          {/* Mobile Toggle */}\n          <button\n            onClick={() => setMobileOpen(!mobileOpen)}\n            className={`lg:hidden p-2 text-slate-800 hover:text-[#173A7C]`}\n            aria-label="القائمة"\n          >\n            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}\n          </button>\n        </div>',
  'سجّل الآن\n            </Button>\n            </div>\n\n            {/* Mobile Toggle */}\n            <button\n              onClick={() => setMobileOpen(!mobileOpen)}\n              className={`lg:hidden p-2 text-slate-800 hover:text-[#173A7C]`}\n              aria-label="القائمة"\n            >\n              {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}\n            </button>\n          </div>\n        </div>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Navbar successfully transformed to perfectly centered nav links.');
