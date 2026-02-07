import React, { useState } from 'react';
import { Modal, Input, Select, DatePicker, Tabs, List, Checkbox, Button, Avatar, Upload, Tag, Typography, Timeline } from 'antd';
import { UserOutlined, PaperClipOutlined, SendOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCardStore } from '../../store/cardStore';
import type { Card, CardStatus, Priority } from '../../types';

dayjs.extend(relativeTime);

interface CardDetailModalProps {
    cardId: string | null;
    open: boolean;
    onClose: () => void;
}

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ cardId, open, onClose }) => {
    const { cards, updateCard, addSubTask, toggleSubTask, addComment, deleteComment, addAttachment, deleteAttachment } = useCardStore();
    const card = cards.find(c => c.id === cardId);

    const [commentText, setCommentText] = useState('');
    const [subTaskText, setSubTaskText] = useState('');

    if (!card) return null;

    const handleUpdate = (updates: Partial<Card>) => {
        if (cardId) updateCard(cardId, updates);
    };

    const handleAddSubTask = () => {
        if (subTaskText.trim() && cardId) {
            addSubTask(cardId, subTaskText);
            setSubTaskText('');
        }
    };

    const handleAddComment = () => {
        if (commentText.trim() && cardId) {
            addComment(cardId, commentText, 'current-user'); // Mock user ID
            setCommentText('');
        }
    };

    const items = [
        {
            key: 'subtasks',
            label: `Subtarefas (${card.subTasks.length})`,
            children: (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Adicionar subtarefa..."
                            value={subTaskText}
                            onChange={e => setSubTaskText(e.target.value)}
                            onPressEnter={handleAddSubTask}
                        />
                        <Button type="primary" onClick={handleAddSubTask}>ADD</Button>
                        <Button
                            icon={<span role="img" aria-label="magic">✨</span>}
                            onClick={async () => {
                                if (!card.description && !card.title) return;
                                try {
                                    const { geminiService } = await import('../../services/gemini');
                                    const context = `Title: ${card.title}. Description: ${card.description}`;
                                    const suggestions = await geminiService.generateTaskSuggestions(context);

                                    if (Array.isArray(suggestions)) {
                                        suggestions.forEach(text => {
                                            if (cardId) addSubTask(cardId, text);
                                        });
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                        >
                            IA
                        </Button>
                    </div>
                    <List
                        dataSource={card.subTasks}
                        renderItem={item => (
                            <List.Item>
                                <Checkbox
                                    checked={item.completed}
                                    onChange={() => cardId && toggleSubTask(cardId, item.id)}
                                >
                                    <span className={item.completed ? 'line-through text-gray-400' : ''}>
                                        {item.text}
                                    </span>
                                </Checkbox>
                            </List.Item>
                        )}
                    />
                </div>
            ),
        },
        {
            key: 'comments',
            label: `Comentários (${card.comments.length})`,
            children: (
                <div className="space-y-4">
                    <List
                        itemLayout="horizontal"
                        dataSource={card.comments}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="del"
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        onClick={() => cardId && deleteComment(cardId, item.id)}
                                    />
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined />} />}
                                    title={<Text type="secondary" className="text-xs">{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>}
                                    description={<Text className="text-slate-800">{item.text}</Text>}
                                />
                            </List.Item>
                        )}
                    />
                    <div className="flex gap-2">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            placeholder="Escreva um comentário..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onPressEnter={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment();
                                }
                            }}
                        />
                        <Button type="primary" icon={<SendOutlined />} onClick={handleAddComment} />
                    </div>
                </div>
            ),
        },
        {
            key: 'attachments',
            label: `Anexos (${card.attachments.length})`,
            children: (
                <div className="space-y-4">
                    <Upload
                        beforeUpload={(file) => {
                            if (cardId) {
                                // Mock upload
                                addAttachment(cardId, {
                                    name: file.name,
                                    type: 'file',
                                    url: '#', // Mock URL
                                    uploadedBy: 'current-user'
                                });
                            }
                            return false; // Prevent auto upload
                        }}
                        showUploadList={false}
                    >
                        <Button icon={<PaperClipOutlined />}>Anexar Arquivo</Button>
                    </Upload>
                    <List
                        dataSource={card.attachments}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="del"
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => cardId && deleteAttachment(cardId, item.id)}
                                    />
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<PaperClipOutlined />}
                                    title={<a href={item.url}>{item.name}</a>}
                                    description={<Text type="secondary" className="text-xs">Por {item.uploadedBy} em {dayjs(item.uploadedAt).format('DD/MM/YYYY')}</Text>}
                                />
                            </List.Item>
                        )}
                    />
                </div>
            ),
        },
        {
            key: 'history',
            label: 'Histórico',
            children: (
                <Timeline mode="left">
                    {card.history.map(h => (
                        <Timeline.Item key={h.id} label={dayjs(h.timestamp).format('DD/MM/YY HH:mm')}>
                            {h.action} <Text type="secondary">por {h.userId}</Text>
                        </Timeline.Item>
                    ))}
                    <Timeline.Item color="green">Criado em {dayjs(card.createdAt).format('DD/MM/YYYY HH:mm')}</Timeline.Item>
                </Timeline>
            )
        }
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width="95%"
            style={{ maxWidth: 800 }}
            className="responsive-modal"
            footer={null}
            title={
                <Input
                    value={card.title}
                    onChange={e => handleUpdate({ title: e.target.value })}
                    className="text-lg font-bold border-none bg-transparent focus:bg-white px-0 w-full sm:w-3/4"
                    maxLength={100}
                />
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <Text type="secondary" className="text-xs uppercase font-bold mb-2 block">Descrição</Text>
                        <TextArea
                            value={card.description}
                            onChange={e => handleUpdate({ description: e.target.value })}
                            placeholder="Adicione uma descrição detalhada..."
                            autoSize={{ minRows: 3, maxRows: 10 }}
                            className="bg-slate-50 border-slate-200"
                        />
                    </div>

                    <Tabs defaultActiveKey="subtasks" items={items} />
                </div>

                <div className="space-y-6">
                    <div>
                        <Text type="secondary" className="text-xs uppercase font-bold mb-2 block">Status</Text>
                        <Select
                            value={card.status}
                            onChange={(value: CardStatus) => handleUpdate({ status: value })}
                            className="w-full"
                        >
                            <Option value="todo">A Fazer</Option>
                            <Option value="in-progress">Em Progresso</Option>
                            <Option value="done">Concluído</Option>
                            <Option value="blocked">Bloqueado</Option>
                        </Select>
                    </div>

                    <div>
                        <Text type="secondary" className="text-xs uppercase font-bold mb-2 block">Prioridade</Text>
                        <Select
                            value={card.priority}
                            onChange={(value: Priority) => handleUpdate({ priority: value })}
                            className="w-full"
                        >
                            <Option value="low"><Tag color="green">Baixa</Tag></Option>
                            <Option value="medium"><Tag color="orange">Média</Tag></Option>
                            <Option value="high"><Tag color="red">Alta</Tag></Option>
                            <Option value="critical"><Tag color="purple">Crítica</Tag></Option>
                        </Select>
                    </div>

                    <div>
                        <Text type="secondary" className="text-xs uppercase font-bold mb-2 block">Vencimento</Text>
                        <DatePicker
                            className="w-full"
                            format="DD/MM/YYYY"
                            value={card.dueDate ? dayjs(card.dueDate) : null}
                            onChange={date => handleUpdate({ dueDate: date ? date.toISOString() : undefined })}
                        />
                    </div>

                    <div>
                        <Text type="secondary" className="text-xs uppercase font-bold mb-2 block">Tags</Text>
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            placeholder="Tags"
                            value={card.tags}
                            onChange={tags => handleUpdate({ tags })}
                            options={[
                                { value: 'frontend', label: 'Frontend' },
                                { value: 'backend', label: 'Backend' },
                                { value: 'bug', label: 'Bug' },
                            ]}
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <Text type="secondary" className="text-xs flex items-center gap-1">
                            <ClockCircleOutlined /> Atualizado {dayjs(card.updatedAt).fromNow()}
                        </Text>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
