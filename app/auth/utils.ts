export function translateAuthError(errorMsg: string): string {
  const msg = errorMsg.toLowerCase();
  
  if (msg.includes('rate limit exceeded') || msg.includes('rate_limit')) {
    return 'لقد تجاوزت الحد المسموح به لإرسال الرسائل. يرجى الانتظار لمدة دقيقة والمحاولة مجدداً.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول مباشرة.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مجدداً.';
  }
  if (msg.includes('email not confirmed')) {
    return 'يرجى تأكيد حسابك وتفعيله عبر رمز التحقق المرسل لبريدك الإلكتروني أولاً.';
  }
  if (msg.includes('otp') || msg.includes('token') || msg.includes('expired') || msg.includes('invalid')) {
    if (msg.includes('expired')) {
      return 'رمز التحقق منتهي الصلاحية. يرجى طلب رمز جديد.';
    }
    return 'رمز التحقق غير صالح. يرجى التأكد منه والمحاولة مجدداً.';
  }
  
  // Return a friendly fallback if the message is in English
  return errorMsg;
}
