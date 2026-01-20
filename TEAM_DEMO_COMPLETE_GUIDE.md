# 🎯 TEAM DEMO SETUP GUIDE - AGENDA QA

## 👥 Temporary Credentials for Your Team

Here are the temporary login credentials for your team members to access the system:

### 🔐 User Accounts Created

| Team Member | Username | Temporary Password | Role | Permissions |
|-------------|----------|-------------------|------|-------------|
| **Rafael Feltrim** (You) | `rafael.feltrim` | `DemoPass123` | Editor/Admin | Full access + admin features |
| **Luiz Müller** | `board_lmuller` | `Suasenha2` | Editor | Create/edit/delete cards |
| **Mauricio Cordeiro** | `board_mcordeiro` | `Suasenha3` | Editor | Create/edit/delete cards |

### 🚀 How to Access

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open your browser:** `http://localhost:3000`

3. **Login with your credentials:**
   - Enter your username (without @agenda-qa.internal)
   - Enter the temporary password
   - Click "Entrar"

## 📋 Basic Features Overview

### 1. **Dashboard Navigation**
- **Top Menu:** Filter cards, search, notifications
- **Columns:** Backlog | Em Progresso | Bloqueado | Concluído
- **Quick Actions:** Create card buttons (+) on each column header

### 2. **Creating Cards**
**As Editor users, you can:**
- Click the **"+"** button on any column header
- Or use the floating **green "+"** button in bottom-right corner
- Fill in:
  - **Title** (required)
  - **Description** (detailed explanation)
  - **Assignee** (responsible person)
  - **Due Date** (deadline)
  - **Tags** (labels for categorization)
  - **Sub-tasks** (break down complex tasks)

### 3. **Working with Cards**
- **Drag & Drop:** Move cards between columns
- **Click to View:** See full details, comments, history
- **Edit:** Modify any card information
- **Delete:** Remove cards (with confirmation)

### 4. **Collaboration Features**
- **Real-time Updates:** Changes sync automatically across all users
- **Comments:** Discuss tasks directly on cards
- **History Tracking:** See who changed what and when
- **Notifications:** Get alerts for mentions and updates

## 🎯 Extra Features Available

### Advanced Functionality
1. **Sprint Management**
   - Create and manage sprints
   - Assign cards to specific sprints
   - Track velocity and progress

2. **Audit Trail**
   - Complete history of all changes
   - Who did what and when
   - Compliance-ready logging

3. **Analytics Dashboard**
   - Team performance metrics
   - Card completion rates
   - Time tracking insights

4. **Meeting Integration**
   - Schedule meetings directly from cards
   - Link meeting outcomes to tasks
   - Automatic task creation from meeting minutes

5. **Evidence Management**
   - Upload supporting documents
   - Link external resources
   - Track artifact versions

## 🔄 Real-time Collaboration Workflow

### Multi-user Scenario
All three team members can work simultaneously:

1. **Rafael** creates a new feature card in Backlog
2. **Luiz** picks up the card and moves it to "Em Progresso"
3. **Mauricio** adds comments and suggestions
4. **Everyone** sees updates instantly without refreshing

### Best Practices for Demo
- Have all team members login simultaneously
- Show drag-and-drop functionality
- Demonstrate real-time commenting
- Highlight the audit trail showing collaboration history

## 🛠 Technical Implementation

### Database Structure
- **Shared Board:** All users work on the same board
- **Automatic Sync:** Changes propagate instantly via Supabase realtime
- **Conflict Resolution:** Built-in handling for simultaneous edits

### Authentication System
- **RBAC (Role-Based Access Control)**
- **Secure Password Storage** (bcrypt hashing)
- **Session Management** via Supabase Auth
- **First Login Experience** with password change prompt

## 📊 Demo Data Included

The setup script creates:
- **9 Demo Cards** distributed across all columns
- **Sample Comments** showing collaboration
- **Audit Logs** demonstrating system tracking
- **Team Structure** with proper assignments

### Sample Cards Created:
- **Backlog:** 4 cards (biometric auth, Jira integration, analytics dashboard, PDF reports)
- **In Progress:** 2 cards (automated testing, UI refactoring)
- **Blocked:** 1 card (legacy system integration)
- **Completed:** 2 cards (project setup, kanban board creation)

## 🔧 Troubleshooting

### Common Issues:
1. **Login Problems:**
   - Ensure using exact username (case-sensitive)
   - Check if server is running on port 3000
   - Clear browser cache/cookies if needed

2. **Sync Issues:**
   - Refresh browser if updates aren't appearing
   - Check internet connection (Supabase requirement)
   - Verify all users are logged in

3. **Permission Errors:**
   - Confirm correct role assignment
   - Editor roles can create/edit all cards
   - Admin has additional system settings access

## 🎉 Ready for Presentation

Your team is now set up with:
✅ 3 synchronized user accounts
✅ Real collaborative board with demo data
✅ Full feature set accessible
✅ Automatic real-time synchronization
✅ Professional presentation-ready interface

**Next Steps:**
1. Run the SQL script in Supabase
2. Start the development server
3. Have all team members login
4. Begin demonstrating collaborative workflow!

---
*Rafael Feltrim - Squad Lead*  
*Agenda QA Team Demo Setup*