# Chat System Documentation

## Overview

The chat system provides real-time messaging capabilities for both clients and administrators. It includes support for text messages, file sharing, typing indicators, read receipts, and admin management tools.

## Features

### Client Features
- **Real-time messaging** with Socket.io
- **File sharing** (images, documents, PDFs)
- **Typing indicators** and read receipts
- **Message history** with pagination
- **Support chat rooms** for customer service
- **Responsive design** for all devices

### Admin Features
- **Admin dashboard** for managing all chat rooms
- **Priority management** (LOW, MEDIUM, HIGH, URGENT)
- **Status tracking** (ACTIVE, ARCHIVED, CLOSED)
- **Participant management** and role assignment
- **Search and filtering** capabilities
- **Real-time notifications** for new messages

## Database Schema

### ChatRoom
```sql
- id: String (Primary Key)
- name: String (Optional)
- type: String (SUPPORT, GENERAL, ADMIN)
- status: String (ACTIVE, ARCHIVED, CLOSED)
- priority: String (LOW, MEDIUM, HIGH, URGENT)
- lastMessageAt: DateTime
- createdAt: DateTime
- updatedAt: DateTime
```

### ChatParticipant
```sql
- id: String (Primary Key)
- roomId: String (Foreign Key)
- userId: String (Foreign Key)
- role: String (MEMBER, ADMIN, MODERATOR)
- joinedAt: DateTime
- lastReadAt: DateTime
```

### Message
```sql
- id: String (Primary Key)
- roomId: String (Foreign Key)
- userId: String (Foreign Key)
- content: String (Text content)
- type: String (TEXT, IMAGE, FILE, SYSTEM)
- fileUrl: String (Optional)
- fileName: String (Optional)
- fileSize: Int (Optional)
- replyToId: String (Optional, Foreign Key)
- isEdited: Boolean
- editedAt: DateTime (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

### MessageStatus
```sql
- id: String (Primary Key)
- messageId: String (Foreign Key)
- userId: String (Foreign Key)
- status: String (SENT, DELIVERED, READ)
- readAt: DateTime (Optional)
- createdAt: DateTime
```

## API Endpoints

### Chat Rooms
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create new chat room

### Messages
- `GET /api/chat/messages` - Get messages for a room
- `POST /api/chat/messages` - Send new message

### File Upload
- `POST /api/chat/upload` - Upload file for chat

### Socket.io
- `GET /api/socket` - Initialize Socket.io connection

## Socket.io Events

### Client Events
- `join-room` - Join a chat room
- `leave-room` - Leave a chat room
- `send-message` - Send a message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator
- `mark-read` - Mark message as read

### Server Events
- `new-message` - New message received
- `user-typing` - User typing indicator
- `message-read` - Message read status
- `user-joined` - User joined room
- `user-left` - User left room
- `error` - Error occurred

## Usage

### Client Side
```tsx
import ChatInterface from '@/components/chat/ChatInterface'

function ChatPage() {
  return <ChatInterface />
}
```

### Admin Side
```tsx
import AdminChatDashboard from '@/components/chat/AdminChatDashboard'

function AdminChatPage() {
  return <AdminChatDashboard />
}
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=public/uploads
```

### Chat Configuration
```typescript
import { CHAT_CONFIG } from '@/lib/chat-config'

// Use configuration constants
const maxFileSize = CHAT_CONFIG.MAX_FILE_SIZE
const allowedTypes = CHAT_CONFIG.ALLOWED_FILE_TYPES
```

## File Upload

### Supported File Types
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX, XLS, XLSX
- Text: TXT

### File Size Limits
- Maximum: 10MB per file
- Stored in: `public/uploads/chat/`

## Security

### Authentication
- All API endpoints require authentication
- Socket.io connections are authenticated
- File uploads are validated and sanitized

### Authorization
- Users can only access rooms they're participants in
- Admins have access to all support rooms
- File uploads are restricted by type and size

## Performance

### Optimization
- Message pagination for large conversations
- Lazy loading of chat rooms
- Efficient Socket.io event handling
- Database indexing on frequently queried fields

### Caching
- Room metadata cached in memory
- Message status updates are batched
- File URLs are generated on-demand

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis (for rate limiting)
- File storage (local or cloud)

### Steps
1. Run database migrations
2. Set environment variables
3. Install dependencies
4. Build and deploy

### Production Considerations
- Use Redis for Socket.io scaling
- Implement file storage (AWS S3, etc.)
- Set up monitoring and logging
- Configure rate limiting
- Enable HTTPS for WebSocket connections

## Troubleshooting

### Common Issues
1. **Socket.io connection fails**
   - Check NEXT_PUBLIC_SOCKET_URL
   - Verify CORS settings
   - Check network connectivity

2. **File upload fails**
   - Check file size limits
   - Verify file type restrictions
   - Check upload directory permissions

3. **Messages not appearing**
   - Check Socket.io connection
   - Verify room participation
   - Check database connectivity

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=socket.io:*
```

## Future Enhancements

### Planned Features
- Push notifications
- Message encryption
- Voice messages
- Video calls
- Message reactions
- Threaded conversations
- Bot integration
- Analytics dashboard

### Scalability
- Horizontal scaling with Redis
- Database sharding
- CDN for file storage
- Load balancing
- Message queuing
