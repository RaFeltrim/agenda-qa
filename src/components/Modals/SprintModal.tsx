import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Space } from 'antd';
import dayjs from 'dayjs';
import type { Sprint } from '../../types';

interface SprintModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: SprintFormValues) => void;
    initialValues?: Sprint;
    loading?: boolean;
}

export interface SprintFormValues {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: Sprint['status'];
}

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

export const SprintModal: React.FC<SprintModalProps> = ({
    open,
    onClose,
    onSubmit,
    initialValues,
    loading = false,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue({
                name: initialValues.name,
                goal: initialValues.goal,
                dateRange: [
                    initialValues.startDate ? dayjs(initialValues.startDate) : null,
                    initialValues.endDate ? dayjs(initialValues.endDate) : null,
                ],
                status: initialValues.status,
            });
        } else if (open) {
            form.resetFields();
            form.setFieldsValue({
                status: 'planning',
                dateRange: [dayjs(), dayjs().add(2, 'week')],
            });
        }
    }, [open, initialValues, form]);

    const handleFinish = (values: any) => {
        const [start, end] = values.dateRange || [];
        const formattedValues: SprintFormValues = {
            name: values.name,
            goal: values.goal,
            startDate: start ? start.toISOString() : '',
            endDate: end ? end.toISOString() : '',
            status: values.status,
        };
        onSubmit(formattedValues);
    };

    return (
        <Modal
            title={initialValues ? 'Editar Sprint' : 'Nova Sprint'}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ status: 'planning' }}
            >
                <Form.Item
                    name="name"
                    label="Nome da Sprint"
                    rules={[{ required: true, message: 'Por favor, insira o nome da sprint' }]}
                >
                    <Input placeholder="Ex: Sprint 23 - MVP" />
                </Form.Item>

                <Form.Item
                    name="goal"
                    label="Objetivo"
                    rules={[{ required: true, message: 'Por favor, defina o objetivo da sprint' }]}
                >
                    <TextArea rows={4} placeholder="Qual a meta principal deste ciclo?" />
                </Form.Item>

                <Form.Item
                    name="dateRange"
                    label="Período"
                    rules={[{ required: true, message: 'Selecione as datas de início e fim' }]}
                >
                    <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item name="status" label="Status">
                    <Select>
                        <Option value="planning">Planejamento</Option>
                        <Option value="active">Ativa</Option>
                        <Option value="completed">Concluída</Option>
                        <Option value="archived">Arquivada</Option>
                    </Select>
                </Form.Item>

                <Form.Item className="mb-0 flex justify-end">
                    <Space className="w-full justify-end">
                        <Button onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {initialValues ? 'Salvar Alterações' : 'Criar Sprint'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};
