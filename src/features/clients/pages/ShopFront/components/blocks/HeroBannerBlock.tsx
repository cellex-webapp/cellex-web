import React from 'react';
import { Button, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface HeroBannerBlockProps {
  data?: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    ctaText?: string;
  };
}

const HeroBannerBlock: React.FC<HeroBannerBlockProps> = ({ data }) => {
  const title = data?.title;
  const subtitle = data?.subtitle;
  const ctaText = data?.ctaText;
  const imageUrl = data?.imageUrl;
  const hasContent = title || subtitle || ctaText;

  return (
    <div className="relative w-full min-h-[320px] md:min-h-[420px] overflow-hidden rounded-xl">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={
          imageUrl
            ? { backgroundImage: `url(${imageUrl})` }
            : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
        }
      />

      {/* Overlay — only when there's text content on top of an image */}
      {imageUrl && hasContent && <div className="absolute inset-0 bg-black/30" />}

      {/* Content — only rendered if at least one piece of text exists */}
      {hasContent && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[320px] md:min-h-[420px] px-6 py-12 text-center text-white">
          {title && (
            <Title
              level={2}
              className="!text-white !mb-3 !text-2xl md:!text-4xl !font-bold"
              style={{ fontFamily: 'var(--shop-font)' }}
            >
              {title}
            </Title>
          )}
          {subtitle && (
            <Text className="!text-white/90 text-base md:text-lg mb-6 max-w-lg">
              {subtitle}
            </Text>
          )}
          {ctaText && (
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              className="h-12 px-8 text-base font-semibold border-none"
              style={{
                backgroundColor: 'var(--shop-primary)',
                color: '#fff',
              }}
            >
              {ctaText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroBannerBlock;
