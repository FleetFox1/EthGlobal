# Bug Recognition AI & Data Visualization Research

## Overview
This document outlines the options for implementing AI-powered bug identification and creating educational infographics for the BugDex platform.

---

## 🤖 Bug Recognition AI APIs

### 1. **OpenAI Vision API (GPT-4 Vision)** ⭐ RECOMMENDED
- **Pros:**
  - Very accurate for insect identification
  - Can provide detailed descriptions, common names, scientific names
  - Returns structured JSON with species info
  - Easy to integrate with Next.js API routes
  - Can extract multiple data points (habitat, diet, danger level, etc.)
  - Supports follow-up questions for more details
  
- **Cons:**
  - Costs money (but affordable: ~$0.01 per image)
  - Requires OpenAI API key
  
- **Implementation:**
  ```typescript
  // app/api/identify-bug/route.ts
  import OpenAI from 'openai';
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  export async function POST(request: Request) {
    const { imageUrl } = await request.json();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Identify this insect/bug. Provide:
              1. Common name
              2. Scientific name (genus and species)
              3. Family and order
              4. Geographic distribution
              5. Habitat preferences
              6. Diet
              7. Interesting facts
              8. Conservation status
              9. Is it dangerous to humans?
              10. Average size
              
              Return as JSON format.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });
    
    return Response.json(response.choices[0].message.content);
  }
  ```

- **Cost Estimate:**
  - ~$0.01 per identification
  - 1000 identifications = ~$10
  - Very reasonable for hackathon

---

### 2. **Google Cloud Vision API**
- **Pros:**
  - Free tier available (1000 requests/month)
  - Very fast response times
  - Label detection can identify insects
  - Web detection finds similar images online
  
- **Cons:**
  - Less detailed than GPT-4 Vision
  - Returns generic labels, not scientific names
  - Would need additional API calls to get detailed info
  
- **Use Case:** Good as a fallback or for quick validation

---

### 3. **iNaturalist API** ⭐ GREAT FOR BIODIVERSITY DATA
- **Pros:**
  - FREE and open source
  - Specialized in species identification
  - Huge database of observations
  - Community-verified identifications
  - Rich metadata (photos, maps, taxonomy)
  
- **Cons:**
  - No direct image recognition (need to use their computer vision model separately)
  - CV model is more complex to integrate
  
- **API Endpoints:**
  - `https://api.inaturalist.org/v1/taxa/{id}` - Get species details
  - `https://api.inaturalist.org/v1/observations` - Search observations
  
- **Use Case:** Perfect for getting rich educational content AFTER identification

---

### 4. **Azure Computer Vision**
- **Pros:**
  - Good accuracy
  - Free tier available
  - Multiple features (OCR, object detection, etc.)
  
- **Cons:**
  - Similar limitations to Google Vision
  - Less detailed insect identification
  
---

## 📚 Data Sources for Educational Content

### 1. **Wikipedia API** ⭐ RECOMMENDED
- **Pros:**
  - FREE and comprehensive
  - Official API, no scraping needed
  - Rich content for most species
  - Images available
  - Multiple languages
  
- **API Endpoints:**
  ```
  https://en.wikipedia.org/api/rest_v1/page/summary/{title}
  ```
  
- **Implementation:**
  ```typescript
  async function getWikipediaInfo(scientificName: string) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      title: data.title,
      description: data.extract,
      image: data.thumbnail?.source,
      url: data.content_urls.desktop.page,
    };
  }
  ```

---

### 2. **iNaturalist API**
- **Data Available:**
  - Taxonomy hierarchy (Kingdom → Species)
  - Conservation status
  - Photo gallery
  - Geographic distribution maps
  - Observation counts
  - Phenology (when they're active)
  
- **Example:**
  ```typescript
  async function getINaturalistData(scientificName: string) {
    const searchUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results.length > 0) {
      const taxon = data.results[0];
      return {
        commonName: taxon.preferred_common_name,
        scientificName: taxon.name,
        rank: taxon.rank,
        photos: taxon.default_photo,
        wikipediaUrl: taxon.wikipedia_url,
        conservationStatus: taxon.conservation_status,
      };
    }
  }
  ```

---

### 3. **BugGuide.net** (Web Scraping)
- **Pros:**
  - Extremely detailed for North American insects
  - High-quality images
  - Expert-verified information
  
- **Cons:**
  - No official API (requires scraping)
  - Only covers North America
  
- **Implementation:** Use Cheerio for scraping
  ```typescript
  import * as cheerio from 'cheerio';
  
  async function scrapeBugGuide(scientificName: string) {
    // Search page
    const searchUrl = `https://bugguide.net/index.php?q=search&keys=${encodeURIComponent(scientificName)}`;
    const html = await fetch(searchUrl).then(r => r.text());
    const $ = cheerio.load(html);
    
    // Extract data from search results
    // ...
  }
  ```

---

### 4. **GBIF (Global Biodiversity Information Facility)**
- **Pros:**
  - FREE API
  - Massive dataset (>2 billion occurrence records)
  - Scientific accuracy
  - Geographic distribution data
  
- **API:**
  ```
  https://api.gbif.org/v1/species/search?q={scientificName}
  ```

---

## 🎨 Infographic & Visualization Options

### 1. **Recharts** ⭐ RECOMMENDED
- React-based charting library
- Great for Next.js integration
- Types of charts useful for bugs:
  - **Bar Chart:** Population by region
  - **Pie Chart:** Diet composition
  - **Line Chart:** Seasonal activity
  - **Radar Chart:** Threat assessment (venom, bite force, disease risk)

```bash
pnpm add recharts
```

```typescript
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const threatData = [
  { threat: 'Venom', value: 8 },
  { threat: 'Bite Force', value: 3 },
  { threat: 'Disease', value: 2 },
  { threat: 'Aggression', value: 5 },
  { threat: 'Territoriality', value: 6 },
];

<RadarChart width={300} height={300} data={threatData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="threat" />
  <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
</RadarChart>
```

---

### 2. **React Icon Components**
- Custom SVG icons for bug characteristics
- Example categories:
  - Size indicator (ant → human scale)
  - Habitat icons (forest, water, desert)
  - Diet icons (herbivore, carnivore, omnivore)
  - Danger level (☠️ rating)

---

### 3. **Framer Motion**
- Animate infographic reveals
- Smooth transitions between bug details
- Engaging user experience

```bash
pnpm add framer-motion
```

---

### 4. **Tailwind CSS Cards**
- Already have shadcn/ui Card component
- Create stat cards:
  - Size card
  - Habitat card
  - Diet card
  - Conservation status card
  - Fun fact card

---

## 🏗️ Recommended Architecture

### Flow:
1. **User captures bug photo** → Upload to IPFS (already done ✅)
2. **Send IPFS URL to `/api/identify-bug`**
   - Call OpenAI Vision API
   - Get species identification + basic info
3. **Enrich data from multiple sources:**
   - Wikipedia API → Summary and images
   - iNaturalist API → Taxonomy, conservation status, photos
   - GBIF API → Distribution data
4. **Generate infographic:**
   - Create structured data object
   - Render with Recharts + custom components
   - Show in modal or detail page
5. **Store enriched data:**
   - Save to upload record in `/api/uploads`
   - Include with NFT metadata when minting

---

## 💰 Cost Analysis

### OpenAI Vision API:
- **Input:** ~$0.01 per image (1024x1024)
- **Monthly estimate for hackathon:** $10-50 (1000-5000 identifications)
- **Production:** Could cache results to reduce costs

### Free APIs:
- Wikipedia ✅
- iNaturalist ✅
- GBIF ✅
- All data sources free

---

## 🚀 Implementation Priority

### Phase 1: Basic Identification (MVP)
1. Set up OpenAI Vision API
2. Create `/api/identify-bug` endpoint
3. Call after IPFS upload in `CameraModal`
4. Display results in simple card

### Phase 2: Rich Data
1. Add Wikipedia API integration
2. Add iNaturalist API integration
3. Combine data sources into unified response

### Phase 3: Infographics
1. Install Recharts
2. Create visualization components:
   - ThreatRadarChart
   - SizeComparison
   - HabitatMap
   - ConservationBadge
3. Build BugDetailsModal with all visualizations

### Phase 4: Polish
1. Add loading states
2. Error handling for failed identifications
3. Caching for common species
4. Allow users to correct wrong identifications

---

## 📝 Next Steps

### Immediate Actions:
1. **Get OpenAI API key** → Add to `.env.local`
2. **Create `/api/identify-bug/route.ts`**
3. **Test with existing bug photos in collection**
4. **Install Recharts:** `pnpm add recharts`
5. **Create `BugDetailsModal` component**

### Environment Variables Needed:
```env
OPENAI_API_KEY=sk-...
```

---

## 🔗 Useful Links

- [OpenAI Vision API Docs](https://platform.openai.com/docs/guides/vision)
- [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page)
- [iNaturalist API](https://api.inaturalist.org/v1/docs/)
- [GBIF API](https://www.gbif.org/developer/summary)
- [Recharts Documentation](https://recharts.org/en-US/)

---

## 💡 Creative Ideas

### Gamification:
- **Rarity Score:** Based on iNaturalist observation counts
- **Difficulty Badge:** How hard was it to photograph (based on behavior)
- **Regional Rarity:** Show if bug is rare in user's location

### Social Features:
- **Similar Bugs:** "Users also found..." (based on family/order)
- **Leaderboard:** Most rare bug captured
- **Achievements:** Capture bugs from different families

### Educational:
- **Bug of the Day:** Featured species with full infographic
- **Size Comparison:** Show bug next to common objects (coin, hand, etc.)
- **Life Cycle Visualization:** Egg → Larva → Pupa → Adult
- **Sound Clips:** If available (crickets, cicadas, etc.)

---

**Ready to implement! Let me know which phase you want to start with! 🐛🚀**
