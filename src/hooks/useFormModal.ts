import { useCallback, useState } from "react";
import type { FormInstance } from "antd";

export interface FormModalOptions<TValues> {
  form: FormInstance<TValues>;
  initialValues?: Partial<TValues>;
  onSubmit: (values: TValues) => Promise<void> | void;
}

export function useFormModal<TValues>(options: FormModalOptions<TValues>) {
  const { form, initialValues, onSubmit } = options;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const show = useCallback((preset?: Partial<TValues>) => {
    form.resetFields();
    const values = { ...(initialValues || {}), ...(preset || {}) } as any;
    form.setFieldsValue(values);
    setOpen(true);
  }, [form, initialValues]);

  const hide = useCallback(() => {
    setOpen(false);
    form.resetFields();
  }, [form]);

  const submit = useCallback(async () => {
    const values = await form.validateFields();
    try {
      setSubmitting(true);
      await onSubmit(values);
      hide();
    } finally {
      setSubmitting(false);
    }
  }, [form, hide, onSubmit]);

  return { open, setOpen, submitting, show, hide, submit } as const;
}
