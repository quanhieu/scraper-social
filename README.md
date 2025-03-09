## Objective

Test the ability to build a data collection system, analyze Social Media Trends, and integrate APIs to evaluate content performance on YouTube & TikTok.

## Requirements

### 1. Build a Social Listening system to track the performance of an Affiliate Program based on the website link provided.

# Technology Stack

- **Node.js, Next.js, MongoDB**
- **LLM:** Gemini, ChatGPT

## DevOps

- **Amazon Web Services:** EC2 2vCPU, 4GB RAM, 20GB SSD
- **Google Cloud API**
- **Docker**

# Features

### Search text
- Search for videos related to keywords

### Trace TikTok videos
- Trace YouTube videos
- For YouTube and TikTok, extract video metadata and use LLM to filter and optimize search results

### Trace websites
- Crawl website data and process it through LLM to clean the data before searching for related videos

## Search Optimization
- Currently, each search retrieves around **50 videos** to save costs.
- Once the project scales, more videos can be retrieved, and filters will be optimized to sort videos by **region, hashtags, etc.**

# Unimplemented Features

### LLM does not support real-time data search yet  
**Reason:**  
- The provider has restricted the search function in the model.  
- Data must be crawled first before being processed by LLM.

### Unable to retrieve the list of TikTok videos  
**Reasons:**  
- Currently, only **one** TikTok video can be searched using an **exact URL**.  
- In the future, the system may support searching **multiple videos**, but this is not implemented yet due to resource limitations (e.g., registering a domain with TikTok Developer, integrating third-party scrapers for TikTok data, etc.).  
- Need to **build a dedicated crawler** for extracting TikTok data.

# Optimizations

- **Network-layer caching**
- **LLM communication caching** to reduce token usage
- **Building a local LLM** to reduce costs
- **Developing an AI-integrated crawler system** for data extraction
- **Continuing to integrate local LLM + crawler**
- **Implementing a worker system and Residential VPN** for efficient crawling
- **Building a centralized ETL data center**
- **Developing a Retrieval-Augmented Generation (RAG) system**
- **Preventing users from abusing the search feature** to query unrelated content via LLM
- **Optimizing the YouTube/TikTok video crawling process**
- **Convert videos to text** and use LLM to extract relevant information for more accurate data filtering
