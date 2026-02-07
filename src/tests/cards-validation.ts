/**
 * Cards Module Validation Script
 * 
 * This file contains curl commands and browser console scripts to test
 * the cards CRUD operations with audit logging.
 * 
 * =============================================================================
 * PREREQUISITES
 * =============================================================================
 * 
 * 1. Ensure you have a valid Supabase session
 * 2. Get your access token from browser localStorage:
 *    - Open https://agenda-qa.vercel.app/
 *    - Login with valid credentials
 *    - Open DevTools (F12) > Console
 *    - Run: localStorage.getItem('sb-<project-ref>-auth-token')
 * 
 * =============================================================================
 * BROWSER CONSOLE TESTS
 * =============================================================================
 * 
 * Copy and paste these scripts into the browser console while logged in:
 */

// Test 1: Fetch all cards
const test1_fetchCards = `
(async () => {
    const { data, error } = await window.supabase
        .from('cards')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });
    
    if (error) {
        console.error('❌ FAILED - Fetch cards:', error);
        return;
    }
    
    console.log('✅ SUCCESS - Fetched', data?.length || 0, 'cards');
    console.table(data?.slice(0, 5));
})();
`;

// Test 2: Create a test card
const test2_createCard = `
(async () => {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
        console.error('❌ Not logged in');
        return;
    }
    
    const newCard = {
        titulo: 'Test Card - ' + new Date().toISOString(),
        descricao: 'Card created for validation testing',
        status: 'backlog',
        priority: 'medium',
        responsavel_principal: user.id,
        created_by: user.id,
        updated_by: user.id,
        tags: ['test', 'validation'],
        sub_tasks: [],
        comentarios: [],
        anexos: [],
        historico: [],
        version: 1
    };
    
    const { data, error } = await window.supabase
        .from('cards')
        .insert(newCard)
        .select()
        .single();
    
    if (error) {
        console.error('❌ FAILED - Create card:', error);
        return;
    }
    
    console.log('✅ SUCCESS - Created card:', data.id);
    window.__testCardId = data.id;
    console.log('Card ID saved to window.__testCardId');
})();
`;

// Test 3: Update card status (should trigger audit log)
const test3_updateStatus = `
(async () => {
    const cardId = window.__testCardId;
    if (!cardId) {
        console.error('❌ No test card ID. Run test2_createCard first');
        return;
    }
    
    const { data: { user } } = await window.supabase.auth.getUser();
    
    // Update status from backlog to em-progresso
    const { data, error } = await window.supabase
        .from('cards')
        .update({ 
            status: 'em-progresso', 
            updated_at: new Date().toISOString(),
            updated_by: user?.id
        })
        .eq('id', cardId)
        .select()
        .single();
    
    if (error) {
        console.error('❌ FAILED - Update status:', error);
        return;
    }
    
    console.log('✅ SUCCESS - Updated status to:', data.status);
    
    // Insert audit log
    const auditResult = await window.supabase
        .from('audit_logs')
        .insert({
            user_id: user?.id,
            action: 'CARD_STATUS_CHANGE',
            entity_type: 'cards',
            entity_id: cardId,
            details: {
                old_status: 'backlog',
                new_status: 'em-progresso',
                card_title: data.titulo
            }
        });
    
    if (auditResult.error) {
        console.warn('⚠️ Audit log insert failed:', auditResult.error);
    } else {
        console.log('✅ Audit log inserted');
    }
})();
`;

// Test 4: Update card priority (should trigger audit log)
const test4_updatePriority = `
(async () => {
    const cardId = window.__testCardId;
    if (!cardId) {
        console.error('❌ No test card ID. Run test2_createCard first');
        return;
    }
    
    const { data: { user } } = await window.supabase.auth.getUser();
    
    // Update priority from medium to high
    const { data, error } = await window.supabase
        .from('cards')
        .update({ 
            priority: 'high', 
            updated_at: new Date().toISOString(),
            updated_by: user?.id
        })
        .eq('id', cardId)
        .select()
        .single();
    
    if (error) {
        console.error('❌ FAILED - Update priority:', error);
        return;
    }
    
    console.log('✅ SUCCESS - Updated priority to:', data.priority);
    
    // Insert audit log
    const auditResult = await window.supabase
        .from('audit_logs')
        .insert({
            user_id: user?.id,
            action: 'CARD_PRIORITY_CHANGE',
            entity_type: 'cards',
            entity_id: cardId,
            details: {
                old_priority: 'medium',
                new_priority: 'high',
                card_title: data.titulo
            }
        });
    
    if (auditResult.error) {
        console.warn('⚠️ Audit log insert failed:', auditResult.error);
    } else {
        console.log('✅ Audit log inserted');
    }
})();
`;

// Test 5: Verify audit logs were created
const test5_verifyAuditLogs = `
(async () => {
    const cardId = window.__testCardId;
    if (!cardId) {
        console.error('❌ No test card ID. Run test2_createCard first');
        return;
    }
    
    const { data, error } = await window.supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_id', cardId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('❌ FAILED - Fetch audit logs:', error);
        return;
    }
    
    console.log('✅ SUCCESS - Found', data?.length || 0, 'audit logs for this card');
    console.table(data);
})();
`;

// Test 6: Soft delete test card
const test6_deleteCard = `
(async () => {
    const cardId = window.__testCardId;
    if (!cardId) {
        console.error('❌ No test card ID. Run test2_createCard first');
        return;
    }
    
    const { data: { user } } = await window.supabase.auth.getUser();
    
    // Soft delete
    const { error } = await window.supabase
        .from('cards')
        .update({ 
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            updated_by: user?.id
        })
        .eq('id', cardId);
    
    if (error) {
        console.error('❌ FAILED - Delete card:', error);
        return;
    }
    
    console.log('✅ SUCCESS - Soft deleted card:', cardId);
    
    // Insert audit log
    const auditResult = await window.supabase
        .from('audit_logs')
        .insert({
            user_id: user?.id,
            action: 'CARD_DELETED',
            entity_type: 'cards',
            entity_id: cardId,
            details: {
                deleted_at: new Date().toISOString()
            }
        });
    
    if (auditResult.error) {
        console.warn('⚠️ Audit log insert failed:', auditResult.error);
    } else {
        console.log('✅ Audit log inserted');
    }
    
    delete window.__testCardId;
})();
`;

// Test 7: Validate DB schema constraints
const test7_validateConstraints = `
(async () => {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
        console.error('❌ Not logged in');
        return;
    }
    
    // Test invalid status (should fail)
    const { error: statusError } = await window.supabase
        .from('cards')
        .insert({
            titulo: 'Invalid status test',
            status: 'invalid-status', // Invalid!
            responsavel_principal: user.id,
            created_by: user.id
        });
    
    if (statusError) {
        console.log('✅ EXPECTED - Invalid status rejected:', statusError.message);
    } else {
        console.error('❌ UNEXPECTED - Invalid status was accepted!');
    }
    
    // Test valid statuses
    const validStatuses = ['backlog', 'em-progresso', 'bloqueado', 'concluido'];
    console.log('\\nValid DB statuses:', validStatuses.join(', '));
    
    // Test valid priorities
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    console.log('Valid DB priorities:', validPriorities.join(', '));
})();
`;

/**
 * =============================================================================
 * CURL COMMANDS (Alternative for API testing)
 * =============================================================================
 * 
 * Replace <SUPABASE_URL>, <ANON_KEY>, and <ACCESS_TOKEN> with actual values.
 * 
 * # Fetch all cards
 * curl -X GET "<SUPABASE_URL>/rest/v1/cards?deleted_at=is.null&order=updated_at.desc" \
 *   -H "apikey: <ANON_KEY>" \
 *   -H "Authorization: Bearer <ACCESS_TOKEN>"
 * 
 * # Create a card
 * curl -X POST "<SUPABASE_URL>/rest/v1/cards" \
 *   -H "apikey: <ANON_KEY>" \
 *   -H "Authorization: Bearer <ACCESS_TOKEN>" \
 *   -H "Content-Type: application/json" \
 *   -H "Prefer: return=representation" \
 *   -d '{
 *     "titulo": "Test Card via curl",
 *     "status": "backlog",
 *     "priority": "medium",
 *     "responsavel_principal": "<USER_ID>",
 *     "created_by": "<USER_ID>"
 *   }'
 * 
 * # Update card status (PATCH)
 * curl -X PATCH "<SUPABASE_URL>/rest/v1/cards?id=eq.<CARD_ID>" \
 *   -H "apikey: <ANON_KEY>" \
 *   -H "Authorization: Bearer <ACCESS_TOKEN>" \
 *   -H "Content-Type: application/json" \
 *   -H "Prefer: return=representation" \
 *   -d '{
 *     "status": "em-progresso",
 *     "updated_at": "2026-02-06T12:00:00Z"
 *   }'
 * 
 * # Insert audit log
 * curl -X POST "<SUPABASE_URL>/rest/v1/audit_logs" \
 *   -H "apikey: <ANON_KEY>" \
 *   -H "Authorization: Bearer <ACCESS_TOKEN>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "user_id": "<USER_ID>",
 *     "action": "CARD_STATUS_CHANGE",
 *     "entity_type": "cards",
 *     "entity_id": "<CARD_ID>",
 *     "details": {"old_status": "backlog", "new_status": "em-progresso"}
 *   }'
 * 
 * =============================================================================
 * QUICK TEST SEQUENCE
 * =============================================================================
 * 
 * Run these in order in the browser console:
 * 
 * 1. Copy test1_fetchCards script - verify cards load
 * 2. Copy test2_createCard script - create test card
 * 3. Copy test3_updateStatus script - change status + audit
 * 4. Copy test4_updatePriority script - change priority + audit
 * 5. Copy test5_verifyAuditLogs script - verify audit entries
 * 6. Copy test6_deleteCard script - cleanup test data
 * 7. Copy test7_validateConstraints script - verify DB constraints
 * 
 * =============================================================================
 * DRAG-AND-DROP UI TEST
 * =============================================================================
 * 
 * 1. Navigate to https://agenda-qa.vercel.app/dashboard
 * 2. Login as admin/editor user
 * 3. Select a Sprint or view Backlog
 * 4. Drag a card from "A Fazer" to "Em Progresso"
 * 5. Open DevTools Network tab - verify PATCH request
 * 6. Check audit_logs table for CARD_STATUS_CHANGE entry
 * 
 */

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           CARDS MODULE VALIDATION SCRIPT                          ║
╠═══════════════════════════════════════════════════════════════════╣
║ Run these tests in order:                                         ║
║                                                                   ║
║ 1. test1_fetchCards    - Verify cards load from DB                ║
║ 2. test2_createCard    - Create a test card                       ║
║ 3. test3_updateStatus  - Update status + audit log                ║
║ 4. test4_updatePriority  - Update priority + audit log            ║
║ 5. test5_verifyAuditLogs - Check audit entries created            ║
║ 6. test6_deleteCard    - Soft delete test card                    ║
║ 7. test7_validateConstraints - Test DB constraint enforcement     ║
╚═══════════════════════════════════════════════════════════════════╝
`);

export const validationTests = {
    test1_fetchCards,
    test2_createCard,
    test3_updateStatus,
    test4_updatePriority,
    test5_verifyAuditLogs,
    test6_deleteCard,
    test7_validateConstraints
};
