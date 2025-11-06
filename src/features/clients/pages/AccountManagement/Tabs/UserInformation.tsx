import React, { useState, useEffect } from 'react';
import { Avatar, Button, Form, Input, Typography, theme, Upload, Space, App, message, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { UploadFile, UploadChangeParam } from 'antd/es/upload/interface';
import { useAppDispatch } from '@/hooks/redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { updateUserProfile } from '@/stores/slices/user.slice';
import ImgCrop from 'antd-img-crop';

const { Title, Text } = Typography;

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UserInformation: React.FC<{ user?: IUser | null }> = ({ user }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');

  const populateForm = (currentUser: IUser | null) => {
    if (currentUser) {
      form.setFieldsValue({
        fullName: currentUser.fullName,
        phoneNumber: currentUser.phoneNumber,
        email: currentUser.email,
      });
      if (currentUser.avatarUrl) {
        const resolveUrl = (u?: string) => {
          if (!u) return undefined;
          try {
            if (/^https?:\/\//i.test(u)) return u;
            const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
            if (!base) return u;
            return base.replace(/\/$/, '') + (u.startsWith('/') ? u : '/' + u);
          } catch (e) {
            return u;
          }
        };
        const abs = resolveUrl(currentUser.avatarUrl);
        setFileList([
          {
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: abs,
            thumbUrl: abs,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  };

  useEffect(() => {
    if (!isEditing) {
      populateForm(user || null);
    }
  }, [user, form, isEditing]);

  const handleCancel = () => {
    setIsEditing(false);
    setLoading(false);
    populateForm(user || null);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload: IUpdateProfilePayload = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
      };

      if (fileList.length > 0 && fileList[0].originFileObj) {
        payload.avatar = fileList[0].originFileObj as File;
      }

      const actionResult = await dispatch(updateUserProfile(payload));
      unwrapResult(actionResult);

      message.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (err: any) {
      message.error(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = async (info: UploadChangeParam<UploadFile>) => {
    let file = info.file;
    let newFileList = [...info.fileList];

    if (newFileList.length > 0) {
      file = newFileList[newFileList.length - 1];
    }

    if (file.status !== 'removed' && file.originFileObj && !file.thumbUrl && !file.url) {
      try {
        const dataUrl = await getBase64(file.originFileObj as File);
        file.thumbUrl = dataUrl;
      } catch (error) {
        console.error("Lỗi tạo ảnh preview:", error);
      }
    }

    setFileList(newFileList.slice(-1));
  };

  const handlePreview = async (file: UploadFile) => {
    try {
      if (!file.url && !file.thumbUrl && file.originFileObj) {
        file.thumbUrl = await getBase64(file.originFileObj as File);
      }
      const src = (file.url || file.thumbUrl) as string | undefined;
      if (src) {
        setPreviewImage(src);
        setPreviewTitle(file.name || 'Xem ảnh');
        setPreviewOpen(true);
      }
    } catch (e) {
      // ignore preview error
    }
  };


  return (
    <div className="flex w-full flex-col items-center px-4 py-2">
      <Title level={4} style={{ marginBottom: token.marginLG }}>Thông tin cá nhân</Title>

      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: '450px', width: '100%' }}
        onFinish={onFinish}
      >
        <Form.Item name="avatar" className="flex flex-col items-center gap-2">
          <ImgCrop
            rotationSlider
            modalTitle="Chỉnh sửa ảnh đại diện"
            modalOk="Xong"
            modalCancel="Hủy"
          >
            <Upload
              accept="image/*"
              fileList={fileList}
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleUploadChange}
              onPreview={handlePreview}
              showUploadList={false}
              openFileDialogOnClick={isEditing}
            >
              <div className="flex flex-col items-center gap-1">
                <Avatar
                  size={102}
                  src={fileList.length > 0 ? (fileList[0].url || fileList[0].thumbUrl) : undefined}
                  icon={fileList.length === 0 ? <UserOutlined /> : undefined}
                  style={{ cursor: fileList.length > 0 ? 'pointer' : 'default' }}
                  onClick={(e?: React.MouseEvent<HTMLElement>) => {
                    if (!isEditing && fileList.length > 0) {
                      e?.preventDefault();
                      e?.stopPropagation();
                      handlePreview(fileList[0]);
                    }
                  }}
                />
              </div>
            </Upload>
          </ImgCrop>
        </Form.Item>

        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
          centered
        >
          <img alt="avatar-preview" style={{ width: '100%' }} src={previewImage} />
        </Modal>

        <Form.Item name="fullName" label={<Text strong>Họ và tên</Text>}>
          <Input size="large" disabled={!isEditing} />
        </Form.Item>
        <Form.Item name="phoneNumber" label={<Text strong>Số điện thoại</Text>}>
          <Input size="large" disabled={!isEditing} />
        </Form.Item>
        <Form.Item name="email" label={<Text strong>Email</Text>}>
          <Input size="large" readOnly disabled className="!bg-gray-100" />
        </Form.Item>

        <Form.Item className="mt-4 flex justify-center items-center">
          {isEditing ? (
            <Space>
              <Button size="large" onClick={handleCancel}>
                Hủy
              </Button>
              <Button
                className="!bg-indigo-600"
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                Lưu thay đổi
              </Button>
            </Space>
          ) : (
            <Button
              className="!bg-indigo-600"
              type="primary"
              size="large"
              block
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa thông tin
            </Button>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

const UserInformationWithApp: React.FC<{ user?: IUser | null }> = ({ user }) => (
  <App>
    <UserInformation user={user} />
  </App>
);

export default UserInformationWithApp;