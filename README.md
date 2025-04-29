# Channel Link Manager - Frontend Architecture

## 🧩 System Overview

Channel Link Manager is a complex broadcast distribution system that manages the routing of multimedia data from shared sources to multiple destinations through configurable "channels." Each channel functions as a distinct **artery** with a unique destination, even when utilizing the same source as other channels.

### Key Modules

* **Dashboard** – System health, bandwidth usage, and channel status monitoring
* **Sources Management** – Management of all incoming streams
* **Channels Management** – Routing content from sources to destinations
* **Destinations Management** – Configuration of content delivery endpoints
* **User Management** – Access control and permissions management

## 🏗️ Architecture

The frontend is built with React, TypeScript, and uses the following core technologies:

* **React + TypeScript** - For the UI and type safety
* **React Query** - For data fetching, caching, and state management
* **React Router** - For navigation and routing
* **WebSocket** - For real-time updates
* **shadcn/ui + Tailwind CSS** - For styling and components

### Key Design Patterns

1. **Service Layer** - API services encapsulate all backend communication
2. **Custom Hooks** - React Query hooks for data fetching and state management
3. **Context Providers** - For global state (auth, WebSocket, theme)
4. **Role-based Access Control** - For restricting access to features based on user roles

## 📡 Data Flow Architecture

### Core Data Flow

1. **API Services** - Handle HTTP communication with backend endpoints
2. **React Query Hooks** - Manage caching, refetching, and optimistic updates
3. **WebSocket Service** - Handles real-time updates
4. **UI Components** - Display data and handle user interactions

### Optimization Strategy

1. **Caching**
   - React Query provides intelligent caching with customizable stale times
   - Long-lived data (sources, destinations, users) has longer stale times
   - Frequently changing data (channel status) has shorter stale times

2. **Smart Polling**
   - Semi-live data polls at appropriate intervals
   - Dashboard: 30 seconds
   - Channel status: 10 seconds
   - Channel bandwidth: 30 seconds

3. **Real-Time Updates**
   - WebSocket connection for instant notifications
   - Updates existing cached data without full refetch
   - Handles events like:
     - `channel_status_update`
     - `bandwidth_alert`
     - `fault_event`
     - `system_alert`

4. **Pagination & Lazy Loading**
   - Custom hooks for paginated data
   - Infinite scroll support
   - Search and filtering with automatic cache invalidation

## 📁 Directory Structure

```
src/
├── components/      # UI Components
│   ├── auth/        # Authentication components
│   ├── dashboard/   # Dashboard components
│   ├── layout/      # Layout components
│   └── ui/          # Base UI components
├── context/         # Context providers
├── hooks/           # Custom hooks
├── pages/           # Page components
├── providers/       # Application providers
├── services/        # API services
└── types/           # TypeScript definitions
```

## 🔑 Key Components

### API Services

Each module has its own service class:

- `ApiService` - Base HTTP client
- `AuthService` - Authentication
- `DashboardService` - Dashboard and system stats
- `SourcesService` - Source management
- `ChannelsService` - Channel management
- `DestinationsService` - Destination management
- `UsersService` - User management
- `WebSocketService` - Real-time updates

### React Query Hooks

Custom hooks for each module:

- `useAuth` - Authentication state and functions
- `useDashboardStatus` - Dashboard stats with real-time updates
- `useSystemAlerts` - System alerts with real-time updates
- `useSources` - Source management with caching
- `useChannels` - Channel management with real-time updates
- `useDestinations` - Destination management
- `useUsers` - User management
- `usePaginatedData` - Generic hook for paginated data

### Context Providers

Global state providers:

- `AuthProvider` - Authentication state
- `WebSocketProvider` - WebSocket connection and events
- `ThemeProvider` - Theme state (light/dark)
- `AppProvider` - Top-level provider that combines all providers

### Protected Routes

Role-based access control:

- `ProtectedRoute` - Component that restricts access based on authentication and role

## 🔄 Real-time Update Flow

The real-time update system uses WebSockets and React Query's cache invalidation:

1. `WebSocketService` connects to the backend WebSocket server
2. `WebSocketProvider` initializes the WebSocket connection and provides a context
3. React Query hooks subscribe to relevant WebSocket events
4. When an event is received, the hook updates the cached data
5. UI components automatically re-render with the updated data

### WebSocket Event Types

- `CHANNEL_STATUS_UPDATE` - Channel status changes
- `BANDWIDTH_ALERT` - Bandwidth threshold crossed
- `FAULT_EVENT` - Channel or system fault
- `SOURCE_STATUS_UPDATE` - Source status changes
- `DESTINATION_STATUS_UPDATE` - Destination status changes
- `SYSTEM_ALERT` - System-wide alerts

## 🔒 Authentication & Authorization

### Authentication Flow

1. User logs in via `AuthService.login()`
2. Backend returns access and refresh tokens
3. Tokens are stored in localStorage
4. `ApiService` automatically adds the token to all requests
5. `AuthProvider` provides authentication state to the app
6. Token refresh is handled automatically by `useTokenRefresh` hook

### Authorization

- Role-based access control via `ProtectedRoute` component
- Three role levels: `admin`, `operator`, `viewer`
- Admin can access all features
- Operator can manage channels, sources, and destinations, but not users
- Viewer can only view information, not modify it

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory:

```
VITE_API_URL=https://api.channellink.example
VITE_WS_URL=wss://api.channellink.example/events
```

### Configuration

The app can be configured via the `src/config.ts` file:

- API base URL
- WebSocket URL
- Polling intervals
- Cache durations

## 📖 Usage Examples

### Fetching Channels with Pagination

```tsx
import { useChannels } from '@/hooks/useChannels';

function ChannelsList() {
  const { 
    data, 
    isLoading, 
    isError,
    page,
    setPageSize,
    goToPage
  } = useChannels({ 
    page: 1,
    pageSize: 10,
    status: 'active'
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading channels</div>;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map(channel => (
            <tr key={channel.id}>
              <td>{channel.name}</td>
              <td>{channel.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination 
        currentPage={page} 
        totalPages={data?.totalPages || 0}
        onPageChange={goToPage}
      />
    </div>
  );
}
```

### Creating a New Channel

```tsx
import { useCreateChannel } from '@/hooks/useChannels';

function CreateChannelForm() {
  const createChannel = useCreateChannel();
  const [name, setName] = useState('');
  const [sourceId, setSourceId] = useState<number | null>(null);
  const [destinationId, setDestinationId] = useState<number | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !sourceId || !destinationId) return;
    
    try {
      await createChannel.mutateAsync({
        name,
        sourceId,
        destinationId,
        mode: 'active',
        broadcastIp: '239.255.0.1',
      });
      
      // Success, clear form
      setName('');
      setSourceId(null);
      setDestinationId(null);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={createChannel.isPending}>
        {createChannel.isPending ? 'Creating...' : 'Create Channel'}
      </button>
    </form>
  );
}
```

### Real-time Channel Status Monitoring

```tsx
import { useChannelStatus } from '@/hooks/useChannels';
import { useWebSocket } from '@/context/WebSocketProvider';

function ChannelStatusMonitor({ channelId }) {
  const { data: status, isLoading } = useChannelStatus(channelId);
  const { isConnected } = useWebSocket();
  
  return (
    <div>
      <div className="connection-status">
        WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      {isLoading ? (
        <div>Loading status...</div>
      ) : (
        <div className={`status ${status?.status}`}>
          <h3>Channel Status: {status?.status}</h3>
          <div>CPU: {status?.cpu}%</div>
          <div>RAM: {status?.ram}%</div>
          <div>Bitrate In: {status?.bitrateIn} Mbps</div>
          <div>Bitrate Out: {status?.bitrateOut} Mbps</div>
          <div>Last Updated: {new Date(status?.lastUpdated).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
```

## 🔧 Extending the Application

### Adding a New Module

1. Create TypeScript types in `src/types/`
2. Create an API service in `src/services/`
3. Create React Query hooks in `src/hooks/`
4. Create UI components in `src/components/`
5. Create a page component in `src/pages/`
6. Add the route to `App.tsx`

### Adding a New WebSocket Event Type

1. Add the event type to `WebSocketEventType` enum in `src/services/websocket-service.ts`
2. Subscribe to the event in the appropriate React Query hook
3. Update the cached data when the event is received

## 📊 Monitoring and Performance

The application includes built-in performance monitoring:

- WebSocket connection status is shown in the UI
- React Query devtools in development mode
- Error tracking and reporting via toast notifications
- Cache hit rate monitoring via React Query

### Performance Optimization Tips

1. Use appropriate stale times for different data types
2. Implement virtualized lists for large data sets
3. Use pagination for API requests
4. Batch updates to minimize re-renders
5. Leverage WebSocket for real-time updates instead of polling when possible

## 🛠️ Troubleshooting

### Common Issues

1. **401 Unauthorized** - Token expired or invalid
   - Check if the user is logged in
   - Try refreshing the token manually
   - Clear local storage and log in again

2. **WebSocket Disconnects**
   - Check network connectivity
   - Ensure the WebSocket server is running
   - Check if the authentication token is valid

3. **Stale Data**
   - Force a refetch with `refetch()` from the hook
   - Check if the WebSocket connection is active
   - Check if the polling interval is appropriate

## 🤝 Contributing

Please follow these guidelines when contributing to the project:

1. Use the existing architecture and patterns
2. Add appropriate documentation
3. Write unit tests for new features
4. Follow the TypeScript and ESLint rules
5. Use the existing UI components when possible

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.