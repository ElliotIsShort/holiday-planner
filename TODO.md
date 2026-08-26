# Future Features TODO

## Villa URL Auto-Import (Server-Side Scraping)

When ready to implement automated villa extraction from Airbnb/Booking.com URLs:

### Option A: Self-Hosted Solution
**Requires:** A server/cloud function (Firebase Functions, AWS Lambda, Cloudflare Worker)

1. **Puppeteer/Playwright approach**
   - Spin up headless browser
   - Navigate to URL, wait for JS to render
   - Extract data from DOM
   - Return structured JSON
   
   **Pros:** Most reliable, gets all data including dynamic pricing
   **Cons:** Slow (~5-10s per request), needs server hosting, can break when sites update

2. **Proxy service + HTML parsing**
   - Use ScraperAPI, ScrapingBee, or Bright Data
   - They handle anti-bot, you parse the HTML
   
   **Pros:** More reliable than DIY, handles blocks
   **Cons:** Costs money ($29-99/month), still needs HTML parsing

### Option B: Third-Party Scraper Services
- **Apify** - Has pre-built Airbnb and Booking.com actors
  - Pay per usage, no server needed
  - API to trigger scrapes and get results
  - https://apify.com/dtrungtin/airbnb-scraper
  - https://apify.com/logiover/booking-hotels-prices-scraper

### Technical Notes

**Airbnb challenges:**
- Heavy JavaScript rendering
- Prices fetched via separate GraphQL API call
- Need to pass dates in URL to get pricing
- Anti-bot measures (CAPTCHAs, rate limiting)
- HTML structure changes frequently

**Booking.com challenges:**
- Similar JS rendering requirements
- Strong anti-bot protection
- Dynamic content loading
- Geo-based pricing variations

### Implementation Plan (When Ready)

1. Set up Firebase Cloud Functions or Cloudflare Worker
2. Install Puppeteer or use a proxy service
3. Create endpoints:
   - `POST /api/scrape/airbnb` - accepts URL, returns villa data
   - `POST /api/scrape/booking` - accepts URL, returns villa data
4. Add CORS for your frontend domain
5. Update frontend to call these endpoints

### Estimated Costs
- Firebase Functions: ~$0.40 per 1 million invocations + compute time
- Apify: $49/month for ~5000 actor runs
- ScraperAPI: $29/month for 5000 requests

---

## Other Future Enhancements

- [ ] Email notifications when votes change
- [ ] Export trip summary to PDF
- [ ] Expense splitting calculator
- [ ] Itinerary builder
- [ ] Integration with Google Calendar for availability
- [ ] Mobile app (React Native)
