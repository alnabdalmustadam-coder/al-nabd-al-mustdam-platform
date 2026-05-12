import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 });
  }

  try {
    // 1. Search for contact in GHL
    const searchRes = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${process.env.GHL_LOCATION_ID}&query=${email}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
      }
    );

    const searchData = await searchRes.json();
    const contact = searchData.contacts?.[0];

    if (!contact) {
      return NextResponse.json({ courses: [] });
    }

    // 2. Fetch memberships/offers for this contact
    // Note: In GHL API v2, courses are often under 'offers' or specific membership endpoints.
    // For now, we will return a success signal or fetch tags to determine courses if direct API is restricted.
    
    // Fallback: If we can't fetch direct courses easily, we use tags to identify them.
    const tags = contact.tags || [];
    
    // Example mapping of tags to courses
    const courseMapping = [
      { tag: "course-haceb", title: "استخدام الحاسب الآلي في الأعمال المكتبية", image: "/courses/haceb.jpg" },
      { tag: "course-data-entry", title: "دورات ادخال بيانات ومعالجة نصوص", image: "/courses/data.jpg" },
      { tag: "course-english", title: "دورة اللغة الانجليزية", image: "/courses/english.jpg" },
    ];

    const enrolled = courseMapping.filter(c => tags.includes(c.tag));

    // If no tags found, let's return some defaults for testing if needed, or empty list.
    return NextResponse.json({ 
      contactId: contact.id,
      courses: enrolled.length > 0 ? enrolled : [],
      allTags: tags
    });

  } catch (err) {
    console.error("GHL Fetch Error:", err);
    return NextResponse.json({ message: "حدث خطأ في الاتصال بـ GHL" }, { status: 500 });
  }
}
