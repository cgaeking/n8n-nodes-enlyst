# 🚀 n8n-nodes-enlyst

**[🇬🇧 English](README.md)** | **[🇩🇪 Deutsch](README.de.md)**

**Official n8n integration for Enlyst** - the AI-powered lead enrichment platform.

[![npm version](https://badge.fury.io/js/n8n-nodes-enlyst.svg)](https://badge.fury.io/js/n8n-nodes-enlyst)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Enlyst](https://enlyst.app) is an AI-powered lead enrichment platform that transforms simple company lists into complete lead profiles with executive data, email addresses, and personalized messages.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## 📦 Included Nodes

### **1. Enlyst Node** - API Operations

**Project Actions:**
- Create or Update Project
- Delete Project
- Get Project by ID
- Get Project by Name
- Get Many Projects
- Prepare Project (webhook setup)

**Lead Actions:**
- Get Leads (with pagination and multi-status filtering)
- Enrich Leads (all, filtered, or single rows)
- Find Leads (Google Maps search with geocoding)
- Add Leads (import from external sources)



## Installation

### Option 1: Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in n8n
2. Click **Install a community node**
3. Enter: `n8n-nodes-enlyst`
4. Click **Install**

### Option 2: NPM Installation

```bash
npm install n8n-nodes-enlyst
```

## 📋 Available Operations

### 🗂️ Project Actions

#### **Create or Update Project**

Creates a new project or updates an existing project by name.

**Important:** This function also includes the webhook setup functionality of "Prepare Project". You can configure webhooks directly when creating or updating.

**Usage:**

- Create new project with name, description and language
- Find existing project (by name) and update it
- Enable/disable Pitchlane integration
- Define custom prompts for AI enrichment
- Set target language for enrichment (Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português)

**Inputs:**

- `name` (required): Project name
- `description`: Project description
- `pitchlaneIntegration`: Enable Pitchlane video integration
- `customPrompt1/2`: Custom AI prompts
- `targetLanguage`: Target language for enrichment (default: German)

---

#### **Delete Project**

Permanently deletes an existing project.

**Usage:**

- Remove project permanently
- All associated leads will also be deleted

**Inputs:**

- `projectId` (required): ID of the project to delete

---

#### **Get Project by ID**

Retrieves a specific project by its ID.

**Usage:**

- Retrieve project details
- Check project configuration
- Get base URL for other operations

**Inputs:**

- `projectId` (required): Project ID

**Output:** Complete project information including name, description, settings, creation date

---

#### **Get Project by Name**

Retrieves a project by name (first match if multiple projects exist).

**Usage:**

- Determine project ID by name
- Useful when only the name is known

**Inputs:**

- `projectName` (required): Project name

**Output:** Project details of the first found project with this name

---

#### **Get Many Projects**

Lists all available projects.

**Usage:**

- Get overview of all projects
- Collect project IDs for further operations
- Project selection in workflows

**Output:** Array of all projects with complete details

---

#### **Prepare Project**

Sets up webhooks for an existing project. This is a **prerequisite** for using "Wait for Completion" with "Enrich Leads".

**Usage:**

- Set webhook URL for enrichment notifications
- Enable automatic notification when batch enrichment is complete
- Required for asynchronous workflows with enrichment trigger

**Inputs:**

- `projectId` (required): ID of the project to prepare

**Automatic Actions:**

- Enables "General Webhooks" for the project
- Sets `enrichmentWebhookUrl` to the n8n webhook URL: `{baseUrl}/webhooks/n8n/{projectId}`

**Note:** This is a simplified alternative to manual webhook configuration via "Create or Update Project".

---

### 👥 Lead Actions

#### **Get Leads**

Retrieves lead data from a project with pagination and advanced filtering options.

**Usage:**

- Retrieve lead data from a project
- Export only leads with specific statuses
- Process large amounts of data with pagination

**Inputs:**

- `projectId` (required): Project ID
- `page`: Page number (0 = all leads)
- `limit`: Max number of results per page (default: 50)
- `status`: Multi-select filter by status (Completed, Empty/Null Status, Failed, Pending, Processing, Stopped)

**Output:** Array of lead objects including all enrichment data (name, email, message, custom data, Google Maps data, etc.)

---

#### **Enrich Leads**

Starts AI-powered enrichment of leads (single or batch).

**Usage:**

- Enrich single leads
- Enrich all leads in a project
- Enrich filtered leads (by status)
- Enrich specific rows

**Inputs:**

- `projectId` (required): Project ID
- `enrichmentType`:
  - `all`: Enrich all leads
  - `filtered`: Only leads with specific statuses
  - `singleRow`: Single row (Row ID)
- `status` (for filtered): Multi-select filter by status
- `rowId` (for singleRow): ID of the row to enrich
- `waitForCompletion`: Wait for completion (batch enrichment only)
  - **Prerequisite:** Project must be prepared with "Prepare Project"!

**Enrichment Process:**

1. Lead is analyzed by AI
2. Executive information is searched
3. Email address is determined (via AnyMailFinder)
4. Personalized message is generated
5. Status is set to "Completed"

**Note:** With `waitForCompletion: true`, the node waits until all leads are finished.

---

#### **Find Leads**

Searches for leads via Google Maps and optionally adds them directly to a project.

**Usage:**

- Find leads in a specific region
- Google Maps search with keyword and location
- Automatically adopt external data (address, phone, ratings)
- Optional: Import directly into project

**Inputs:**

- `searchKeyword`: Search term (e.g., "Restaurant", "Dentist", "Craftsman")
- `location`: Location (city name, address or GPS coordinates)
- `language`: Language for search results (default: German)
- `projectId` (optional): Project ID for direct import
- `country`: Country code for geocoding (default: Germany)

**Output:** Array of found leads including complete Google Maps data:

- `googleMaps_place_id`: Unique Place ID
- `googleMaps_name`: Company name
- `googleMaps_address`: Full address
- `googleMaps_phone`: Phone number
- `googleMaps_website`: Website URL
- `googleMaps_rating`: Rating (1-5 stars)
- `googleMaps_reviews`: Number of reviews
- `googleMaps_types`: Categories (e.g., "restaurant", "cafe")
- `googleMaps_lat/lng`: GPS coordinates

---

#### **Add Leads**

Imports leads from external sources into a project.

**Usage:**

- Adopt leads from other APIs
- Import existing lead data
- Bring custom data from external systems
- Integration with CRM systems

**Inputs:**

- `projectId` (required): Target project ID
- `leads`: Array of lead objects

**Lead Object Structure:**

```javascript
{
  companyName: "Example Company Inc.",  // required
  website: "https://example.com",        // optional
  externalData: {                        // optional - any fields
    source: "CRM-System",
    contactPerson: "John Doe",
    customField1: "Value"
  }
}
```

**Output:** Confirmation with number of imported leads

**Note:** All fields in `externalData` are stored as `googleMaps_*` fields and included in CSV exports.

## Credentials

## Credentials

You need Enlyst API credentials:

1. **Base URL**: Your Enlyst instance URL (default: `https://enlyst.app/api`)
2. **API Key**: Your Enlyst API key

### Get API Key

1. Sign in to [Enlyst](https://enlyst.app)
2. Go to **Settings > API Keys**
3. Create a new API key
4. Copy the key (shown only once!)

## Compatibility

Tested with n8n version 1.0+ and Node.js 18+

## Usage

### Example Workflows

- **Lead Search & CRM Integration**: Create or Update Project → Find Leads → Enrich Leads → Add Leads to CRM
- **Prepare Project & Enrichment**: Get Project by Name → Prepare Project → Add Leads → Enrich Leads
- **Google Sheets Integration**: Create or Update Project → Add Leads → Enrich Leads → Add Leads to Google Sheet
- **Slack Notification**: On Enrichment Completed → Slack Message

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Enlyst Website](https://enlyst.app)
- [GitHub Repository](https://github.com/cgaeking/n8n-nodes-enlyst)

## Version History

### v0.6.1 (Latest)

> 8 November 2025

**Documentation:**

- Fixed: Removed all remaining German text from English README
- Fixed: Removed duplicate node descriptions
- Improved: Clean, fully translated English documentation

### v0.6.0

> 8 November 2025

**Documentation:**

- Added: English documentation as primary language for n8n community standards compliance
- Added: German translation (README.de.md) with language switcher
- Improved: Professional multilingual documentation structure

### v0.5.6

> 8 November 2025

**Documentation:**

- Fixed: Example workflows now match actual node operations with realistic use cases

### v0.5.5

> 8 November 2025

**Documentation:**

- Removed: Non-functional docs.enlyst.app link from Resources section

### v0.5.4

> 8 November 2025

**Documentation:**

- Improved: Complete node documentation with detailed descriptions for all operations
- Improved: Renamed "Prepare project with webhook" to "Prepare project" for clarity
- Added: Comprehensive usage examples and parameter explanations
- Added: Clear prerequisites and workflow guidance

### v0.5.3

> 8 November 2025

**Bug Fixes:**

- Fixed: Added documentationUrl property to fix 404 errors when clicking docs link in n8n UI
- Fixed: Links now properly direct to GitHub README instead of placeholder URL

### v0.5.2

> 8 November 2025

**New Features:**

- Added: Prepare Project operation - Setup webhook for existing project without modifying other settings
- Enhanced: API now supports partial updates (optional name parameter)

### v0.5.1

> 8 November 2025

**Bug Fixes:**

- Fixed: setTimeout restriction - replaced with compliant async pattern
- Fixed: Status options now alphabetically sorted
- Fixed: Language options now alphabetically sorted
- Fixed: Removed superfluous required: false properties

### v0.5.0

> 8 November 2025

**Breaking Changes:**

- Removed: Referral resource and Get Stats operation (referral statistics feature removed)

**New Features:**

- Added: Find Leads operation - Search for leads via Google Maps
  - Search by location name OR GPS coordinates
  - Automatic geocoding via OpenStreetMap Nominatim API
  - Optional project assignment (can be used standalone)
  - All external data (address, phone, ratings, etc.) fully preserved
- Added: Add Leads operation - Import leads from external sources
- Added: Multi-Status Filter - Filter by multiple statuses simultaneously
- Added: External Data Support - All Google Maps data stored as `googleMaps_*` fields

**Improvements:**

- External data displayed in expandable table rows (Frontend)
- CSV export automatically includes all external fields
- Better handling of nested objects (JSON string conversion)

### v0.4.14

> 7 November 2025

- Added: Multi-select status filter for project data retrieval
- Improved: Better filtering options for project data queries

### v0.2.0

- Added: Webhook automation capabilities
- Added: API-Key authentication
- Added: Project filter options

### v0.1.0

- Added: Enlyst Node with full API integration
- Added: Project and Lead operations
- Added: CSV upload/download functionality
- Added: Batch enrichment features
