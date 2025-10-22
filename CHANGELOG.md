# ArchiBuilder v2.0 Changelog

## Version 2.0.0 - Major Release

### Overview
ArchiBuilder v2.0 is a complete overhaul of the architecture modeling tool, transforming it into an enterprise-grade platform for Solution Architects in the Telco industry. This release adds multi-layer drill-down capabilities, Supabase database integration, enhanced validation, and comprehensive traceability features.

---

## Core Features

### 1. Supabase Database Integration
- **Full persistence layer** with PostgreSQL backend
- **7 core tables**: projects, canvases, nodes, edges, versions, comments, validation_issues
- **Row Level Security (RLS)** policies for data protection
- **Multi-user support** with authentication integration
- **Optimized indexes** for performance on JSONB and array fields

### 2. Multi-Layer Drill-Down Architecture
- **5-layer hierarchy**: L0 (Enterprise) → L1 (Capability) → L2 (Application) → L3 (Technology) → L4 (Runtime)
- **Parent-child canvas relationships** for decomposition
- **Breadcrumb navigation** for context awareness
- **Seamless navigation** between architecture layers
- Each node can reference a child canvas for deeper exploration

### 3. Enhanced Properties Panel
- **Schema-driven forms** with dynamic field rendering
- **Common fields**: id, name, description, owner, status, tags, domain
- **TOGAF fields**: phase, ADM level, governance tracking
- **eTOM fields**: process area, process code, level
- **SID entity chips**: Customer, Product, Service, Resource, Party, Location, Agreement, Order
- **Technical fields**: childCanvasId, dependencies, maturity, heatmap color
- **Status tracking**: Proposed, Approved, In Progress, Implemented, Deprecated

### 4. Relationship Types System
- **10 relationship types**:
  - `realizes` - Logical realization of capabilities
  - `serves` - Service provision relationship
  - `uses` - Usage dependency
  - `hosts` - Hosting/deployment relationship
  - `reads` - Data read access
  - `writes` - Data write access
  - `depends-on` - Generic dependency
  - `composes` - Composition relationship
  - `aggregates` - Aggregation relationship
  - `flows-to` - Process or data flow
- **Semantic validation** based on relationship types
- **Traceability** through relationship chains

### 5. Advanced Validation Rules
- **Orphan detection**: Identifies unconnected nodes
- **Process-Service mapping**: Ensures processes have ≥1 Service/API
- **Capability realization**: Validates capabilities realized by ≥1 Application
- **PII compliance**: Data nodes with PII must define retention & classification
- **Framework completeness**: Checks TOGAF/eTOM/SID alignment
- **Phase consistency**: Validates cross-phase connections
- **Governance scoring**: Calculates completeness percentage

### 6. Visualization & Heatmap
- **5 heatmap modes**:
  - None (default colors)
  - TOGAF Phase (color by ADM phase)
  - eTOM Area (color by process area)
  - Owner (color by team/owner)
  - Status (color by implementation status)
- **Interactive legend** showing color mappings
- **Filter controls** for status and ownership
- **Real-time visual feedback** on selection

### 7. Matrix & Traceability Views
- **3 matrix types**:
  - Capability ↔ Application Matrix
  - eTOM Process ↔ Service/API Matrix
  - Application ↔ Data Matrix
- **Visual indicators**: Check marks for relationships, dashes for gaps
- **Relationship type labels** in cells
- **Owner and phase badges** for context
- **Traceability panel** showing:
  - Upstream dependencies (who depends on this)
  - Downstream dependencies (what this depends on)
  - Dependency count summary
  - Navigable links to related nodes

### 8. Enhanced Import/Export
- **JSON export** with full schema
- **PNG export** for presentations
- **SVG export** for vector graphics
- **ArchiMate export** for tool interoperability
- **Import from JSON** with validation
- **Version control** support through snapshots

---

## Database Schema

### Projects Table
Stores top-level architecture projects with owner, metadata, and timestamps.

### Canvases Table
Represents diagram layers with parent-child relationships for drill-down, viewport state, and layer type classification.

### Nodes Table
Complete node data including:
- Position, size, shape, color, icon
- TOGAF phase, eTOM area, SID entities
- Owner, status, tags, domain
- Child canvas reference for drill-down
- Custom properties (JSONB)
- Container and parent relationships

### Edges Table
Connection data including:
- Source and target node references
- Relationship type (realizes, serves, uses, etc.)
- Edge styling (type, color, width, dash pattern)
- Custom properties (latency, bandwidth, protocol)

### Versions Table
Snapshot-based versioning for rollback and history.

### Comments Table
Collaborative annotations on nodes and canvases with resolution tracking.

### Validation Issues Table
Stores validation findings with categorization and resolution status.

---

## Architecture Layers

### L0: Enterprise Overview
- TOGAF ADM phases as containers
- Strategic domains and initiatives
- High-level capability map

### L1: Capability & eTOM Process Landscape
- Business capabilities decomposition
- eTOM L1/L2 process areas
- Service blueprints

### L2: Application & Data Architecture
- Application components and services
- Data entities and flows
- Integration patterns

### L3: Technology Implementation
- Infrastructure components
- Technology stacks
- Deployment topology

### L4: Runtime / CI-CD / Ops
- Runtime environments
- CI/CD pipelines
- Monitoring and operations

---

## UI/UX Improvements

### Breadcrumb Navigation
- Shows full hierarchy from root to current canvas
- Layer level indicators (L0, L1, L2, etc.)
- One-click navigation to any parent level
- Visual distinction for current location

### Visualization Controls
- Floating control panel for easy access
- Heatmap mode selector with preview
- Filter controls for focused views
- Color legend for active modes

### Properties Panel
- Collapsible sections for organization
- SID entity chip selector
- Status dropdown with color coding
- Drill-down button when child canvas exists
- Tag input with comma separation

### Toolbar Enhancements
- Version indicator (v2.0)
- Export format options
- Validation button with visual feedback
- Connection mode toggles

---

## Validation Categories

### Error Level
- Process without Service/API connection
- Capability without Application realization
- PII data without retention policy
- PII data without classification

### Warning Level
- Orphan nodes (unconnected)
- Missing framework properties
- Incomplete documentation

### Info Level
- Unlabeled edges
- Missing optional fields

---

## New Constants & Types

### Relationship Types
Full set of semantic relationship types for enterprise architecture modeling.

### Node Status
Five-stage lifecycle: Proposed → Approved → In Progress → Implemented → Deprecated

### Layer Types
Five-layer classification matching industry best practices.

---

## Technical Stack

### Frontend
- **Next.js 13** with App Router
- **React 18** with hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

### Backend
- **Supabase** for database and auth
- **PostgreSQL** for data storage
- **Row Level Security** for access control

### State Management
- Custom hooks for canvas operations
- Local state with React useState
- Optimistic updates for responsiveness

---

## Migration Notes

### From v1.0 to v2.0
1. **Database Setup**: Supabase instance required
2. **Data Migration**: Export v1.0 diagrams as JSON, import into v2.0
3. **Environment Variables**: Add Supabase credentials to .env
4. **Schema Updates**: Node and edge properties expanded
5. **Breaking Changes**: Some field names changed (see mapping below)

### Field Mapping
- `props.notes` → `props.description`
- `framework.togaf` → `framework.togafPhase`
- `style.borderColor` → merged into `style.color`

---

## Performance Optimizations

- **Indexed queries** on foreign keys
- **GIN indexes** for JSONB searches
- **Efficient edge anchoring** algorithm
- **Optimistic rendering** during drag operations
- **Lazy loading** for large diagrams
- **Debounced auto-save** to reduce database calls

---

## Security Features

- **Row Level Security** on all tables
- **User ownership** validation
- **Secure API calls** with JWT tokens
- **XSS protection** in user inputs
- **SQL injection prevention** via parameterized queries

---

## Future Enhancements (Roadmap)

### v2.1 (Q1 2025)
- [ ] Real-time collaboration with WebSockets
- [ ] Version comparison and diff view
- [ ] Template library with eTOM/SID pre-built models
- [ ] Auto-layout algorithms (hierarchical, force-directed)
- [ ] Comment threads and mentions

### v2.2 (Q2 2025)
- [ ] Role-Based Access Control (Architect/Viewer/Contributor)
- [ ] Report generation (PDF, Word, PowerPoint)
- [ ] Impact analysis for change management
- [ ] Compliance dashboards
- [ ] API for programmatic access

### v2.3 (Q3 2025)
- [ ] AI-powered diagram suggestions
- [ ] Automated validation rules engine
- [ ] Integration with JIRA/ServiceNow
- [ ] Mobile-responsive editor
- [ ] Offline mode with sync

---

## Known Issues

1. **PDF Export**: Currently shows alert; requires additional library
2. **Large Diagrams**: Performance degrades beyond 500 nodes
3. **Undo/Redo**: Not yet implemented for database-backed operations
4. **Concurrent Editing**: No conflict resolution for simultaneous edits

---

## Credits

Built with modern web technologies and industry-standard frameworks. Special thanks to the open-source community for the excellent libraries that made this possible.

---

## Support

For issues, feature requests, or questions:
- GitHub Issues: [repository-url]
- Email: support@archibuilder.dev
- Docs: https://docs.archibuilder.dev

---

**Version**: 2.0.0
**Release Date**: October 2025
**License**: Proprietary
