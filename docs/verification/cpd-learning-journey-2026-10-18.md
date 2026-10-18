# CPD learning journey — reference implementation

Reference: uploaded `منصة التطوير المهني - 4 October 2026.mp4`, duration 5:16. The visual sequence was inspected at five-second intervals. Audio narration was not transcribed. This is an implementation of the demonstrated learning interactions in Nabd's identity, not evidence of regulatory accreditation.

| Reference time | Observed experience | Implementation |
| --- | --- | --- |
| 0:00 | Welcome, itinerary, completion checks, bookmarks | Welcome station; responsive itinerary; saved server progress; optional device-local bookmarks |
| 0:22, 2:22 | Video stations | Existing verified Bunny player; sequential server access; forward seeking beyond watched content blocked |
| 0:47 | Numbered objectives | Course outcomes edited in the curriculum tab, presented as a separate station |
| 0:57–1:22 | Pre-assessment, one question at a time | Separate diagnostic attempt; submitted answers unlock learning regardless of score |
| 1:32–2:27 | Text, illustrations, lists, flip cards and selectable sections | Authorable article blocks: text, image, steps, cards, tabs; keyboard accessible controls |
| 2:47 | Two-column matching | Existing matching interaction retained within sequential assessments |
| 3:17 | Document viewer | Existing PDF/Word/PowerPoint viewer, download, and reading acknowledgement |
| 3:27 | Ranking display | Existing own rank among participants of the same assessment, based on best score; equal scores share rank |
| 3:52 | Post-assessment | Dedicated final station, never hidden by a lesson or unit quiz |
| 4:02 | Completion checklist, recap and replay | Current-version checklist, authored summary, explicit server-verified course completion and review navigation |
| Throughout | Heart feedback | Positive satisfaction for stations and assessments, aggregated in the existing admin report |

The reference's named leaderboard/time-based ranking has not been copied: the current rank exposes the learner's own position, participant count and best score only. No attempt-limit or attendance threshold is inferred from the recording. Existing video verification policy is retained. Reading an article/document is an acknowledgement; UI interaction completion cannot prove comprehension.

## Compatibility and storage

- New journey requires both `professionalDevelopment: true` and `learningJourney.enabled: true`.
- Saving CPD settings in the admin editor prepares the new journey. Published journeys require outcomes, valid content, a pre-assessment and a post-assessment.
- Existing curriculum identifiers, quiz keys, attachments and assessment history are preserved.
- Courses without the opt-in keep the existing student experience. No existing course is automatically enabled.
- All author data uses the existing course catalog JSON payload. No schema migration or live learner-data rewrite.
- Current step content and assessments determine completion hashes. Changed content requires renewed completion.
- Final confirmation checks all current steps and the current server-graded post-assessment result, then records enrollment completion at 100%.
- Both certificate issuance paths recheck the current journey and use the stored post-assessment score. The live enrollments table has no grade column; this release does not introduce one.
- Legacy client progress updates cannot overwrite a journey's verified completion.

## Verification

- 248 automated tests pass, including existing regression coverage and new route/UI interactions.
- New cases cover diagnostic failure followed by continuation, locked final access, forged grades, unauthorized enrollment, changed content, certificate checks, one-question navigation, failed saves, all cards/tabs visited, and overlapping image uploads.
- Production build and TypeScript validation pass.
- New and modified shared components/routes pass ESLint. The two pre-existing large admin/legacy student pages retain their pre-existing lint findings; compare with the parent revision before publication.
- No authenticated visual browser test or real learner video-playback session was performed in this environment. Final mobile/live acceptance uses the account already available to the site owner.

## Admin and live acceptance

1. Open Admin → Courses → edit a test course. Turn on Professional Development.
2. In Curriculum, fill welcome/outcomes/summary. Add a short verified video, an interactive lesson with cards and tabs, a document, and optionally a unit quiz.
3. In Assessments, author separate pre/post questions. Save the course.
4. Use an enrolled student account. Confirm future stations cannot be opened, and that a low pre-assessment score still permits learning after submission.
5. Confirm video forward-skip prevention and progress recovery after reload. Open every card/tab, acknowledge the document, and complete any unit quiz.
6. Fail the post-assessment once: course must remain incomplete. Pass it, complete its station and confirm the final checklist: progress becomes 100%.
7. Check Certificates and Admin → Student Satisfaction. Heart/unheart actions should affect the correct content's aggregate only.
8. Verify the itinerary collapses on mobile, the content remains within the screen width, and ordinary courses still use their existing player.

Rollback: revert the code commit to its parent. Existing catalog JSON, assessment attempts and progress rows can remain; no destructive migration needs reversing.

## Uploaded video readiness correction

The live trial screenshots show the 30-second upload playing in the admin preview while the enrolled learner sees an unavailable-duration error. Admin preview signs playback without requesting video metadata; CPD playback additionally requires the provider's duration before creating its verified watch session. The exact live provider response was not available in this environment.

- Corrected Bunny status mapping: finished (3) and resolution finished (4) are playable; encoding/upload failures (5/8) cannot start a session. Queued, encoding and upload states remain pending. Reference: https://bunny.net/docs/stream/webhooks and https://bunny.net/docs/api-reference/stream/manage-videos/get-video.
- Metadata requests bypass caching and have a 10-second timeout. HTTP, network, malformed and mismatched metadata failures no longer become a fake ready response with zero duration. Zero encoding progress remains zero.
- Playback responses distinguish actual processing, upload failure and metadata unavailability. Session duration still comes exclusively from Bunny; manually entered lesson duration and client duration are ignored.
- Processing triggers at most six automatic retries, five seconds apart. Leaving the lesson aborts the request and cancels pending retries. Manual retry restarts the player without reloading the whole course page.
- Verification: all 257 automated tests pass; targeted ESLint, production build and build-time TypeScript checks pass. Tests include provider states, API outages, bounded retries, cleanup, authoritative duration and existing seek/progress protection.
- Live acceptance remains: reload the learner's video station, try seeking ahead, watch to the end, and verify that the next required step unlocks. No authenticated learner playback or production runtime-log inspection was possible here.
