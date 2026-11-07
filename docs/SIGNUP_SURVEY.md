# FirstLane signup survey

Public route: https://getfirstlane.com/survey (also works on www). No signup, account cookies, advertising tags, or required email. The survey is not linked in the main navigation and is marked noindex.

## What it answers

1. How much of the product the respondent actually used.
2. Their single biggest upgrade blocker, before mentioning a price.
3. Friction across sign-in, practice, progress, phone layout and checkout; optional description only when relevant.
4. Perceived value of CA$14.99 once, with a conditional optional price range for price/budget objections.
5. Preferred study platform, followed by the practical benefit they want from an installed app.
6. One improvement in their own words and optional permission to follow up by email.

Existing paying customers skip upgrade-blocker and pricing questions. Hidden branch answers are discarded on submission. An unavailable upgrade is a distinct reason, so lack of payment is not automatically interpreted as price resistance. Price descriptions are feedback context, not a claim that checkout is available.

## Reading results

Responses are in the existing production Supabase project `jinbdlckkyzffnocuugn`, table `public.survey_feedback`. RLS is enabled; anonymous and signed-in app users have no table privileges. Only the backend stores feedback. Read through the owner's Supabase SQL editor or connected Supabase tools:

```sql
select received_at, answers
from public.survey_feedback
order by received_at;
```

Start with counts of `answers->>'blocker'`, then read each respondent's stage, friction, price view, platform and written feedback together. With eight invited signups, report counts and individual patterns rather than market percentages. Price preferences are stated intentions, not proof that lowering the price will produce purchases. An app preference alone is not proof that an app will increase paid conversion.

## Implementation

- `public/survey.html` and `public/assets/survey*`: isolated responsive survey; current build copies public files to dist.
- `/api/survey`: same-origin Vercel endpoint; validates input and forwards only survey data.
- Supabase `survey-feedback`: deliberately public, write-only Edge Function (`verify_jwt=false`, because no signup is required), schema validation, bounded body, daily ceiling of 200, and retry-safe response UUIDs. No responses are returned by the endpoint. CORS is not enabled.
- `survey-backend/schema.sql`: deployed table definition. `handler.mjs` and `index.ts`: deployed Edge Function. `survey-model.js` is copied verbatim from the frontend validation model; a test enforces equality.
- No raw IP addresses, device fingerprints or account IDs are saved. Hosting providers may retain ordinary request logs. Responses and email stay in page memory; session storage holds only the random submission ID and receipt. Retrying uses the same ID and cannot overwrite the earlier response.

## Suggested invitation (not sent)

Subject: What would make FirstLane better for you?

Hi,

Thanks for signing up for FirstLane. We’re improving it and would love to hear how it went for you — including anything that didn’t work or didn’t feel worth it.

Could you spare about two minutes to share your experience?

https://getfirstlane.com/survey

There’s no login required. Email is optional, and honest feedback is welcome, whether or not you plan to upgrade.

Thanks for helping us improve,
The FirstLane team
