# HazardTrack Design System Documentation

## Technology Stack

### Mobile Applications (Resident & BFP)
- **Framework**: React Native with Expo
- **UI Library**: Tamagui
- **Target Platform**: iOS and Android mobile devices

### Web Application (Admin)
- **Framework**: React
- **Styling**: Tailwind CSS v4
- **Target Platform**: Desktop web browsers

---

## Color Palette

### Primary Colors
- **Fire Red**: `#D32F2F` - Primary brand color, emergency actions
- **Dark Gray**: `#212121` - Secondary color, text, headers
- **Warning Yellow**: `#FBC02D` - Accent color, warnings, highlights

### Status Colors
- **Success Green**: `#2E7D32` - Resolved status, success messages
- **Warning Orange**: `#F57C00` - Pending status, warnings
- **Info Blue**: `#1976D2` - Verified status, informational messages
- **Destructive Red**: `#D32F2F` - High priority, errors

### Neutral Colors
- **Background**: `#fafafa` (light) / `#212121` (dark)
- **Card Background**: `#ffffff` (light) / `#212121` (dark)
- **Muted**: `#f5f5f5` - Secondary backgrounds
- **Muted Foreground**: `#757575` - Secondary text
- **Border**: `rgba(33, 33, 33, 0.12)` - Dividers, borders

---

## Design Components & Patterns

### 1. **Loading States**

#### Skeleton Loaders
- **Component**: `SkeletonLoaders.tsx`
- **Types**:
  - `DashboardCardSkeleton` - Dashboard stat cards
  - `ReportCardSkeleton` - Hazard report cards
  - `TableSkeleton` - Data tables
  - `ProfileSkeleton` - User profile screens
  - `FormSkeleton` - Form interfaces
  - `ChartSkeleton` - Analytics charts
  - `MapSkeleton` - Map views
  - `ListItemSkeleton` - List items

- **Animation**: Shimmer effect (2s infinite)
- **Usage**: Display during data loading to improve perceived performance

### 2. **Animation Patterns**

#### CSS Animations
- **slideInUp**: Elements fade in from bottom (20px translate)
- **slideInRight**: Elements fade in from left (20px translate)
- **fadeIn**: Simple opacity transition
- **pulse-glow**: Pulsing glow effect for emergency buttons
- **shimmer**: Skeleton loading animation

#### React/Motion Animations
- **Stagger animations**: Sequential element appearances with delays
- **Hover effects**: Scale, translate, and shadow transitions
- **Page transitions**: Smooth route changes

### 3. **Notification System**

#### Real-time Notifications
- **Component**: `NotificationSystem.tsx`
- **Features**:
  - Toast notifications for incoming reports
  - Priority-based styling (High/Medium/Low)
  - Sound alerts (optional)
  - Auto-dismiss with countdown
  - Action buttons (View Report)
  - Notification queue management

#### Notification Types
- **New Report**: Incoming hazard reports
- **Status Update**: Report status changes
- **Assignment**: Task assignments
- **System Alert**: Important system messages

### 4. **Card Components**

#### Status Cards
- **Priority Badges**: High (Red), Medium (Yellow), Low (Green)
- **Status Badges**: Pending, Verified, In-Progress, Resolved
- **Hover Effects**: `card-hover-lift` - 4px translate with shadow

#### Report Cards
- **Elements**: Icon, title, location, status, timestamp
- **Layout**: Responsive grid (1-3 columns)
- **Interactions**: Click to view details, hover lift effect

#### Dashboard Cards
- **Stat Cards**: KPI displays with icons and numbers
- **Chart Cards**: Data visualizations
- **Action Cards**: Quick access buttons

### 5. **Form Elements**

#### Input Components
- **Text Input**: Standard text fields
- **Email Input**: Email validation
- **Phone Input**: Phone number formatting
- **Textarea**: Multi-line text
- **File Upload**: Photo evidence upload
- **Date Picker**: Calendar-based date selection

#### Selection Components
- **Select Dropdown**: Single selection
- **Radio Group**: Mutually exclusive options
- **Checkbox**: Multiple selections
- **Switch**: Toggle states

#### Form Patterns
- **Validation**: Real-time field validation
- **Error States**: Red border and error message
- **Required Fields**: Asterisk indicators
- **Disabled State**: Reduced opacity

### 6. **Navigation Patterns**

#### Mobile Navigation (Resident & BFP)
- **Tab Bar**: Bottom navigation with icons
- **Header Bar**: Top bar with title and actions
- **Drawer**: Slide-in side menu
- **Modal**: Full-screen or centered overlays

#### Web Navigation (Admin)
- **Sidebar**: Fixed left sidebar with sections
- **Breadcrumbs**: Navigation path indicators
- **Top Bar**: Global actions and profile menu

### 7. **Data Display**

#### Tables
- **Responsive Tables**: Horizontal scroll on mobile
- **Sortable Columns**: Click headers to sort
- **Row Actions**: Edit, delete, view buttons
- **Pagination**: Page navigation controls
- **Search & Filter**: Real-time filtering

#### Lists
- **Infinite Scroll**: Load more on scroll
- **Pull to Refresh**: Swipe down to reload
- **Empty States**: "No data" messages with illustrations
- **Loading States**: Skeleton loaders

#### Charts & Graphs
- **Bar Charts**: Comparison data
- **Line Charts**: Trends over time
- **Pie Charts**: Distribution data
- **Area Charts**: Cumulative data
- **Library**: Recharts

### 8. **Modal & Dialog Patterns**

#### Dialog Types
- **Alert Dialog**: Confirmation prompts
- **Form Dialog**: Input collection
- **Info Dialog**: Information display
- **Full-screen Modal**: Detailed views

#### Dialog Features
- **Overlay**: Semi-transparent backdrop
- **Focus Trap**: Keyboard navigation
- **ESC to Close**: Keyboard accessibility
- **Click Outside**: Close on backdrop click

### 9. **Button Styles**

#### Button Variants
- **Primary**: Fire red background, white text
- **Secondary**: Dark gray background, white text
- **Ghost**: Transparent with hover effect
- **Outline**: Border only with hover fill
- **Destructive**: Red for dangerous actions

#### Button Sizes
- **Small**: Compact padding
- **Default**: Standard size
- **Large**: Prominent actions
- **Icon**: Square icon-only buttons

#### Special Buttons
- **Emergency Button**: `emergency-glow` class with pulsing shadow
- **Floating Action Button (FAB)**: Fixed position, circular

### 10. **Status Indicators**

#### Badge Components
- **Status Badges**: Pending, Verified, In-Progress, Resolved
- **Priority Badges**: High, Medium, Low
- **Count Badges**: Notification counters
- **Role Badges**: User type indicators

#### Visual Indicators
- **Progress Bars**: Task completion
- **Dot Indicators**: Online/offline status
- **Icons**: Lucide React icon library

### 11. **Map Integration**

#### Map Features
- **GPS Tagging**: Location pinning
- **Marker Clustering**: Multiple reports
- **Heatmaps**: Hazard density
- **Route Display**: Navigation paths

#### Map Interactions
- **Zoom Controls**: +/- buttons
- **Pan Gesture**: Touch/mouse drag
- **Info Windows**: Location details popup

### 12. **Image Handling**

#### Image Components
- **Image Gallery**: Multiple photo display
- **Image Lightbox**: Full-screen view
- **Image Upload**: Camera/gallery picker
- **Fallback Images**: Placeholder on error

#### Image Optimization
- **Lazy Loading**: Load on scroll
- **Responsive Images**: Multiple sizes
- **Compression**: Optimized file sizes

### 13. **Accessibility Features**

#### ARIA Support
- **Labels**: Screen reader descriptions
- **Roles**: Semantic HTML roles
- **Live Regions**: Dynamic content announcements

#### Keyboard Navigation
- **Tab Order**: Logical focus flow
- **Shortcuts**: Quick actions
- **Focus Indicators**: Visible focus rings

### 14. **Responsive Design**

#### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

#### Layout Patterns
- **Fluid Grid**: Percentage-based columns
- **Stack on Mobile**: Vertical layout
- **Fixed Sidebar**: Desktop only

### 15. **Typography**

#### Font System
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **Font Weights**: 
  - Normal: 400
  - Medium: 500
  - Semibold: 600

#### Heading Styles
- **H1**: Primary page titles
- **H2**: Section headers
- **H3**: Subsection headers
- **H4**: Component titles

### 16. **Feedback Mechanisms**

#### User Feedback
- **Toast Notifications**: Sonner library
- **Alert Messages**: Inline alerts
- **Loading Spinners**: Processing indicators
- **Success Checkmarks**: Confirmation visuals

#### Error Handling
- **Error Boundaries**: Graceful failures
- **Retry Buttons**: User-initiated retry
- **Error Messages**: Clear explanations

### 17. **Search & Filter**

#### Search Patterns
- **Live Search**: Instant results
- **Search Icon**: Visual indicator
- **Clear Button**: Quick reset
- **Recent Searches**: Search history

#### Filter Patterns
- **Dropdown Filters**: Category selection
- **Date Range**: Start/end dates
- **Status Filters**: Multi-select options
- **Clear All**: Reset filters button

### 18. **Profile & Settings**

#### Profile Display
- **Avatar**: User photo or initials
- **Info Cards**: Contact details
- **Edit Mode**: Inline editing
- **Photo Upload**: Profile picture change

#### Settings Controls
- **Toggle Switches**: Binary options
- **Radio Options**: Single choice
- **Action Lists**: Settings menu items

### 19. **Emergency Features**

#### Emergency UI
- **SOS Button**: Large, prominent, red
- **Emergency Gradient**: `linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)`
- **Glow Effect**: Pulsing attention-grabber
- **Quick Actions**: One-tap emergency contacts

### 20. **Glassmorphism**

#### Glass Effect
- **Class**: `.glass-effect`
- **Properties**: 
  - Backdrop blur: 10px
  - Semi-transparent background
  - Subtle border
- **Usage**: Overlays, modals, floating panels

---

## Component Library (Shadcn/UI)

### Available Components
- Accordion
- Alert & Alert Dialog
- Avatar
- Badge
- Breadcrumb
- Button
- Calendar
- Card
- Carousel
- Chart
- Checkbox
- Collapsible
- Command
- Context Menu
- Dialog
- Drawer
- Dropdown Menu
- Form
- Hover Card
- Input & Input OTP
- Label
- Menubar
- Navigation Menu
- Pagination
- Popover
- Progress
- Radio Group
- Resizable
- Scroll Area
- Select
- Separator
- Sheet
- Sidebar
- Skeleton
- Slider
- Sonner (Toast)
- Switch
- Table
- Tabs
- Textarea
- Toggle & Toggle Group
- Tooltip

---

## Animation Timing

### Duration Standards
- **Fast**: 150ms - Hover effects, focus states
- **Normal**: 300ms - Transitions, fades
- **Slow**: 400ms - Slide-ins, page transitions
- **Very Slow**: 600ms - Complex animations

### Easing Functions
- **ease-out**: Default for entrances
- **ease-in**: For exits
- **cubic-bezier(0.4, 0, 0.2, 1)**: Smooth transitions

---

## Shadow System

### Shadow Levels
- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` - Subtle elevation
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1)` - Cards, buttons
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1)` - Modals, popovers

### Emergency Shadows
- **emergency-glow**: `0 0 20px rgba(211, 47, 47, 0.3)`
- **emergency-glow:hover**: `0 0 30px rgba(211, 47, 47, 0.5)`

---

## Best Practices

### Performance
- Use skeleton loaders for perceived performance
- Lazy load images and heavy components
- Debounce search inputs
- Implement virtual scrolling for large lists

### Accessibility
- Maintain WCAG AA contrast ratios
- Provide keyboard navigation
- Include ARIA labels
- Test with screen readers

### Responsive Design
- Mobile-first approach
- Touch-friendly target sizes (44px minimum)
- Responsive typography
- Adaptive layouts

### User Experience
- Clear call-to-action buttons
- Consistent navigation patterns
- Helpful error messages
- Loading state feedback
- Confirmation for destructive actions

---

## Integration Notes

### Backend Integration
- Replace mock data with API calls
- Implement proper authentication
- Add error handling for network failures
- Set up real-time WebSocket connections for notifications

### Future Enhancements
- Push notifications (mobile)
- Offline mode support
- Advanced analytics dashboards
- Multi-language support (i18n)
- Dark mode toggle
