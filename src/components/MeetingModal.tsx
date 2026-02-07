import { ModalForm, ProFormText, ProFormDatePicker, ProFormTimePicker, ProFormSelect, ProFormTextArea, ProFormGroup } from '@ant-design/pro-components';
import { Form } from 'antd';
import { useMeetingStore, type Meeting } from '../store/meetingStore';
import dayjs from 'dayjs';

interface MeetingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues?: Partial<Meeting>;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ open, onOpenChange, initialValues }) => {
    const { saveMeeting } = useMeetingStore();
    const [form] = Form.useForm();

    return (
        <ModalForm
            title={initialValues?.id ? "Editar Reunião" : "Nova Reunião"}
            open={open}
            onOpenChange={onOpenChange}
            form={form}
            initialValues={initialValues}
            modalProps={{
                destroyOnHidden: true,
                centered: true,
                maskClosable: false,
                className: 'rounded-2xl',
                'data-testid': 'meeting-modal',
                style: { maxWidth: 'calc(100vw - 32px)', margin: '16px auto' },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any}
            width="95%"
            style={{ maxWidth: 520 }}
            submitter={{
                searchConfig: {
                    submitText: 'Salvar Reunião',
                    resetText: 'Cancelar',
                },
                submitButtonProps: {
                    className: 'rounded-lg px-6 h-10 font-medium',
                    'data-testid': 'meeting-modal-save',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any,
                resetButtonProps: {
                    className: 'rounded-lg px-6 h-10',
                },
            }}
            onFinish={async (values) => {
                const meetingData = {
                    ...values,
                    date: dayjs(values.date).format('YYYY-MM-DD'),
                    time: dayjs(values.time).format('HH:mm:ss'),
                    status: values.status || 'a-agendar',
                };
                await saveMeeting(meetingData);
                onOpenChange(false);
                return true;
            }}
        >
            <div className="pt-2">
                <ProFormText
                    name="title"
                    label="Título da Reunião"
                    placeholder="Ex: Alinhamento de Sprint"
                    rules={[{ required: true, message: 'O título é obrigatório' }]}
                    fieldProps={{
                        size: 'large',
                        className: 'rounded-lg',
                        'data-testid': 'meeting-title-input'
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any}
                />

                <ProFormGroup>
                    <ProFormDatePicker
                        name="date"
                        label="Data"
                        rules={[{ required: true }]}
                        fieldProps={{
                            size: 'large',
                            className: 'rounded-lg w-full',
                            style: { width: '100%' },
                            'data-testid': 'meeting-date-input'
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any}
                    />
                    <ProFormTimePicker
                        name="time"
                        label="Horário"
                        rules={[{ required: true }]}
                        fieldProps={{
                            size: 'large',
                            className: 'rounded-lg w-full',
                            style: { width: '100%' },
                            'data-testid': 'meeting-time-input'
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any}
                    />
                </ProFormGroup>

                <ProFormSelect
                    name="status"
                    label="Status Atual"
                    options={[
                        { label: 'A Agendar', value: 'a-agendar' },
                        { label: 'Confirmada', value: 'confirmada' },
                        { label: 'Realizada', value: 'realizada' },
                    ]}
                    initialValue="a-agendar"
                    fieldProps={{
                        size: 'large',
                        className: 'rounded-lg',
                        'data-testid': 'meeting-status-select'
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any}
                />

                <ProFormText
                    name="meetingLink"
                    label="Link da Reunião"
                    placeholder="https://meet.google.com/..."
                    fieldProps={{
                        size: 'large',
                        className: 'rounded-lg',
                        'data-testid': 'meeting-link-input'
                    } as any}
                />

                <ProFormTextArea
                    name="description"
                    label={
                        <div className="flex items-center gap-2">
                            <span>Descrição e Notas</span>
                            <button
                                type="button"
                                onClick={async () => {
                                    const title = form.getFieldValue('title');
                                    if (!title) return;

                                    try {
                                        const { geminiService } = await import('../services/gemini');
                                        const suggestion = await geminiService.generateTaskSuggestions(`Agenda for meeting titled: ${title}`);

                                        const currentDesc = form.getFieldValue('description') || '';
                                        const newContent = Array.isArray(suggestion)
                                            ? suggestion.map(s => `- ${s}`).join('\n')
                                            : suggestion;

                                        form.setFieldValue('description', currentDesc ? `${currentDesc}\n\nSuggested Agenda:\n${newContent}` : `Suggested Agenda:\n${newContent}`);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full hover:bg-purple-200 transition-colors flex items-center gap-1"
                            >
                                ✨ Sugerir Pauta
                            </button>
                        </div>
                    }
                    placeholder="Detalhes relevantes sobre a reunião..."
                    fieldProps={{
                        size: 'large',
                        className: 'rounded-lg',
                        autoSize: { minRows: 3, maxRows: 6 },
                        'data-testid': 'meeting-desc-input'
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any}
                />
            </div>
        </ModalForm>
    );
};
