# ArchiBuilder v2.1 - Layer-Aware Architecture Modeling

## Release Date: October 2025

---

## Overview

ArchiBuilder v2.1 introduces **layer-aware modeling** with intelligent context switching across the 5-layer architecture stack (L0-L4). The palette, breadcrumbs, validation, and recommendations now dynamically adapt to the current layer, ensuring architects work with the right elements at the right abstraction level.

This release focuses on **UX refinement** and **framework alignment**, making it easier to maintain consistency with TOGAF ADM, TM Forum eTOM, and SID standards throughout your architecture journey.

---

## 🎯 Key Features

### 1. Layer Selector in Toolbar

**New component**: Top toolbar now features a prominent layer selector dropdown

**Features**:
- Visual layer indicators with icons and colors
- L0 (Enterprise) → L1 (Capability) → L2 (Application) → L3 (Technology) → L4 (Runtime)
- Shows layer description and framework alignment
- TOGAF phase and eTOM area badges for context
- Quick switching between architecture layers

**Benefits**:
- Always visible context indicator
- No more accidentally adding wrong node types
- Clear framework alignment at a glance
- Professional, enterprise-grade interface

### 2. Dynamic Palette Filtering

**Intelligence**: Palette automatically filters based on current layer

**Layer-specific filtering**:
- **L0 (Enterprise)**: Phase, Swimlane, Capability, Group, Note
- **L1 (Capability)**: Capability, Process, Process Area, Swimlane, Group, Note
- **L2 (Application)**: App, Data, Group, Swimlane, Note
- **L3 (Technology)**: Tech, Data, Group, Swimlane, Note
- **L4 (Runtime)**: Tech, Process, Group, Swimlane, Note

**Visual indicators**:
- Node count badges show available types
- Recommendations displayed at top of palette
- Empty state messages for unavailable types
- Layer badge showing current context

**Smart behavior**:
- Prevents adding inappropriate node types
- Reduces cognitive load with focused choices
- Guides users to correct modeling patterns
- Maintains clean, professional diagrams

### 3. Enhanced Breadcrumb Navigation

**Upgraded design**: Breadcrumbs now show rich layer context

**New elements**:
- Layer icons with color-coded backgrounds
- Layer badges (L0, L1, L2, L3, L4)
- Visual hierarchy with improved spacing
- Better contrast and readability

**Interaction**:
- One-click navigation to any parent level
- Hover states for better feedback
- Current location highlighted
- Empty state handling

**Benefits**:
- Never lose your place in the hierarchy
- Quick navigation between layers
- Clear visual separation of concerns
- Professional appearance

### 4. Layer Recommendations Panel

**New component**: `LayerRecommendations`

**Displays**:
- Layer-specific modeling guidelines
- Framework alignment (TOGAF + eTOM)
- Recommended node types for the layer
- Types to avoid at this layer
- Best practices and tips

**Use cases**:
- Onboarding new team members
- Quick reference during modeling
- Ensuring standard compliance
- Learning layer-specific patterns

### 5. Layer Transition Dialog

**New component**: `LayerTransitionDialog`

**Features**:
- Shows source and target layer details
- Explains what changes when switching
- Displays allowed node types for new layer
- Framework alignment changes
- Confirmation workflow

**Benefits**:
- Smooth transitions between layers
- Clear expectations before switching
- Prevents confusion during navigation
- Educational for users

### 6. Layer-Aware Validation

**Enhanced validation**: Rules now consider current layer context

**New validations**:
- Warns when node types don't match current layer
- Suggests appropriate layer for misplaced nodes
- Maintains existing validation rules
- Provides layer-specific compliance scoring

**Validation categories**:
- Layer compliance warnings
- Framework alignment checks
- Node type appropriateness
- Architecture layer best practices

---

## 🏗️ Layer Definitions

### L0: Enterprise Overview
- **Focus**: Strategic view with TOGAF phases and domains
- **Node Types**: Phase, Swimlane, Capability, Group, Note
- **TOGAF Alignment**: Preliminary, A, B
- **eTOM Alignment**: Strategy
- **Use Cases**: Executive dashboards, strategic planning, roadmaps

### L1: Capability & Process
- **Focus**: Business capabilities and eTOM process landscape
- **Node Types**: Capability, Process, Process Area, Swimlane, Group, Note
- **TOGAF Alignment**: B, C
- **eTOM Alignment**: Operations, Fulfillment, Assurance, Billing
- **Use Cases**: Business capability maps, process flows, value streams

### L2: Application & Data
- **Focus**: Application components, services, and data architecture
- **Node Types**: App, Data, Group, Swimlane, Note
- **TOGAF Alignment**: C, D
- **eTOM Alignment**: Operations
- **Use Cases**: Application portfolios, integration architecture, data flows

### L3: Technology & Infrastructure
- **Focus**: Technology stack, infrastructure, and deployment
- **Node Types**: Tech, Data, Group, Swimlane, Note
- **TOGAF Alignment**: D, E
- **eTOM Alignment**: -
- **Use Cases**: Infrastructure diagrams, deployment topology, tech stacks

### L4: Runtime & Operations
- **Focus**: Runtime environments, CI/CD, monitoring, operations
- **Node Types**: Tech, Process, Group, Swimlane, Note
- **TOGAF Alignment**: G, H
- **eTOM Alignment**: Operations
- **Use Cases**: CI/CD pipelines, monitoring setup, operational processes

---

## 🎨 UX Improvements

### Visual Consistency
- Layer colors consistently applied throughout UI
- Icons match layer semantics
- Improved contrast ratios for accessibility
- Professional color palette

### Reduced Cognitive Load
- Only show relevant options at each layer
- Clear visual hierarchy
- Contextual help and recommendations
- Progressive disclosure of complexity

### Better Navigation
- Enhanced breadcrumbs with rich context
- Always-visible layer indicator
- Quick layer switching
- Clear current location

### Professional Polish
- Refined spacing and alignment
- Smooth transitions and animations
- Consistent badge styling
- Enterprise-grade appearance

---

## 🔧 Technical Changes

### New Files
- `lib/constants/layers.ts` - Layer definitions and utilities
- `components/editor/LayerSelector.tsx` - Toolbar layer dropdown
- `components/editor/LayerRecommendations.tsx` - Recommendations panel
- `components/editor/LayerTransitionDialog.tsx` - Transition helper

### Modified Files
- `components/editor/Toolbar.tsx` - Added layer selector
- `components/editor/Palette.tsx` - Dynamic filtering by layer
- `components/editor/Breadcrumbs.tsx` - Rich layer context
- `lib/validation/governance.ts` - Layer-aware validation

### API Changes
- `Toolbar` now accepts `currentLayer` and `onLayerChange` props
- `Palette` now accepts `currentLayer` prop for filtering
- `validateDiagram()` now accepts optional `currentLayer` parameter

### New Utilities
- `getLayerDefinition(level)` - Get layer configuration
- `getLayerForNodeType(type)` - Find suitable layers for node type
- `isNodeTypeAllowedInLayer(type, level)` - Check layer compatibility
- `getRecommendedNodesForLayer(level)` - Get recommended node types

---

## 📊 Framework Alignment

### TOGAF ADM Mapping
- **L0**: Preliminary, Architecture Vision (A), Business Architecture (B)
- **L1**: Business Architecture (B), Information Systems (C)
- **L2**: Information Systems (C), Technology Architecture (D)
- **L3**: Technology Architecture (D), Opportunities & Solutions (E)
- **L4**: Implementation Governance (G), Change Management (H)

### TM Forum eTOM Mapping
- **L0**: Strategy, Infrastructure & Product
- **L1**: Operations, Fulfillment, Assurance, Billing
- **L2**: Operations (application services)
- **L3**: Infrastructure management
- **L4**: Operations (DevOps/ITIL)

### SID Entity Recommendations
- **L0/L1**: Customer, Product, Service (business view)
- **L2**: Service, Resource, Party (logical view)
- **L3**: Resource, Location (physical view)
- **L4**: All entities for operational monitoring

---

## 🚀 Benefits

### For Architects
- **Faster modeling**: Only see relevant options
- **Better compliance**: Layer-aware validation guides best practices
- **Less errors**: Prevents adding wrong node types
- **Clear context**: Always know where you are in the stack

### For Teams
- **Consistency**: All team members follow same patterns
- **Standards**: Built-in TOGAF + eTOM alignment
- **Onboarding**: New members learn correct patterns
- **Collaboration**: Shared understanding of layers

### For Organizations
- **Quality**: Higher quality architecture artifacts
- **Compliance**: Built-in framework alignment
- **Efficiency**: Faster diagram creation
- **Maintenance**: Easier to understand and update diagrams

---

## 🔄 Migration from v2.0

### Automatic
- Existing diagrams work without changes
- Layer detection based on node types
- Backward compatible

### Recommended Actions
1. Review existing diagrams for layer appropriateness
2. Use layer selector to organize diagrams by abstraction level
3. Split large diagrams into multiple layers using drill-down
4. Apply layer-specific validation to existing work

### Breaking Changes
- None - v2.1 is fully backward compatible with v2.0

---

## 📖 Usage Examples

### Switching Layers
```typescript
// In your editor component
const [currentLayer, setCurrentLayer] = useState(0);

<Toolbar
  currentLayer={currentLayer}
  onLayerChange={setCurrentLayer}
  // ... other props
/>

<Palette
  currentLayer={currentLayer}
  // ... other props
/>
```

### Validation with Layer Context
```typescript
import { validateDiagram } from '@/lib/validation/governance';

const report = validateDiagram(diagramSchema, currentLayer);
// Now includes layer-specific compliance warnings
```

### Checking Layer Compatibility
```typescript
import { isNodeTypeAllowedInLayer } from '@/lib/constants/layers';

const canAddApp = isNodeTypeAllowedInLayer('app', 2); // true for L2
const canAddPhase = isNodeTypeAllowedInLayer('phase', 2); // false for L2
```

---

## 🐛 Bug Fixes

- Fixed breadcrumb navigation with empty canvas
- Improved palette scrolling on small screens
- Fixed layer color consistency across components
- Resolved type issues with readonly arrays

---

## ⚡ Performance

- Optimized palette filtering algorithm
- Reduced unnecessary re-renders in breadcrumbs
- Lazy loading of layer recommendations
- Efficient layer definition lookups

---

## 🎓 Learning Resources

### Documentation
- Layer-specific modeling guidelines
- TOGAF-eTOM-SID alignment matrices
- Best practices per layer
- Example architectures

### In-App Help
- Contextual recommendations in palette
- Layer transition dialog explanations
- Validation messages with guidance
- Tooltip hints on layer selector

---

## 🔮 Future Enhancements (v2.2 Roadmap)

- [ ] Auto-suggest layer based on node composition
- [ ] Layer-specific templates and starters
- [ ] Cross-layer impact analysis
- [ ] Layer promotion/demotion wizards
- [ ] Layer coverage metrics and heatmaps
- [ ] Export layer-filtered views
- [ ] Layer-specific color schemes

---

## 📈 Metrics

- **5 layers** fully defined and documented
- **40+ node type rules** across all layers
- **15+ validation rules** for layer compliance
- **100% backward** compatible with v2.0
- **0 breaking changes** for existing users

---

## 🙏 Credits

Built with attention to enterprise architecture best practices and industry standards. Special thanks to the TOGAF and TM Forum communities for their frameworks.

---

## 📞 Support

For questions about layer-specific modeling:
- Documentation: https://docs.archibuilder.dev/layers
- Email: support@archibuilder.dev
- GitHub Issues: [repository-url]

---

**Version**: 2.1.0
**Release Date**: October 2025
**Status**: Production Ready
**License**: Proprietary
