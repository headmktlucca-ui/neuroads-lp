Newsletter subscription integration

Files added:
- `src/components/editorial/NewsletterSignup.tsx` - client form placed in the editorial sidebar
- `src/app/api/hostinger-reach/route.ts` - server-side API route that forwards subscription requests to Hostinger Reach

Environment variables required (set in your deployment / .env):
- `HOSTINGER_REACH_API_URL` - full API endpoint to create leads in Hostinger Reach
- `HOSTINGER_REACH_API_KEY` - API key / token for authorization
- `HOSTINGER_REACH_PROFILE_ID` - Hostinger Reach profile ID for the target marketing list

Behavior:
- The form posts to `/api/hostinger-reach` with `{ name, email, source }` and expects Hostinger Reach to accept a JSON payload.
- On success the user sees a confirmation message. On error the API returns an informative message.

Notes:
- Adjust the `payload` shape in `route.ts` if Hostinger Reach expects different field names.
- Add server-side validation or double opt-in as required by your marketing policy.
