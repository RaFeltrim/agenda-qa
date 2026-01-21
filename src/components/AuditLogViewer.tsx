// Audit Log Viewer Component
// Displays comprehensive audit trail of user activities

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Download, 
  User, 
  Clock, 
  Database,
  FileText,
  MessageSquare,
  Archive,
  Trash2,
  Edit3,
  Plus,
  LogIn,
  LogOut,
  X
} from 'lucide-react';
import { AuditService, AuditLogEntry } from '../services/auditService';
// Using native JavaScript Date formatting instead of date-fns

interface AuditLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  entityType?: string;
  entityId?: string;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  isOpen,
  onClose,
  userId,
  entityType,
  entityId
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    table_name: entityType || '',
    user_id: userId || '',
    start_date: '',
    end_date: ''
  });
  const [stats, setStats] = useState<any>({});

  // Load audit logs
  useEffect(() => {
    if (isOpen) {
      loadAuditLogs();
      loadStatistics();
    }
  }, [isOpen, filters]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const auditLogs = await AuditService.getAuditLogs({
        ...filters,
        limit: 100
      });
      setLogs(auditLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const summary = await AuditService.getActivitySummary(
        userId,
        filters.start_date,
        filters.end_date
      );
      setStats(summary);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'INSERT':
      case 'COMMENT_ADD':
      case 'PLUS':
        return <Plus className="w-4 h-4" />;
      case 'UPDATE':
      case 'EDIT':
      case 'COMMENT_EDIT':
        return <Edit3 className="w-4 h-4" />;
      case 'DELETE':
      case 'COMMENT_DELETE':
      case 'TRASH':
        return <Trash2 className="w-4 h-4" />;
      case 'ARCHIVE':
      case 'SPRINT_ARCHIVE':
      case 'CARD_ARCHIVE':
        return <Archive className="w-4 h-4" />;
      case 'DOWNLOAD_KANBAN':
        return <Download className="w-4 h-4" />;
      case 'LOGIN':
        return <LogIn className="w-4 h-4" />;
      case 'LOGOUT':
        return <LogOut className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'INSERT':
      case 'COMMENT_ADD':
      case 'PLUS':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'UPDATE':
      case 'EDIT':
      case 'COMMENT_EDIT':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'DELETE':
      case 'COMMENT_DELETE':
      case 'TRASH':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'ARCHIVE':
      case 'SPRINT_ARCHIVE':
      case 'CARD_ARCHIVE':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'DOWNLOAD_KANBAN':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'LOGIN':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getEntityTypeLabel = (tableName: string) => {
    switch (tableName) {
      case 'cards':
        return 'Card';
      case 'sprints':
        return 'Sprint';
      case 'card_comments':
        return 'Comentário';
      case 'profiles':
        return 'Perfil';
      case 'reports':
        return 'Relatório';
      case 'auth':
        return 'Autenticação';
      default:
        return tableName;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Registro de Auditoria
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ação
              </label>
              <select 
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as ações</option>
                <option value="CREATE">Criação</option>
                <option value="UPDATE">Edição</option>
                <option value="DELETE">Exclusão</option>
                <option value="ARCHIVE">Arquivamento</option>
                <option value="COMMENT_ADD">Adição de comentário</option>
                <option value="COMMENT_EDIT">Edição de comentário</option>
                <option value="COMMENT_DELETE">Exclusão de comentário</option>
                <option value="DOWNLOAD_KANBAN">Download de Kanban</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button 
                onClick={loadAuditLogs}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </button>
              <button 
                onClick={() => setFilters({
                  action: '',
                  table_name: entityType || '',
                  user_id: userId || '',
                  start_date: '',
                  end_date: ''
                })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Statistics */}
          {stats.totalActions > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalActions}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">Total de Ações</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Object.keys(stats.actionsByType || {}).length}
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">Tipos de Ações</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.keys(stats.actionsByTable || {}).length}
                </div>
                <div className="text-sm text-purple-800 dark:text-purple-200">Entidades Afetadas</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Object.keys(stats.dailyActivity || {}).length}
                </div>
                <div className="text-sm text-orange-800 dark:text-orange-200">Dias Ativos</div>
              </div>
            </div>
          )}
        </div>

        {/* Audit Logs List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum registro de auditoria encontrado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                              {getEntityTypeLabel(log.table_name)}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Usuário ID: {log.changed_by}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {log.action === 'CREATE' ? 'Criou' :
                             log.action === 'UPDATE' ? 'Editou' :
                             log.action === 'DELETE' ? 'Excluiu' :
                             log.action === 'ARCHIVE' ? 'Arquivou' :
                             log.action === 'COMMENT_ADD' ? 'Adicionou comentário' :
                             log.action === 'COMMENT_EDIT' ? 'Editou comentário' :
                             log.action === 'COMMENT_DELETE' ? 'Excluiu comentário' :
                             log.action === 'DOWNLOAD_KANBAN' ? 'Baixou relatório Kanban' :
                             log.action === 'LOGIN' ? 'Realizou login' :
                             log.action === 'LOGOUT' ? 'Realizou logout' :
                             log.action}
                            {' '}
                            {log.additional_info?.entity_type && 
                              `${getEntityTypeLabel(log.additional_info.entity_type)}`
                            }
                            {log.additional_info?.operation && 
                              ` (${log.additional_info.operation})`
                            }
                          </p>

                          {log.new_values && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-600 p-2 rounded mt-2">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-2 space-x-4">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(log.created_at).toLocaleString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                second: '2-digit' 
                              })}
                            </div>
                            {log.ip_address && (
                              <div className="flex items-center">
                                <span className="mr-1">IP:</span>
                                {log.ip_address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.action.includes('CREATE') || log.action.includes('ADD') ? 'bg-green-100 text-green-800' :
                          log.action.includes('UPDATE') || log.action.includes('EDIT') ? 'bg-blue-100 text-blue-800' :
                          log.action.includes('DELETE') || log.action.includes('TRASH') ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {logs.length} registros
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;