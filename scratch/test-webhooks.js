const fs = require('fs');
const https = require('https');

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function fetchSupabase(table, query = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}?${query}`);
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function analyze() {
  console.log("=== التحليل الشامل للبيانات الواردة من GHL ===");
  
  try {
    // 1. Check Enrollments
    const enrollments = await fetchSupabase('enrollments', 'select=*,profiles(full_name)&order=created_at.desc&limit=5');
    console.log(`\n1. جدول التسجيل والتقدم (enrollments) - آخر 5 حركات:`);
    if(!enrollments || enrollments.length === 0) console.log("لا توجد بيانات.");
    else enrollments.forEach(e => {
      console.log(`- الطالب: ${e.email}`);
      console.log(`  الدورة: ${e.course_title} (ID: ${e.course_id})`);
      console.log(`  التقدم: ${e.progress}%`);
      if (e.progress === 0) {
        console.log(`  ⚠️ تنبيه: النسبة 0% (معناه لم يصل Webhook التقدم، أو وصل بقيمة 0)`);
      } else {
        console.log(`  ✅ النسبة ممتازة: ${e.progress}%`);
      }
    });

    // 2. Check xAPI Statements for Webhook traces
    const statements = await fetchSupabase('xapi_statements', 'select=actor_email,verb_display,object_name,result_score,result_extensions,timestamp&order=timestamp.desc&limit=15');
    console.log(`\n2. جدول النشاطات (xapi_statements) - آخر 15 حركة لتتبع الـ Webhooks:`);
    
    let hasRegistered = false;
    let hasProgressed = false;
    let hasEvaluated = false;

    if(!statements || statements.length === 0) console.log("لا توجد نشاطات.");
    else statements.forEach(s => {
      const verb = s.verb_display;
      const date = new Date(s.timestamp).toLocaleString('ar-SA', {timeZone: 'Asia/Riyadh'});
      
      let info = `- [${date}] ${s.actor_email} قام بـ "${verb}" لدورة "${s.object_name}"`;
      
      if (verb === 'registered' || verb === 'سجّل') hasRegistered = true;
      
      if (verb === 'progressed' || verb === 'تقدّم') {
        hasProgressed = true;
        const progExt = s.result_extensions ? s.result_extensions['https://nabdtraining.com/extensions/progress'] : 'غير متوفر';
        info += ` (نسبة التقدم: ${progExt}%)`;
      }
      
      if (verb === 'evaluated' || verb === 'قيّم') {
        hasEvaluated = true;
        info += ` (التقييم: ${s.result_score?.raw} نجوم)`;
      }
      
      console.log(info);
    });

    console.log("\n=== ملخص الـ Webhooks ===");
    console.log(`Webhook التسجيل (Enrollment): ${hasRegistered ? '✅ شغال ويجيب بيانات' : '❌ لم يتم استلام أي بيانات'}`);
    console.log(`Webhook التقدم (Progress): ${hasProgressed ? '✅ شغال ويجيب بيانات' : '❌ لم يتم استلام أي بيانات'}`);
    console.log(`Webhook التقييم (Evaluation): ${hasEvaluated ? '✅ شغال ويجيب بيانات' : '❌ لم يتم استلام أي بيانات'}`);
    
    console.log("\nالتشخيص:");
    if (!hasProgressed) console.log("⚠️ التقدم (Progress) لم يصل. تأكد من عمل Workflow التقدم في GHL وأن الطالب أكمل درساً فعلياً بعد تشغيله.");
    if (!hasEvaluated) console.log("⚠️ التقييم (Evaluation) لم يصل. تأكد من تفعيل وضع Publish في الـ Workflow، ثم عبئ الفورم من جديد.");

  } catch (error) {
    console.error("Error analyzing:", error);
  }
}

analyze();
