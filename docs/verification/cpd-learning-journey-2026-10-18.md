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

## Final-frame progress and player sizing correction

The next live screenshot showed the upload at 00:30 while its watch percentage remained below completion. The database confirmed 27.254122 of 30 seconds saved, so the station correctly remained locked on that incomplete record.

- Playback saves now call the player.js `getCurrentTime` method for play, periodic save, pause and ended events. Final saves no longer reuse a potentially stale `timeupdate` value. Requests stay serialized, and only the server's saved watch history can enable the station quiz. Duplicate final events notify completion once.
- The iframe now fills a responsive 16:9 viewport. Removed forced desktop minimum heights and the unresolved percentage-height layout that left the source video at a small intrinsic height.
- Added `20261018171636_cpd_video_tail_accounting.sql`, created with the Supabase CLI and applied to the existing project. One bounded, service-only `uncredited_seconds` column carries up to one second of already elapsed playback time between advancing reports. It clears on pause, rewind, stalled positions, rejected seeks and new sessions. Existing seek bounds, duration requirements, privileges and row-level security remain enforced.
- Reproduced lost elapsed time with the previous database function. The revised function passes both SQL suites, including coarse time updates through the last frame, resuming 27.25/30, duplicate final events, rewind, request spam, stale sessions and direct-client privilege checks. Tests run in transactions and roll back all QA rows. No actual learner progress was manually completed or reset.
- All 259 JavaScript tests, targeted ESLint, production build and build-time TypeScript checks pass. Supabase security advisors returned no findings for the modified table/functions; unrelated findings were left outside this fix.
- Acceptance: refresh the learner's station, resume the final seconds, verify saved watch reaches 100%, complete the newly visible station quiz, then continue. Authenticated visual playback remains for the site owner to confirm.
- Code rollback can leave the additive database fix in place. If its function behavior must also be rolled back, restore the two function definitions from the earlier `course_learning_controls` migration; retaining the unused defaulted column is safe.

## Leaving the player and returning to the tab

The next screenshot showed Next.js's client error fallback when opening the unit quiz or returning after leaving the browser. The live watch record was now 30/30; video completion was preserved.

- Reproduced a concrete teardown exception using the actual CDN player.js SDK: after an iframe loses its browsing context, `off` removes a local listener, then tries `contentWindow.postMessage` and throws `Cannot read properties of null (reading 'postMessage')`. React's passive cleanup can run after that iframe has been removed. The former cleanup stopped at the first exception and crashed the page.
- Player cleanup now isolates each unsubscribe so all remaining local callbacks, timers and visibility listeners are detached even when the iframe is gone. Late playback/seek/rate callbacks cannot issue commands after teardown.
- Public catalog refresh preserves the existing object for each unchanged course. Focus/visibility events and edits to another course no longer reinitialize an unchanged active journey or quiz. Actual curriculum edits and removals still propagate.
- Three regression cases failed before the fix and pass after it: teardown after readiness, teardown before readiness, and unchanged CPD course refresh. Also verified the real component with React 19.2.4 and the actual Bunny SDK in a renderer harness, removing the iframe context before switching to quiz content; no exception and no remaining SDK event callbacks.
- All 262 JavaScript tests, targeted ESLint, production build and build-time TypeScript checks pass.
- No database mutation or learner-attempt reset in this fix. Authenticated browser console/visual verification remains unavailable; the reproduced SDK failure and component regression tests supply the diagnosis evidence.

## Continuous watch tracking and compact satisfaction control

The mobile report showed 29.47543/30 seconds saved, a large heart over the bottom actions, and repeated seek warnings during normal playback.

- Removed the CPD watch-percentage footer and its progress bar. The video retains its responsive 16:9 viewport. Real tracking failures have a compact retry message inside the viewport.
- The floating lesson heart is a 44px vertical control on the right, centered vertically. Desktop positioning follows the expanded/collapsed student sidebar so it stays in the content area. Removed the visible confirmation box; its accessible status remains. Quiz rating controls remain inline.
- One user play click briefly pauses the player until the server acknowledges the start, then resumes automatically. This prevents the initial network round trip from being deducted from watch credit. Position saves run every second, read the actual SDK position, serialize writes and coalesce slow periodic requests. Hiding the tab cancels pending automatic resume and pauses tracking.
- Continuous monotonic playback time replaces the former two-second per-event clamp, which falsely rejected sparse mobile time updates. Real forward seeks still return to the watched position. Server timing corrections resume automatically with a bounded retry count; ordinary timing corrections no longer display a skip accusation.
- Reproduced a second defect with the former database function: a delayed sample at position 1 after four elapsed seconds, followed by position 4 after 0.2 seconds, was rejected even though total elapsed time covered playback. Applied `20261018183613_cpd_video_network_jitter.sql` to carry at most five seconds of already elapsed, uncredited time into the next advancing sample's validation. It clears on pauses, rewinds, stalled reports, rejected seeks and new sessions. Completion still requires server-verified watch time and the provider's duration.
- All three SQL suites pass against the applied function in rolled-back transactions: sequential learning and direct-client privileges, final-frame accounting, and changing network arrival times. Immediate endings, large seeks, paused time, stale sessions and request spam remain blocked. No actual learner progress was completed or reset.
- All 267 JavaScript tests pass, including one-click authorization, first-view completion, one-second saves, sparse mobile events, coalescing, correction recovery, hidden-tab authorization and bounded correction failures. Targeted ESLint, the production build/TypeScript checks, and the real React/Bunny SDK teardown harness pass.
- Live learner acceptance: refresh the video station, start it once and let it finish, then confirm the station quiz becomes available. On mobile confirm the footer is gone and the vertical heart is on the right, clear of completion actions. Authenticated visual playback remains for the site owner to confirm.
- Code rollback can leave this backward-compatible database fix in place. To restore the former timing policy, restore `record_cpd_video_progress` from `20261018171636_cpd_video_tail_accounting.sql`; retaining the wider constraint is safe.

## Unified course workspace and ordinary-course completion

- The ordinary player and the professional journey now share the same responsive outer workspace: lesson navigation on the right at desktop widths, content beside it, and one enclosing course card. Existing CPD station navigation, locks, assessments, video verification and final review remain in place. The CPD itinerary still collapses on smaller screens.
- Ordinary completion/error notices moved outside the two-column grid into a compact, full-width row. They no longer create a narrow extra grid column beneath the player.
- Reproduced the ordinary-course issue in production metadata for course 14: one current lesson, one saved lesson completion, no final exam, and an active enrollment at 99%. No learner record was edited during diagnosis.
- Ordinary progress now counts exact current-course lesson completion IRIs on the server. All lessons reach 100% when no final is configured. A configured final requires a saved passing result for its current question/settings version. Lesson acknowledgements cannot inject a score or total.
- Added authenticated `POST /api/courses/complete` to reconcile older 99% records after verifying those same requirements. The lesson page invokes it when the read-only progress response identifies an eligible unsynchronized enrollment. Lesson completion also persists the resulting status directly. Client progress/video telemetry cannot downgrade an already completed enrollment.
- Ordinary final exams have a distinct address and a visible final-exam action after lessons, so unit-level quizzes cannot mask the final. Final quiz satisfaction remains associated with the final content key. Passing the final refreshes server completion; CPD courses continue to require their own journey-completion endpoint.
- Automated verification: all 272 tests pass, including genuine ordinary final start/fail/retry/pass/completion, historical 99% reconciliation, forged totals/scores, duplicate or foreign completions, changed curricula/exam versions, enrollment ownership, and preserved CPD gates. Production build and build-time TypeScript pass. ESLint comparison found no new findings in changed TypeScript files.
- Replaced all rendered decorative sparkle icons with contextual SVGs throughout the platform. A source AST audit found no remaining rendered sparkle icons or sparkle emojis; the existing Lucide icon imports render valid SVGs. No database schema changes or certificate issuance were performed.
- Live acceptance: refresh the completed ordinary course, confirm 100% and the compact completion row; inspect CPD's shared frame and open/complete stations on desktop and mobile. Authenticated visual checks remain for the site owner.
